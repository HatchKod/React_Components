# React Component Authoring Contract

Every component in this repository is embedded as an iframe inside the HatchKod LMS. The LMS cannot see inside the iframe - the **only** way to report a student's result is via `window.parent.postMessage`. If you skip this, the LMS never knows the student finished and the subtopic stays locked.

---

## Mandatory steps for every new component

### Step 1 - Read context params injected by the LMS

The LMS appends `subtopicId` and `taskId` to the iframe URL automatically. Read them at the top of your component:

```js
const params     = new URLSearchParams(window.location.search);
const subtopicId = params.get('subtopicId');
const taskId     = params.get('taskId');
```

These do not need to be displayed to the student. Echo them back in `metadata` (Step 3) so the DB record is cross-referenceable.

---

### Step 2 - Choose a stable `exerciseId`

Pick a human-readable, kebab-case string that uniquely identifies this component. **Never change it after the component is deployed** - it is stored in the database and used for analytics.

Convention: `m{module}-t{topic}-s{subtopic}-{short-description}`

Examples:
```
m1-t1-s1-fullstack-simulator
m1-t1-s2-api-window
m1-t2-s2-chai-stall
m2-t1-s1-variable-explorer
```

---

### Step 3 - Fire `HK_RESULT` via postMessage on completion

Call this **exactly once** when the student has genuinely finished the activity. Do not fire it on every state change - only when `status: 'completed'`.

```js
window.parent.postMessage({
  type:              'HK_RESULT',   // must be exactly this string
  version:           '1',
  exerciseId:        'your-stable-id-from-step-2',
  exerciseType:      'interactive', // see allowed values below
  status:            'completed',

  // Scoring - include if your exercise has a score, omit if not applicable
  score:             3,
  maxScore:          3,

  // Student answers - any shape you want, will be stored as-is
  answers: {
    // put whatever is meaningful for your exercise type here
  },

  // Pass back the context params from Step 1
  metadata: {
    subtopicId: subtopicId,
    taskId:     taskId,
  },

  timeSpentSeconds:  null,           // optional: seconds the student was active
  completedAt:       new Date().toISOString(),
}, '*');
```

The LMS relays this to the backend, saves it to the database, marks the subtopic complete, and awards XP. The student sees the celebration screen and the Next button unlocks.

---

### Step 4 - Handle the `useEffect` pattern correctly

Tie the postMessage call to a state variable that only flips once, not to every render. Wrong pattern causes duplicate DB writes and double XP awards.

**Correct:**
```js
const [submitted, setSubmitted] = useState(false);

// Fire postMessage exactly once when submitted flips to true
useEffect(() => {
  if (!submitted) return;
  window.parent.postMessage({ type: 'HK_RESULT', status: 'completed', ... }, '*');
}, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

// Somewhere in your UI
<button onClick={() => setSubmitted(true)}>Done</button>
```

**Wrong (fires on every re-render):**
```js
// Do NOT do this
if (isComplete) {
  window.parent.postMessage(...);  // called every render
}
```

---

## What the parent does with your postMessage

Understanding this chain helps you send the right data and debug when something doesn't arrive in the database.

### Full flow after `window.parent.postMessage` fires

```
Your component (Netlify/Vercel iframe)
  │
  │  window.parent.postMessage({ type: 'HK_RESULT', ... }, '*')
  │
  ▼
InteractiveTask.jsx - postMessage listener in the LMS frontend
  │  • Receives the message event
  │  • Checks msg.type === 'HK_RESULT' (ignores anything else)
  │  • If msg.status === 'in_progress' → silent save only, returns early
  │  • If msg.status === 'completed'   → proceeds to API call below
  │
  │  POST /api/subtopics/{subtopicId}/interactive-result
  │  Authorization: Bearer <student's JWT token>   ← held by the LMS, not your component
  │  Content-Type: application/json
  │
  ▼
FastAPI backend - /subtopics/{subtopic_id}/interactive-result
  │  • Validates all fields (see validation rules below)
  │  • Verifies the subtopic exists
  │  • Verifies the task is of type 'interactive'
  │  • Verifies the student has module-level access (paid or free)
  │  • Upserts row into interactive_results table
  │  • If completed: updates student_progress, subtopic_completions, awards XP
  │
  ▼
Supabase PostgreSQL
  • interactive_results row written/updated
  • student_progress.is_completed set to true
  • subtopic_completions row written
  • user_activity XP event logged
  • leaderboard_weekly updated
```

