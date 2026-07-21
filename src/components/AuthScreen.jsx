import { useState } from "react";
import { supabase } from "../supabase.js";
import { DEFAULT_THEME } from "../constants.js";

export function AuthScreen({onGuest}) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const C = DEFAULT_THEME;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! You can now sign in.");
        setMode("signin");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage("Reset email sent! Check your inbox and click the link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  const inp = {width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:"inherit",fontSize:14,boxSizing:"border-box"};
  const lbl = {fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:4};
  const linkBtn = {background:"none",border:"none",color:C.accent,cursor:"pointer",fontFamily:"inherit",fontSize:13,textDecoration:"underline"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Georgia','Times New Roman',serif"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:40,width:360,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:8}}>🧶</div>
          <div style={{fontSize:22,fontWeight:"bold",letterSpacing:1,color:C.text}}>Woolwork</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>Knitting Pattern Studio</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:14}}>
            <label style={lbl}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp}/>
          </div>
          {mode!=="forgot"&&(
            <div style={{marginBottom:6}}>
              <label style={lbl}>Password</label>
              <div style={{position:"relative"}}>
                <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} style={{...inp,paddingRight:40}}/>
                <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:0,lineHeight:1}}>
                  {showPassword?"🙈":"👁"}
                </button>
              </div>
            </div>
          )}
          {mode==="signin"&&(
            <div style={{textAlign:"right",marginBottom:16}}>
              <button type="button" onClick={()=>{setMode("forgot");setError("");setMessage("");}} style={{...linkBtn,fontSize:12}}>Forgot password?</button>
            </div>
          )}
          {mode!=="signin"&&<div style={{marginBottom:16}}/>}
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fdecea",borderRadius:6}}>{error}</div>}
          {message&&<div style={{color:C.green,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#eef6ee",borderRadius:6}}>{message}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:"bold",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
            {loading?"…":mode==="signup"?"Create Account":mode==="forgot"?"Send Reset Email":"Sign In"}
          </button>
        </form>
        <div style={{textAlign:"center",marginTop:18,fontSize:13,color:C.muted}}>
          {mode==="signin"&&<>Don't have an account? <button onClick={()=>{setMode("signup");setError("");setMessage("");}} style={linkBtn}>Sign up</button></>}
          {mode==="signup"&&<>Already have an account? <button onClick={()=>{setMode("signin");setError("");setMessage("");}} style={linkBtn}>Sign in</button></>}
          {mode==="forgot"&&<><button onClick={()=>{setMode("signin");setError("");setMessage("");}} style={linkBtn}>← Back to sign in</button></>}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:20,paddingTop:20,textAlign:"center"}}>
          <button onClick={onGuest} style={{...linkBtn,fontSize:13,color:C.muted}}>Continue without account →</button>
          <div style={{fontSize:11,color:C.muted,marginTop:4,opacity:0.7}}>Your data stays on this device only</div>
        </div>
      </div>
    </div>
  );
}
