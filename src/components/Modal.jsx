export function Modal({title,onClose,children,width=480,theme}){
  const C=theme;
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(2px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:"24px 24px 20px",width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:16,fontWeight:"bold",color:C.text}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
