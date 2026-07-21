import { useState } from "react";
import { supabase } from "../supabase.js";
import { DEFAULT_THEME } from "../constants.js";

export function ResetPasswordScreen({onDone}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const C = DEFAULT_THEME;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    onDone();
  }

  const inp = {width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:"inherit",fontSize:14,boxSizing:"border-box"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Georgia','Times New Roman',serif"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:40,width:360,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:40,marginBottom:8}}>🧶</div>
          <div style={{fontSize:22,fontWeight:"bold",letterSpacing:1,color:C.text}}>Woolwork</div>
          <div style={{fontSize:13,color:C.muted,marginTop:4}}>Set a new password</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:4}}>New Password</label>
            <div style={{position:"relative"}}>
              <input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} style={{...inp,paddingRight:40}}/>
              <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:0,lineHeight:1}}>
                {showPassword?"🙈":"👁"}
              </button>
            </div>
          </div>
          {error&&<div style={{color:C.red,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fdecea",borderRadius:6}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:"bold",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
            {loading?"…":"Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
