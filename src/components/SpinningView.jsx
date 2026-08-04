import { Modal } from "./Modal.jsx";
import { contrastText, today, fiberDisplay } from "../utils.js";

export function SpinningView({
  theme, btnPrimary, btnSecondary, btnDanger, inp, lbl,
  modal, modalData, setModalData, openModal, closeModal,
  allSpinStatuses, allFiberTypes, allSpinTools,
  spinView, setSpinView,
  editingSpinProject, setEditingSpinProject,
  spinSearch, setSpinSearch,
  spinFilterStatus, setSpinFilterStatus,
  spinLogDate, setSpinLogDate,
  spinLogHours, setSpinLogHours,
  spinLogGSpun, setSpinLogGSpun,
  spinLogNote, setSpinLogNote,
  spinPhotoInputRef,
  spinProjects, setSpinProjects,
  activeSpinId, setActiveSpinId,
  activeSpinProject, filteredSpinProjects,
  updateSpinProject, saveSpinProject, addSpinLogEntry, addSpinPhoto,
}) {
  const C = theme;

  return (
    <>
      {/* New / Edit spinning project */}
      {modal==="newSpinProject"&&(
        <Modal theme={C} title={editingSpinProject?"Edit Spinning Project":"New Spinning Project"} onClose={()=>{closeModal();setEditingSpinProject(null);}} width={520}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Project Name *</span><input autoFocus value={modalData.spName||""} onChange={e=>setModalData(d=>({...d,spName:e.target.value}))} style={inp} onKeyDown={e=>{if(e.key==="Enter")saveSpinProject();}}/></div>
            {/* Fibre blend */}
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={lbl}>Fibre{(modalData.spFibers||[]).length>1?"s (blend)":""}</span>
                {(()=>{const total=(modalData.spFibers||[]).reduce((s,f)=>s+(+f.pct||0),0);return total>0&&total!==100?<span style={{fontSize:10,color:total>100?"#c0504a":"#c07830",fontWeight:"bold"}}>{total}% / 100%</span>:<span style={{fontSize:10,color:C.muted}}>{total>0?`${total}%`:""}</span>;})()}
              </div>
              {(modalData.spFibers||[{type:"",pct:100}]).map((f,i,arr)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 72px 28px",gap:6,marginBottom:6,alignItems:"center"}}>
                  <select value={f.type} onChange={e=>setModalData(d=>{const fs=[...(d.spFibers||[{type:"",pct:100}])];fs[i]={...fs[i],type:e.target.value};return{...d,spFibers:fs};})} style={inp}>
                    <option value="">Select fibre…</option>
                    {allFiberTypes.map(ft=><option key={ft}>{ft}</option>)}
                  </select>
                  <div style={{position:"relative"}}>
                    <input type="number" min="1" max="100" placeholder="%" value={f.pct===100&&arr.length===1?"":f.pct} onChange={e=>setModalData(d=>{const fs=[...(d.spFibers||[{type:"",pct:100}])];fs[i]={...fs[i],pct:Math.max(1,Math.min(100,+e.target.value||1))};return{...d,spFibers:fs};})} style={{...inp,paddingRight:18}}/>
                    <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:11,color:C.muted,pointerEvents:"none"}}>%</span>
                  </div>
                  <button onClick={()=>setModalData(d=>{const fs=(d.spFibers||[{type:"",pct:100}]).filter((_,j)=>j!==i);return{...d,spFibers:fs.length?fs:[{type:"",pct:100}]};})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",color:C.muted,fontSize:14,padding:"2px 6px",lineHeight:1}} title="Remove">✕</button>
                </div>
              ))}
              <button onClick={()=>setModalData(d=>{const fs=d.spFibers||[{type:"",pct:100}];return{...d,spFibers:[...fs,{type:"",pct:""}]};})} style={{...btnSecondary,fontSize:11,padding:"4px 10px",marginTop:2}}>+ Add fibre</button>
            </div>
            <div><span style={lbl}>Purchased Weight (g)</span><input type="number" min="0" value={modalData.spFiberWeight||""} onChange={e=>setModalData(d=>({...d,spFiberWeight:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Source / Dyer</span><input value={modalData.spSource||""} onChange={e=>setModalData(d=>({...d,spSource:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Colorway</span><input value={modalData.spColorway||""} onChange={e=>setModalData(d=>({...d,spColorway:e.target.value}))} style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Purchase Place</span><input placeholder="e.g. Fibre East, local show, online…" value={modalData.spPurchasePlace||""} onChange={e=>setModalData(d=>({...d,spPurchasePlace:e.target.value}))} style={inp}/></div>
            {/* Tool */}
            <div style={{gridColumn:"1/-1",borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:2}}><span style={{...lbl,letterSpacing:1}}>TOOL</span></div>
            <div><span style={lbl}>Tool</span><select value={modalData.spTool||"Wheel"} onChange={e=>setModalData(d=>({...d,spTool:e.target.value}))} style={inp}>{allSpinTools.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><span style={lbl}>Tool Details</span><input placeholder="Wheel name, spindle weight…" value={modalData.spToolDetails||""} onChange={e=>setModalData(d=>({...d,spToolDetails:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Ratio / Whorl</span><input placeholder="e.g. 9:1" value={modalData.spRatio||""} onChange={e=>setModalData(d=>({...d,spRatio:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Plies</span><input type="number" min="1" max="8" value={modalData.spPlies||2} onChange={e=>setModalData(d=>({...d,spPlies:+e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Target Yardage</span><input type="number" min="0" value={modalData.spTargetYardage||""} onChange={e=>setModalData(d=>({...d,spTargetYardage:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Status</span><select value={modalData.spStatus||"Active"} onChange={e=>setModalData(d=>({...d,spStatus:e.target.value}))} style={inp}>{allSpinStatuses.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{marginBottom:14}}><span style={lbl}>Short Description</span><input value={modalData.spDesc||""} onChange={e=>setModalData(d=>({...d,spDesc:e.target.value}))} placeholder="e.g. Handspun 3-ply for a shawl, warm autumn colours" style={inp}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{closeModal();setEditingSpinProject(null);}} style={btnSecondary}>Cancel</button>
            <button onClick={saveSpinProject} style={btnPrimary}>{editingSpinProject?"Save":"Create"}</button>
          </div>
        </Modal>
      )}

      {/* Spinning log session */}
      {modal==="spinLog"&&(
        <Modal theme={C} title="Log Spinning Session" onClose={closeModal} width={400}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><span style={lbl}>Date</span><input type="date" value={spinLogDate} onChange={e=>setSpinLogDate(e.target.value)} style={inp}/></div>
            <div><span style={lbl}>Hours</span><input type="number" step="0.5" min="0" value={spinLogHours} onChange={e=>setSpinLogHours(e.target.value)} style={inp}/></div>
            <div><span style={lbl}>Grams Spun</span><input type="number" min="0" value={spinLogGSpun} onChange={e=>setSpinLogGSpun(e.target.value)} style={inp}/></div>
          </div>
          <div style={{marginBottom:12}}><span style={lbl}>Notes</span><input value={spinLogNote} onChange={e=>setSpinLogNote(e.target.value)} style={inp}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={addSpinLogEntry} style={btnPrimary}>Save</button>
          </div>
        </Modal>
      )}

      <div>

        {/* ── Projects list ───────────────────────────────────────── */}
        {spinView==="projects"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{fontSize:16,fontWeight:"bold"}}>Spinning Projects</div>
            <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <input placeholder="🔍 Search…" value={spinSearch} onChange={e=>setSpinSearch(e.target.value)} style={{...inp,width:160,cursor:"text"}}/>
              <select value={spinFilterStatus} onChange={e=>setSpinFilterStatus(e.target.value)} style={{...inp,width:"auto",cursor:"pointer"}}>
                <option value="All">All statuses</option>{allSpinStatuses.map(s=><option key={s}>{s}</option>)}
              </select>
              {spinProjects.length>0&&<button onClick={()=>openModal("export",{exportContext:"spinning-all"})} style={{...btnSecondary,fontSize:11}}>⬇ Export All</button>}
              <button onClick={()=>{setEditingSpinProject(null);openModal("newSpinProject",{spStatus:"Active",spTool:"Wheel",spPlies:2});}} style={btnPrimary}>+ New</button>
            </div>
          </div>
          {filteredSpinProjects.length===0&&<div style={{fontSize:13,color:C.muted,padding:"20px 0"}}>No spinning projects yet. Click "+ New" to start.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filteredSpinProjects.map(sp=>{
              const pct=sp.fiberWeight>0?Math.min(Math.round((sp.gSpun/sp.fiberWeight)*100),100):0;
              const stBg=sp.status==="Finished"?C.green:sp.status==="Plying"?"#c09050":C.accent;
              return (
                <div key={sp.id} style={{background:C.surface,border:`1px solid ${activeSpinId===sp.id?C.accent:C.border}`,borderRadius:10,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start",boxShadow:activeSpinId===sp.id?`0 2px 12px ${C.accent}30`:"none"}}>
                  <span style={{fontSize:26,flexShrink:0}}>🪡</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                      <div style={{fontWeight:"bold",fontSize:14}}>{sp.name}</div>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:8,background:stBg,color:contrastText(stBg)}}>{sp.status}</span>
                    </div>
                    {sp.description&&<div style={{fontSize:12,color:C.text,marginBottom:3,fontStyle:"italic"}}>{sp.description}</div>}
                    <div style={{fontSize:12,color:C.muted}}>{[fiberDisplay(sp),sp.colorway,sp.fiberWeight?`${sp.fiberWeight}g`:null].filter(Boolean).join(" · ")}</div>
                    <div style={{fontSize:12,color:C.muted}}>{[sp.tool,sp.ratio,sp.plies>1?`${sp.plies}-ply`:null].filter(Boolean).join(" · ")}</div>
                    {sp.fiberWeight>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{width:120,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:C.accent}}/></div><span style={{fontSize:10,color:C.muted}}>{pct}% spun</span></div>}
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <button onClick={()=>{setActiveSpinId(sp.id);setSpinView("detail");}} style={{...btnPrimary,fontSize:11}}>Open</button>
                    <button onClick={()=>{setEditingSpinProject(sp.id);const spFibers=sp.fibers?.length?sp.fibers:(sp.fiberType?[{type:sp.fiberType,pct:100}]:[{type:"",pct:100}]);openModal("newSpinProject",{spName:sp.name,spDesc:sp.description||"",spFibers,spFiberWeight:sp.fiberWeight||"",spSource:sp.source,spColorway:sp.colorway,spPurchasePlace:sp.purchasePlace,spTool:sp.tool||"Wheel",spToolDetails:sp.toolDetails,spRatio:sp.ratio,spPlies:sp.plies||2,spTargetYardage:sp.targetYardage||"",spStatus:sp.status});}} style={{...btnSecondary,fontSize:11}}>Edit</button>
                    <button onClick={()=>setSpinProjects(prev=>prev.filter(x=>x.id!==sp.id))} style={{...btnDanger,fontSize:11}}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* ── Detail view ─────────────────────────────────────────── */}
        {spinView==="detail"&&activeSpinProject&&(
        <div>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
            <button onClick={()=>setSpinView("projects")} style={{...btnSecondary,fontSize:12}}>← Projects</button>
            <div style={{fontSize:16,fontWeight:"bold"}}>{activeSpinProject.name}</div>
            {(()=>{const stBg=activeSpinProject.status==="Finished"?C.green:activeSpinProject.status==="Plying"?"#c09050":C.accent;return<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:stBg,color:contrastText(stBg)}}>{activeSpinProject.status}</span>;})()}
            <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>{setEditingSpinProject(activeSpinId);openModal("newSpinProject",{spName:activeSpinProject.name,spFiberType:activeSpinProject.fiberType,spFiberWeight:activeSpinProject.fiberWeight||"",spSource:activeSpinProject.source,spColorway:activeSpinProject.colorway,spPurchasePlace:activeSpinProject.purchasePlace,spTool:activeSpinProject.tool||"Wheel",spToolDetails:activeSpinProject.toolDetails,spRatio:activeSpinProject.ratio,spPlies:activeSpinProject.plies||2,spTargetYardage:activeSpinProject.targetYardage||"",spStatus:activeSpinProject.status});}} style={{...btnSecondary,fontSize:12}}>Edit Info</button>
              <button onClick={()=>spinPhotoInputRef.current?.click()} style={{...btnSecondary,fontSize:12}}>📷 Photo</button>
              <button onClick={()=>openModal("export",{exportContext:"spinning-project"})} style={{...btnSecondary,fontSize:12}}>⬇ Export</button>
              <button onClick={()=>{setSpinLogDate(today());setSpinLogHours("");setSpinLogGSpun("");setSpinLogNote("");openModal("spinLog");}} style={btnPrimary}>+ Log Session</button>
            </div>
          </div>

          {/* Info + Progress row */}
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:16}}>
            {/* Fibre */}
            <div style={{flex:1,minWidth:180,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:12}}>FIBRE</div>
              {(()=>{
                const sp=activeSpinProject;
                const fibers=sp.fibers?.length?sp.fibers:(sp.fiberType?[{type:sp.fiberType,pct:100}]:[]);
                return <>
                  {fibers.length>0&&<div style={{marginBottom:9}}>
                    <div style={{fontSize:9,color:C.muted,letterSpacing:1,marginBottom:4}}>FIBRE{fibers.length>1?"S":""}</div>
                    {fibers.map((f,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        {fibers.length>1&&<div style={{width:32,height:6,borderRadius:3,background:C.accent,opacity:0.3+(f.pct||0)/100*0.7}}/>}
                        <span style={{fontSize:13}}>{f.type}{fibers.length>1&&f.pct?` — ${f.pct}%`:""}</span>
                      </div>
                    ))}
                  </div>}
                  {[["Purchased",sp.fiberWeight?`${sp.fiberWeight}g`:null],["Source",sp.source],["Colorway",sp.colorway],["Purchased at",sp.purchasePlace]].map(([l,v])=>v?<div key={l} style={{marginBottom:9}}><div style={{fontSize:9,color:C.muted,letterSpacing:1}}>{l.toUpperCase()}</div><div style={{fontSize:13}}>{v}</div></div>:null)}
                </>;
              })()}
            </div>
            {/* Tool */}
            <div style={{flex:1,minWidth:180,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:12}}>TOOL</div>
              {[["Tool",activeSpinProject.tool],["Details",activeSpinProject.toolDetails],["Ratio / Whorl",activeSpinProject.ratio],["Plies",activeSpinProject.plies?`${activeSpinProject.plies}-ply`:null],["Target Yardage",activeSpinProject.targetYardage?`${activeSpinProject.targetYardage} yds`:null]].map(([l,v])=>v?<div key={l} style={{marginBottom:9}}><div style={{fontSize:9,color:C.muted,letterSpacing:1}}>{l.toUpperCase()}</div><div style={{fontSize:13}}>{v}</div></div>:null)}
            </div>
            {/* Process */}
            <div style={{flex:1,minWidth:220,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:12}}>PROCESS</div>
              {(()=>{
                const washYield = activeSpinProject.fiberWeight>0&&activeSpinProject.washedWeight>0
                  ? `${Math.round((activeSpinProject.washedWeight/activeSpinProject.fiberWeight)*100)}% yield` : null;
                const prepBase = activeSpinProject.washedWeight||activeSpinProject.fiberWeight;
                const prepYield = prepBase>0&&activeSpinProject.preparedWeight>0
                  ? `${Math.round((activeSpinProject.preparedWeight/prepBase)*100)}% yield` : null;
                const stageRow=(label,done,children)=>(
                  <div key={label} style={{marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:done?C.green:C.surface2,border:`2px solid ${done?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0}}>{done?"✓":""}</div>
                      <span style={{fontSize:13,color:done?C.text:C.muted}}>{label}</span>
                    </div>
                    {children&&<div style={{paddingLeft:28,marginTop:5}}>{children}</div>}
                  </div>
                );
                const weightRow=(key,val,yld)=>(
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="number" min="0" value={val} onChange={e=>updateSpinProject(activeSpinId,{[key]:+e.target.value})} style={{...inp,width:72,fontSize:12,padding:"4px 8px"}}/>
                    <span style={{fontSize:11,color:C.muted}}>g</span>
                    {yld&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:val>0?C.green+"22":C.surface2,color:val>0?C.green:C.muted}}>{yld}</span>}
                  </div>
                );
                return <>
                  {stageRow("Purchased",activeSpinProject.fiberWeight>0,
                    activeSpinProject.fiberWeight>0&&<span style={{fontSize:12,color:C.muted}}>{activeSpinProject.fiberWeight}g raw weight</span>
                  )}
                  {stageRow("Washed",activeSpinProject.washedWeight>0,
                    weightRow("washedWeight",activeSpinProject.washedWeight||0,washYield||(activeSpinProject.fiberWeight>0?"enter weight to see yield":null))
                  )}
                  {stageRow("Prepared (carded/combed)",activeSpinProject.preparedWeight>0,
                    weightRow("preparedWeight",activeSpinProject.preparedWeight||0,prepYield||(prepBase>0?"enter weight to see yield":null))
                  )}
                  {stageRow("Singles",activeSpinProject.gSpun>0,null)}
                  {stageRow("Plying",activeSpinProject.gPlied>0,null)}
                  {stageRow("Finishing",activeSpinProject.status==="Finished",null)}
                </>;
              })()}
            </div>
            {/* Progress */}
            <div style={{flex:2,minWidth:240,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:12}}>PROGRESS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <span style={lbl}>Spun (g)</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="number" min="0" value={activeSpinProject.gSpun||0} onChange={e=>updateSpinProject(activeSpinId,{gSpun:+e.target.value})} style={{...inp,width:80}}/>
                    {activeSpinProject.fiberWeight>0&&<span style={{fontSize:11,color:C.muted}}>/ {activeSpinProject.fiberWeight}g</span>}
                  </div>
                  {activeSpinProject.fiberWeight>0&&<div style={{marginTop:5,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${Math.min(activeSpinProject.fiberWeight>0?(activeSpinProject.gSpun/activeSpinProject.fiberWeight)*100:0,100)}%`,height:"100%",background:C.accent}}/></div>}
                </div>
                <div>
                  <span style={lbl}>Plied (g)</span>
                  <input type="number" min="0" value={activeSpinProject.gPlied||0} onChange={e=>updateSpinProject(activeSpinId,{gPlied:+e.target.value})} style={{...inp,width:80}}/>
                </div>
                <div>
                  <span style={lbl}>Finished Yardage</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <input type="number" min="0" value={activeSpinProject.finishedYardage||0} onChange={e=>updateSpinProject(activeSpinId,{finishedYardage:+e.target.value})} style={{...inp,width:80}}/>
                    {activeSpinProject.targetYardage>0&&<span style={{fontSize:11,color:C.muted}}>/ {activeSpinProject.targetYardage}</span>}
                  </div>
                </div>
                <div>
                  <span style={lbl}>WPI (wraps/inch)</span>
                  <input type="number" min="0" value={activeSpinProject.wpi||0} onChange={e=>updateSpinProject(activeSpinId,{wpi:+e.target.value})} style={{...inp,width:80}}/>
                </div>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>PHOTOS</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              {(activeSpinProject.photos||[]).map(ph=>(
                <div key={ph.id} style={{position:"relative"}}>
                  <img src={ph.src} alt="spinning" style={{width:110,height:80,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
                  <button onClick={()=>updateSpinProject(activeSpinId,{photos:(activeSpinProject.photos||[]).filter(x=>x.id!==ph.id)})} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              ))}
              <button onClick={()=>spinPhotoInputRef.current?.click()} style={{width:110,height:80,border:`2px dashed ${C.border}`,borderRadius:6,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}>
                <span style={{fontSize:18}}>📷</span>Add photo
              </button>
              <input ref={spinPhotoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={addSpinPhoto}/>
            </div>
          </div>

          {/* Work log */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1}}>WORK LOG</div>
              <button onClick={()=>{setSpinLogDate(today());setSpinLogHours("");setSpinLogGSpun("");setSpinLogNote("");openModal("spinLog");}} style={{...btnSecondary,fontSize:11,padding:"3px 10px",marginLeft:"auto"}}>+ Log</button>
            </div>
            {(!activeSpinProject.log||activeSpinProject.log.length===0)&&<div style={{fontSize:13,color:C.muted}}>No sessions yet.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...(activeSpinProject.log||[])].reverse().map(entry=>(
                <div key={entry.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 15px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{minWidth:80,fontWeight:"bold",fontSize:13}}>{entry.date}</div>
                  <div style={{flex:1,display:"flex",gap:14,flexWrap:"wrap"}}>
                    {entry.hours&&<div style={{fontSize:12,color:C.muted}}>⏱ <strong style={{color:C.text}}>{entry.hours}h</strong></div>}
                    {entry.gSpun&&<div style={{fontSize:12,color:C.muted}}>🪡 <strong style={{color:C.text}}>{entry.gSpun}g</strong> spun</div>}
                    {entry.note&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>{entry.note}</div>}
                  </div>
                  <button onClick={()=>updateSpinProject(activeSpinId,{log:(activeSpinProject.log||[]).filter(x=>x.id!==entry.id)})} style={{...btnDanger,fontSize:11,flexShrink:0}}>Delete</button>
                </div>
              ))}
            </div>
            {activeSpinProject.log?.length>0&&(
              <div style={{marginTop:10,padding:"11px 15px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,display:"flex",gap:20,flexWrap:"wrap"}}>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Sessions: </span><strong>{activeSpinProject.log.length}</strong></div>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Total hours: </span><strong>{activeSpinProject.log.reduce((a,e)=>a+(parseFloat(e.hours)||0),0).toFixed(1)}</strong></div>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Total spun: </span><strong>{activeSpinProject.log.reduce((a,e)=>a+(parseFloat(e.gSpun)||0),0)}g</strong></div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>NOTES</div>
            <textarea value={activeSpinProject.notes||""} onChange={e=>updateSpinProject(activeSpinId,{notes:e.target.value})} style={{...inp,minHeight:120,resize:"vertical",lineHeight:1.8}}/>
          </div>
        </div>
        )}

      </div>
    </>
  );
}
