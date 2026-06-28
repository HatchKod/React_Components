// Temp file: renders only the code block with a mock custom dabba
import { useState } from "react";

const STYLE = `
  body { background:#F9FAFB; margin:0; padding:24px; font-family:system-ui,sans-serif; text-align:left; }
  .full-code { background:#1E293B; color:#E2E8F0; border-radius:8px; padding:20px;
    font-family:'Courier New',Consolas,monospace; font-size:0.85rem; position:relative; overflow-x:auto; }
  .copy-btn { position:absolute; top:10px; right:10px; background:#334155; color:#E2E8F0; border:none;
    border-radius:6px; padding:4px 10px; font-size:0.75rem; cursor:pointer; }
  .kw { color:#60A5FA; } .str { color:#4ADE80; } .num { color:#FB923C; } .cm { color:#6B7280; }
  .tooltip-wrap { position:relative; display:inline; cursor:pointer; }
`;

function Tooltip({ label, tip, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
          background:"#1E293B", color:"#fff", border:"1px solid #475569", borderRadius:6,
          padding:"6px 10px", fontSize:"0.75rem", whiteSpace:"nowrap", zIndex:100 }}>{tip}</span>
      )}
    </span>
  );
}

export default function TestCode() {
  const custom = { type: "String", name: "gymName", value: "Sai Fitness" };

  const L = ({ i = 0, children }) => (
    <div style={{ paddingLeft: `${i * 2}ch`, lineHeight: "1.75", whiteSpace: "pre" }}>{children}</div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="full-code">
        <button className="copy-btn">Copy</button>
        <L><span className="cm">{"// the program's name ↓"}</span></L>
        <L><Tooltip tip="The program's container — everything lives inside here"><span className="kw">public class</span></Tooltip>{" MyFirstProgram {"}</L>
        <L>&nbsp;</L>
        <L i={1}><span className="cm">{"// front door — Java starts here ↓"}</span></L>
        <L i={1}><Tooltip tip="Front door — Java starts reading from here"><span className="kw">public static void main</span></Tooltip>{"("}<span className="kw">String</span>{"[] args) {"}</L>
        <L>&nbsp;</L>
        <L i={2}><span className="cm">{"// your dabbas ↓"}</span></L>
        <L i={2}><span className="kw">String</span>{" name = "}<span className="str">"Ravi"</span>{";"}<span className="cm">{"         // dabba: words"}</span></L>
        <L i={2}><span className="kw">int</span>{" age = "}<span className="num">21</span>{";"}<span className="cm">{"                 // dabba: numbers"}</span></L>
        <L i={2}><span className="kw">String</span>{" city = "}<span className="str">"Karimnagar"</span>{";"}<span className="cm">{"   // dabba: words"}</span></L>
        <L i={2}><span className="kw">String</span>{` gymName = `}<span className="str">"Sai Fitness"</span>{";"}<span className="cm">{" // your dabba"}</span></L>
        <L>&nbsp;</L>
        <L i={2}><span className="cm">{"// Java's mouth — speaks to terminal ↓"}</span></L>
        <L i={2}><Tooltip tip="Java's mouth — prints to the terminal screen"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"My name is \" + name"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
        <L i={2}><Tooltip tip="Java's mouth — prints to the terminal screen"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"My age is \" + age"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
        <L i={2}><Tooltip tip="Java's mouth — prints to the terminal screen"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"I am from \" + city"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
        <L i={2}><Tooltip tip="Java's mouth — prints to the terminal screen"><span className="kw">System.out.println</span></Tooltip>{"("}<span className="str">{"\"gymName = \" + gymName"}</span>{"); "}<span className="cm">{"// speak it on screen"}</span></L>
        <L>&nbsp;</L>
        <L i={1}>{"} "}<span className="cm">{"// close front door"}</span></L>
        <L>&nbsp;</L>
        <L>{"} "}<span className="cm">{"// close program"}</span></L>
      </div>
    </>
  );
}