The student's `student_id` and `subtopic_id` are **never taken from your component** - they come from the authenticated session and the route URL. Your component cannot forge or influence them. Only the fields you send in the postMessage payload flow into the database.

---

## Exact JSON the parent sends to the backend

When the LMS receives your postMessage, it constructs this request body and POSTs it to the backend on the student's behalf:

```json
{
  "version":           "1",
  "exercise_id":       "<your exerciseId>",
  "exercise_type":     "<your exerciseType>",
  "status":            "completed",
  "score":             3,
  "max_score":         3,
  "answers":           { "...your answers object verbatim..." },
  "metadata":          { "subtopicId": "...", "taskId": "..." },
  "time_spent_seconds": 120,
  "completed_at":      "2026-06-30T10:45:00.000Z"
}
```

Field names change from camelCase (postMessage) to snake_case (API body) automatically - you write `maxScore` in the component, the LMS sends `max_score` to the backend. You do not need to handle this yourself.

---

## Field-to-database column mapping

Every field in your postMessage maps to a specific column in the `interactive_results` table. This is the exact mapping:

| postMessage field | API body field | DB column | Type | Required |
|---|---|---|---|---|
| *(from auth session)* | - | `student_id` | `uuid` | auto |
| *(from route URL)* | - | `subtopic_id` | `uuid` | auto |
| *(from DB task lookup)* | - | `task_id` | `uuid` | auto |
| `exerciseId` | `exercise_id` | `exercise_id` | `text` | **yes** |
| `exerciseType` | `exercise_type` | `exercise_type` | `text` | **yes** |
| `status` | `status` | `status` | `text` | **yes** |
| `score` | `score` | `score` | `numeric` | no |
| `maxScore` | `max_score` | `max_score` | `numeric` | no |
| `answers` | `answers` | `answers` | `jsonb` | no |
| `metadata` | `metadata` | `metadata` | `jsonb` | no |
| `timeSpentSeconds` | `time_spent_seconds` | `time_spent_sec` | `integer` | no |
| `completedAt` | `completed_at` | `completed_at` | `timestamptz` | no |
| *(always now())* | - | `submitted_at` | `timestamptz` | auto |

**`answers` and `metadata` are stored as native JSONB** - not as a serialized string. Postgres stores and indexes them as real JSON so they can be queried later. Whatever object shape you put inside `answers`, it is saved exactly as-is.

**The table has a unique constraint on `(student_id, subtopic_id)`** - re-submitting overwrites the existing row rather than creating a new one. The last submission wins.

---

## Backend validation rules - what will get rejected

The backend validates your payload before writing anything. If any rule fails, the API returns HTTP 400 and nothing is saved. Make sure your component sends valid data.

| Field | Rule | What happens if violated |
|---|---|---|
| `exercise_id` | Must be a non-empty string | 400 - "exercise_id is required" |
| `exercise_type` | Must be one of the 7 allowed values | 400 - "Invalid exercise_type" |
| `status` | Must be `in_progress` or `completed` | 400 - "Invalid status" |
| `score` and `max_score` | If both provided, `score` must be ≤ `max_score` | 400 - "score cannot exceed max_score" |
| subtopic | Must exist in the database | 400 - "Subtopic not found" |
| task | Must have `task_type = 'interactive'` | 400 - "Only for interactive task types" |
| student access | Must have paid or free module access | 403 - "Module access required" |

---

## What triggers XP and subtopic unlock

Sending `status: 'completed'` is not enough on its own - the backend only awards XP and unlocks the Next button on the **first** completion. Subsequent submissions update the `interactive_results` row but do not re-award XP.

| Condition | What happens |
|---|---|
| First ever `status: 'completed'` | DB row written, `student_progress` updated, XP awarded, Next unlocked |
| `status: 'completed'` again (repeat) | DB row updated, **no XP, no duplicate unlock** |
| `status: 'in_progress'` | DB row written/updated, nothing else |

The response body from the backend tells you which case occurred:

```json
// First completion - gamification data present
{ "ok": true, "gamification": { "xp_earned": 20, "new_total_xp": 340, "streak": 5 } }

// Repeat completion - gamification is null
{ "ok": true, "gamification": null }

// In-progress save
{ "ok": true, "gamification": null }
```

The LMS frontend uses the `gamification` value to decide whether to show the celebration screen.

---

## Allowed values

### `exerciseType`
| Value | Use when |
|---|---|
| `interactive` | Animation, simulator, anything that doesn't fit below |
| `mcq` | Multiple choice question |
| `fill-blank` | Fill in the blanks |
| `sequencing` | Student arranges items in order |
| `matching` | Connect left column to right column |
| `drag-drop` | Place items into zones |
| `coding` | In-component code editor (not Judge0) |

### `status`
| Value | When to send |
|---|---|
| `in_progress` | Optional intermediate save (no XP, no unlock) |
| `completed` | Student fully finished - triggers unlock and XP |

---

## Optional: intermediate progress saves

If your exercise is long and you want to save partial progress (e.g. so a page refresh restores state), send `status: 'in_progress'` at key milestones. The LMS saves the `answers` snapshot but does **not** mark the subtopic complete or award XP.

```js
window.parent.postMessage({
  type:         'HK_RESULT',
  version:      '1',
  exerciseId:   'your-stable-id',
  exerciseType: 'interactive',
  status:       'in_progress',   // partial - no completion triggered
  answers:      { stepsCompleted: 2 },
}, '*');
```

---

## `answers` field shapes by type

You decide the shape. These are recommended conventions - not enforced.

**`mcq`**
```js
answers: {
  questionId: 'q1',
  selected:   'B',
  correct:    true,
  allOptions: ['A', 'B', 'C', 'D'],
}
```

**`fill-blank`**
```js
answers: {
  slot_1: { value: 'frontend',  correct: true  },
  slot_2: { value: 'database',  correct: false, expected: 'backend' },
}
```

**`sequencing`**
```js
answers: {
  submitted: ['step_3', 'step_1', 'step_2'],
  expected:  ['step_1', 'step_2', 'step_3'],
  correct:   false,
}
```

**`matching`**
```js
answers: {
  pairs: [
    { left: 'Frontend',  right: 'React',   correct: true },
    { left: 'Backend',   right: 'FastAPI',  correct: true },
  ],
}
```

**`drag-drop`**
```js
answers: {
  placements: { item_jwt: 'zone_auth', item_react: 'zone_frontend' },
  correct:    true,
}
```

**`interactive`** (simulator / free-form)
```js
answers: {
  interactions:  [{ action: 'button_clicked', target: 'send', timestamp: 4200 }],
  finalState:    { scenario: 'chai', stepsCompleted: 3 },
}
```

---

## What NOT to do

- **Do not call the LMS API directly.** The component has no JWT token and the backend will reject unauthenticated requests. The LMS frontend holds the token and makes the API call on the component's behalf after receiving the postMessage.
- **Do not hardcode subtopicId or taskId.** Always read them from URL params (Step 1). The same built component may be embedded in different subtopics.
- **Do not fire `HK_RESULT` with `status: 'completed'` more than once.** The backend is idempotent (no double XP), but the frontend celebration screen will fire twice if you do.
- **Do not change `exerciseId` after deploying.** Historical records in the database reference it.

---

## Minimal working template

```jsx
import { useState, useEffect } from 'react';

export default function MyComponent() {
  const params     = new URLSearchParams(window.location.search);
  const subtopicId = params.get('subtopicId');
  const taskId     = params.get('taskId');

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    window.parent.postMessage({
      type:         'HK_RESULT',
      version:      '1',
      exerciseId:   'mX-tX-sX-your-description',  // change this
      exerciseType: 'interactive',
      status:       'completed',
      score:        null,
      maxScore:     null,
      answers:      {},
      metadata:     { subtopicId, taskId },
      completedAt:  new Date().toISOString(),
    }, '*');
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* your exercise UI */}
      {!submitted && (
        <button onClick={() => setSubmitted(true)}>
          Mark Complete
        </button>
      )}
      {submitted && <p>Done! Results saved.</p>}
    </div>
  );
}
```

---

## Checklist before deploying a new component

- [ ] `exerciseId` is set and follows the `mX-tX-sX-description` convention
- [ ] `exerciseType` is one of the allowed values
- [ ] URL params (`subtopicId`, `taskId`) are read and echoed in `metadata`
- [ ] `HK_RESULT` with `status: 'completed'` fires exactly once on genuine completion
- [ ] The postMessage is inside a `useEffect` tied to a state variable, not inline in render
- [ ] Component builds cleanly (`npm run build`) with no errors
- [ ] Deployed to Vercel and the live URL is pasted into Admin → Course Editor → Hands-on Task → Interactive Component URL
- [ ] `task_type` is set to `Interactive (Iframe)` in the Admin Course Editor for this subtopic
