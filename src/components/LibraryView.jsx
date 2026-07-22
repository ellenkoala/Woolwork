import { Modal } from "./Modal.jsx";
import { formatFlexDate, parsePurchaseDate, MONTH_NAMES } from "../utils.js";
import { NEEDLE_TYPES, NEEDLE_BRANDS, MM_TO_US, EQUIP_TYPES, YARN_WEIGHTS, YARN_BRANDS, FIBRE_PREPS, FIBER_TYPES } from "../constants.js";

export function LibraryView({
  theme, btnPrimary, btnSecondary, btnDanger, inp, lbl,
  modal, modalData, setModalData, openModal, closeModal,
  libraryView,
  needleLibrary, saveNeedle, deleteNeedle, exportNeedles, importNeedles,
  equipLibrary,  saveTool,   deleteTool,   exportTools,  importTools,
  yarnLibrary,   saveYarn,   deleteYarn,   exportYarn,   importYarn,
  fibreLibrary,  saveFibre,  deleteFibre,  exportFibre,  importFibre,
}) {
  const C = theme;

  return (
    <>
      {modal==="newNeedle"&&(
        <Modal theme={C} title={modalData.editing?"Edit Needle":"Add Needle"} onClose={closeModal} width={440}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Type</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {NEEDLE_TYPES.map(t=>(
                  <button key={t} onClick={()=>setModalData(d=>({...d,nType:t}))}
                    style={{padding:"4px 12px",borderRadius:12,border:(modalData.nType||"Circular")===t?`2px solid ${C.text}`:`1px solid ${C.border}`,background:(modalData.nType||"Circular")===t?C.surface2:C.surface,cursor:"pointer",fontSize:11,fontFamily:"inherit",color:C.text}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div><span style={lbl}>Size (mm)</span>
              <input type="number" step="0.25" min="0.5" placeholder="e.g. 4.0" value={modalData.nMm||""} onChange={e=>setModalData(d=>({...d,nMm:e.target.value,nUS:MM_TO_US[e.target.value]||d.nUS||""}))} style={inp}/>
            </div>
            <div><span style={lbl}>US Size (auto-fills)</span>
              <input placeholder="e.g. 6" value={modalData.nUS||""} onChange={e=>setModalData(d=>({...d,nUS:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Length (cm)</span>
              <input type="number" placeholder="e.g. 80" value={modalData.nLength||""} onChange={e=>setModalData(d=>({...d,nLength:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Material</span>
              <input placeholder="e.g. Steel, Bamboo, Wood" value={modalData.nMaterial||""} onChange={e=>setModalData(d=>({...d,nMaterial:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Brand</span>
              <select value={modalData.nBrand||""} onChange={e=>setModalData(d=>({...d,nBrand:e.target.value,nBrandCustom:""}))} style={inp}>
                <option value="">— select brand —</option>
                {NEEDLE_BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
              {modalData.nBrand==="Other"&&(
                <input placeholder="Brand name" value={modalData.nBrandCustom||""} onChange={e=>setModalData(d=>({...d,nBrandCustom:e.target.value}))} style={{...inp,marginTop:4}}/>
              )}
            </div>
            <div><span style={lbl}>Series / Line</span>
              <input placeholder="e.g. Turbo, Red Lace, Symfonie" value={modalData.nSeries||""} onChange={e=>setModalData(d=>({...d,nSeries:e.target.value}))} style={inp}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={lbl}>Date purchased <span style={{fontWeight:"normal",color:C.muted}}>(optional — fill in as much or as little as you know)</span></span>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="Year e.g. 2023" value={modalData.nPdY||""} onChange={e=>setModalData(d=>({...d,nPdY:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>
                <select value={modalData.nPdM||""} onChange={e=>setModalData(d=>({...d,nPdM:e.target.value,nPdD:""}))} style={{...inp,flex:3,marginBottom:0}}>
                  <option value="">— Month —</option>
                  {MONTH_NAMES.map((mn,i)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{mn}</option>)}
                </select>
                {modalData.nPdM&&(
                  <input placeholder="Day" value={modalData.nPdD||""} onChange={e=>setModalData(d=>({...d,nPdD:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>
                )}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Notes</span>
              <input placeholder="e.g. condition, where purchased" value={modalData.nNotes||""} onChange={e=>setModalData(d=>({...d,nNotes:e.target.value}))} style={inp}/>
            </div>
          </div>
          {/* Interchangeable cord inventory */}
          {(modalData.nType||"Circular")==="Interchangeable Tips"&&(
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:"bold",color:C.text,marginBottom:8}}>Cord lengths</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>
                {(modalData.nCords||[]).map((cord,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1}}><span style={lbl}>Length (cm)</span>
                      <input type="number" placeholder="e.g. 80" value={cord.length||""} onChange={e=>setModalData(d=>{const c=[...(d.nCords||[])];c[i]={...c[i],length:e.target.value};return{...d,nCords:c};})} style={{...inp,marginBottom:0}}/>
                    </div>
                    <div style={{flex:1}}><span style={lbl}>Qty</span>
                      <input type="number" min="1" placeholder="1" value={cord.qty||""} onChange={e=>setModalData(d=>{const c=[...(d.nCords||[])];c[i]={...c[i],qty:e.target.value};return{...d,nCords:c};})} style={{...inp,marginBottom:0}}/>
                    </div>
                    <button onClick={()=>setModalData(d=>({...d,nCords:(d.nCords||[]).filter((_,j)=>j!==i)}))} style={{...btnDanger,fontSize:11,padding:"4px 8px",alignSelf:"flex-end",marginBottom:1}}>✕</button>
                  </div>
                ))}
              </div>
              <button onClick={()=>setModalData(d=>({...d,nCords:[...(d.nCords||[]),{length:"",qty:"1"}]}))} style={{...btnSecondary,fontSize:11,padding:"4px 12px"}}>+ Add cord length</button>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveNeedle} style={btnPrimary}>{modalData.editing?"Save changes":"Add needle"}</button>
          </div>
        </Modal>
      )}

      {modal==="newTool"&&(
        <Modal theme={C} title={modalData.editing?"Edit Tool":"Add Tool"} onClose={closeModal} width={440}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Type</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {EQUIP_TYPES.map(t=>(
                  <button key={t} onClick={()=>setModalData(d=>({...d,eType:t}))}
                    style={{padding:"4px 12px",borderRadius:12,border:(modalData.eType||"Wheel")===t?`2px solid ${C.text}`:`1px solid ${C.border}`,background:(modalData.eType||"Wheel")===t?C.surface2:C.surface,cursor:"pointer",fontSize:11,fontFamily:"inherit",color:C.text}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div><span style={lbl}>Brand</span>
              <input placeholder="e.g. Schacht, Ashford" value={modalData.eBrand||""} onChange={e=>setModalData(d=>({...d,eBrand:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Model</span>
              <input placeholder="e.g. Matchless, Kiwi 3" value={modalData.eModel||""} onChange={e=>setModalData(d=>({...d,eModel:e.target.value}))} style={inp}/>
            </div>
            {(modalData.eType||"Wheel")==="Wheel"&&(
              <div style={{gridColumn:"1/-1"}}><span style={lbl}>Ratios</span>
                <input placeholder="e.g. 6:1, 9:1, 13:1" value={modalData.eRatios||""} onChange={e=>setModalData(d=>({...d,eRatios:e.target.value}))} style={inp}/>
              </div>
            )}
            {["Drop Spindle","Supported Spindle"].includes(modalData.eType||"Wheel")&&(<>
              <div><span style={lbl}>Whorl / Hook sizes</span>
                <input placeholder="e.g. 8g, 12g hooks" value={modalData.eHookSizes||""} onChange={e=>setModalData(d=>({...d,eHookSizes:e.target.value}))} style={inp}/>
              </div>
              <div><span style={lbl}>Weight (g)</span>
                <input type="number" placeholder="e.g. 20" value={modalData.eWeightG||""} onChange={e=>setModalData(d=>({...d,eWeightG:e.target.value}))} style={inp}/>
              </div>
            </>)}
            <div style={{gridColumn:"1/-1"}}>
              <span style={lbl}>Date purchased <span style={{fontWeight:"normal",color:C.muted}}>(optional)</span></span>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="Year e.g. 2023" value={modalData.ePdY||""} onChange={e=>setModalData(d=>({...d,ePdY:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>
                <select value={modalData.ePdM||""} onChange={e=>setModalData(d=>({...d,ePdM:e.target.value,ePdD:""}))} style={{...inp,flex:3,marginBottom:0}}>
                  <option value="">— Month —</option>
                  {MONTH_NAMES.map((mn,i)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{mn}</option>)}
                </select>
                {modalData.ePdM&&<input placeholder="Day" value={modalData.ePdD||""} onChange={e=>setModalData(d=>({...d,ePdD:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Notes</span>
              <input placeholder="e.g. condition, source, accessories" value={modalData.eNotes||""} onChange={e=>setModalData(d=>({...d,eNotes:e.target.value}))} style={inp}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveTool} style={btnPrimary}>{modalData.editing?"Save changes":"Add tool"}</button>
          </div>
        </Modal>
      )}

      {modal==="newYarnEntry"&&(
        <Modal theme={C} title={modalData.editing?"Edit Yarn":"Add Yarn"} onClose={closeModal} width={480}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><span style={lbl}>Brand</span>
              <select value={modalData.yBrand||""} onChange={e=>setModalData(d=>({...d,yBrand:e.target.value,yBrandCustom:""}))} style={inp}>
                <option value="">— select brand —</option>
                {YARN_BRANDS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
              {modalData.yBrand==="Other"&&(
                <input placeholder="Brand name" value={modalData.yBrandCustom||""} onChange={e=>setModalData(d=>({...d,yBrandCustom:e.target.value}))} style={{...inp,marginTop:4}}/>
              )}
            </div>
            <div><span style={lbl}>Colourway</span>
              <input placeholder="e.g. Peacock, Dusty Rose" value={modalData.yColourway||""} onChange={e=>setModalData(d=>({...d,yColourway:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Weight</span>
              <select value={modalData.yWeight||""} onChange={e=>setModalData(d=>({...d,yWeight:e.target.value}))} style={inp}>
                <option value="">— select weight —</option>
                {YARN_WEIGHTS.map(w=><option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div><span style={lbl}>Fibre content</span>
              <input placeholder="e.g. 80% Merino, 20% Silk" value={modalData.yFibre||""} onChange={e=>setModalData(d=>({...d,yFibre:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Yardage / skein</span>
              <input type="number" placeholder="e.g. 400" value={modalData.yYardage||""} onChange={e=>setModalData(d=>({...d,yYardage:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Skein weight (g)</span>
              <input type="number" placeholder="e.g. 100" value={modalData.ySkeinWeight||""} onChange={e=>setModalData(d=>({...d,ySkeinWeight:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Skeins owned</span>
              <input type="number" step="0.5" placeholder="e.g. 3" value={modalData.ySkeins||""} onChange={e=>setModalData(d=>({...d,ySkeins:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Colour swatch</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="color" value={modalData.yColor||"#d4c5b0"} onChange={e=>setModalData(d=>({...d,yColor:e.target.value}))} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                <input value={modalData.yColor||"#d4c5b0"} onChange={e=>setModalData(d=>({...d,yColor:e.target.value}))} style={{...inp,flex:1,marginBottom:0}}/>
              </div>
            </div>
            <div><span style={lbl}>Shop / Source</span>
              <input placeholder="e.g. Woolly Mammoth, Etsy" value={modalData.yShop||""} onChange={e=>setModalData(d=>({...d,yShop:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Price paid</span>
              <input placeholder="e.g. £24.00" value={modalData.yPrice||""} onChange={e=>setModalData(d=>({...d,yPrice:e.target.value}))} style={inp}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={lbl}>Date purchased <span style={{fontWeight:"normal",color:C.muted}}>(optional)</span></span>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="Year e.g. 2024" value={modalData.yPdY||""} onChange={e=>setModalData(d=>({...d,yPdY:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>
                <select value={modalData.yPdM||""} onChange={e=>setModalData(d=>({...d,yPdM:e.target.value,yPdD:""}))} style={{...inp,flex:3,marginBottom:0}}>
                  <option value="">— Month —</option>
                  {MONTH_NAMES.map((mn,i)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{mn}</option>)}
                </select>
                {modalData.yPdM&&<input placeholder="Day" value={modalData.yPdD||""} onChange={e=>setModalData(d=>({...d,yPdD:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Notes</span>
              <input placeholder="e.g. dye lot, where to buy more" value={modalData.yNotes||""} onChange={e=>setModalData(d=>({...d,yNotes:e.target.value}))} style={inp}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveYarn} style={btnPrimary}>{modalData.editing?"Save changes":"Add yarn"}</button>
          </div>
        </Modal>
      )}

      {modal==="newFibre"&&(
        <Modal theme={C} title={modalData.editing?"Edit Fibre":"Add Fibre"} onClose={closeModal} width={440}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Name</span>
              <input placeholder="e.g. Springtime BFL" value={modalData.fName||""} onChange={e=>setModalData(d=>({...d,fName:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Fibre type</span>
              <select value={modalData.fType||""} onChange={e=>setModalData(d=>({...d,fType:e.target.value}))} style={inp}>
                <option value="">— select type —</option>
                {FIBER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><span style={lbl}>Breed / Source</span>
              <input placeholder="e.g. Bluefaced Leicester" value={modalData.fBreed||""} onChange={e=>setModalData(d=>({...d,fBreed:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Dyer / Indie dyer</span>
              <input placeholder="e.g. Fleece Artist" value={modalData.fDyer||""} onChange={e=>setModalData(d=>({...d,fDyer:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Colourway</span>
              <input placeholder="e.g. Forest Floor" value={modalData.fColourway||""} onChange={e=>setModalData(d=>({...d,fColourway:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Weight owned (g)</span>
              <input type="number" placeholder="e.g. 200" value={modalData.fWeightG||""} onChange={e=>setModalData(d=>({...d,fWeightG:e.target.value}))} style={inp}/>
            </div>
            <div><span style={lbl}>Prep</span>
              <select value={modalData.fPrep||""} onChange={e=>setModalData(d=>({...d,fPrep:e.target.value}))} style={inp}>
                <option value="">— select prep —</option>
                {FIBRE_PREPS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Colour swatch</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="color" value={modalData.fColor||"#d4c5b0"} onChange={e=>setModalData(d=>({...d,fColor:e.target.value}))} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:0}}/>
                <input value={modalData.fColor||"#d4c5b0"} onChange={e=>setModalData(d=>({...d,fColor:e.target.value}))} style={{...inp,flex:1,marginBottom:0}}/>
              </div>
            </div>
            <div><span style={lbl}>Shop / Source</span>
              <input placeholder="e.g. Local farm, Ravelry" value={modalData.fShop||""} onChange={e=>setModalData(d=>({...d,fShop:e.target.value}))} style={inp}/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={lbl}>Date purchased <span style={{fontWeight:"normal",color:C.muted}}>(optional)</span></span>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="Year e.g. 2024" value={modalData.fPdY||""} onChange={e=>setModalData(d=>({...d,fPdY:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>
                <select value={modalData.fPdM||""} onChange={e=>setModalData(d=>({...d,fPdM:e.target.value,fPdD:""}))} style={{...inp,flex:3,marginBottom:0}}>
                  <option value="">— Month —</option>
                  {MONTH_NAMES.map((mn,i)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{mn}</option>)}
                </select>
                {modalData.fPdM&&<input placeholder="Day" value={modalData.fPdD||""} onChange={e=>setModalData(d=>({...d,fPdD:e.target.value}))} style={{...inp,flex:2,marginBottom:0}}/>}
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Notes</span>
              <input placeholder="e.g. freshly washed, spinnable condition" value={modalData.fNotes||""} onChange={e=>setModalData(d=>({...d,fNotes:e.target.value}))} style={inp}/>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={saveFibre} style={btnPrimary}>{modalData.editing?"Save changes":"Add fibre"}</button>
          </div>
        </Modal>
      )}

      {libraryView==="needles"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:"24px 24px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:"bold",color:C.text}}>📌 Needle Library</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{needleLibrary.length} needle{needleLibrary.length!==1?"s":""} recorded</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={exportNeedles} style={{...btnSecondary,fontSize:12}}>⬇ Export</button>
              <button onClick={importNeedles} style={{...btnSecondary,fontSize:12}}>⬆ Import</button>
              <button onClick={()=>openModal("newNeedle",{nType:"Circular"})} style={btnPrimary}>+ Add needle</button>
            </div>
          </div>
          {needleLibrary.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:32,marginBottom:12}}>📌</div>
              <div style={{fontSize:15,fontWeight:"bold",marginBottom:6}}>No needles yet</div>
              <div style={{fontSize:13}}>Click "Add needle" to start building your library.</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {NEEDLE_TYPES.map(type=>{
                const needles=needleLibrary.filter(n=>n.type===type).sort((a,b)=>parseFloat(a.sizeMm)-parseFloat(b.sizeMm));
                if(!needles.length)return null;
                return(
                  <div key={type}>
                    <div style={{fontSize:11,fontWeight:"bold",color:C.muted,letterSpacing:1,marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>{type.toUpperCase()}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {needles.map(n=>(
                        <div key={n.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                          <div style={{width:48,height:48,borderRadius:8,background:C.surface2,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{fontSize:15,fontWeight:"bold",color:C.text}}>{n.sizeMm}</span>
                            <span style={{fontSize:9,color:C.muted}}>mm</span>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:"bold",color:C.text}}>
                              {[n.brand,n.series].filter(Boolean).join(" ")||n.material||n.type}
                              {n.sizeUS&&<span style={{fontSize:11,fontWeight:"normal",color:C.muted,marginLeft:6}}>US {n.sizeUS}</span>}
                            </div>
                            <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                              {[n.sizeMm&&`${n.sizeMm}mm`,n.length&&`${n.length}cm`,n.material].filter(Boolean).join(" · ")}
                            </div>
                            {n.purchaseDate&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>Purchased {formatFlexDate(n.purchaseDate)}</div>}
                            {n.notes&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{n.notes}</div>}
                            {n.cords&&n.cords.length>0&&(
                              <div style={{marginTop:4,display:"flex",flexWrap:"wrap",gap:4}}>
                                {n.cords.map((c,i)=>(
                                  <span key={i} style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:C.surface2,border:`1px solid ${C.border}`,color:C.text}}>{c.length}cm{c.qty&&c.qty!=="1"?` ×${c.qty}`:""}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{display:"flex",gap:6,flexShrink:0}}>
                            <button onClick={()=>openModal("newNeedle",{editing:n.id,nType:n.type,nMm:n.sizeMm,nUS:n.sizeUS,nLength:n.length,nMaterial:n.material,nBrand:NEEDLE_BRANDS.includes(n.brand)?n.brand:"Other",nBrandCustom:NEEDLE_BRANDS.includes(n.brand)?"":n.brand,nSeries:n.series||"",...(()=>{const p=parsePurchaseDate(n.purchaseDate);return{nPdY:p.y,nPdM:p.m,nPdD:p.day};})(),nNotes:n.notes,nCords:n.cords?n.cords.map(c=>({...c})):[]})} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Edit</button>
                            <button onClick={()=>deleteNeedle(n.id)} style={{...btnDanger,fontSize:11,padding:"4px 10px"}}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {libraryView==="tools"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:"24px 24px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:"bold",color:C.text}}>🛠 Tools Library</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{equipLibrary.length} item{equipLibrary.length!==1?"s":""} recorded</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={exportTools} style={{...btnSecondary,fontSize:12}}>⬇ Export</button>
              <button onClick={importTools} style={{...btnSecondary,fontSize:12}}>⬆ Import</button>
              <button onClick={()=>openModal("newTool",{eType:"Wheel"})} style={btnPrimary}>+ Add tool</button>
            </div>
          </div>
          {equipLibrary.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:32,marginBottom:12}}>🛠</div>
              <div style={{fontSize:15,fontWeight:"bold",marginBottom:6}}>No tools yet</div>
              <div style={{fontSize:13}}>Click "Add tool" to record your wheels, spindles, and tools.</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {EQUIP_TYPES.map(type=>{
                const items=equipLibrary.filter(e=>e.type===type);
                if(!items.length)return null;
                return(
                  <div key={type}>
                    <div style={{fontSize:11,fontWeight:"bold",color:C.muted,letterSpacing:1,marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>{type.toUpperCase()}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {items.map(e=>(
                        <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:"bold",color:C.text}}>
                              {[e.brand,e.model].filter(Boolean).join(" ")||e.type}
                            </div>
                            <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                              {[e.ratios&&`Ratios: ${e.ratios}`,e.hookSizes&&`Hooks/Whorls: ${e.hookSizes}`,e.weightG&&`${e.weightG}g`].filter(Boolean).join(" · ")}
                            </div>
                            {e.purchaseDate&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>Purchased {formatFlexDate(e.purchaseDate)}</div>}
                            {e.notes&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{e.notes}</div>}
                          </div>
                          <div style={{display:"flex",gap:6,flexShrink:0}}>
                            <button onClick={()=>{const p=parsePurchaseDate(e.purchaseDate);openModal("newTool",{editing:e.id,eType:e.type,eBrand:e.brand,eModel:e.model,eRatios:e.ratios,eHookSizes:e.hookSizes,eWeightG:e.weightG,ePdY:p.y,ePdM:p.m,ePdD:p.day,eNotes:e.notes});}} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Edit</button>
                            <button onClick={()=>deleteTool(e.id)} style={{...btnDanger,fontSize:11,padding:"4px 10px"}}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {libraryView==="yarn"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:"24px 24px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:"bold",color:C.text}}>🧶 Yarn Stash</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{yarnLibrary.length} yarn{yarnLibrary.length!==1?"s":""} recorded</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={exportYarn} style={{...btnSecondary,fontSize:12}}>⬇ Export</button>
              <button onClick={importYarn} style={{...btnSecondary,fontSize:12}}>⬆ Import</button>
              <button onClick={()=>openModal("newYarnEntry",{})} style={btnPrimary}>+ Add yarn</button>
            </div>
          </div>
          {yarnLibrary.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:32,marginBottom:12}}>🧶</div>
              <div style={{fontSize:15,fontWeight:"bold",marginBottom:6}}>No yarn recorded yet</div>
              <div style={{fontSize:13}}>Click "Add yarn" to start building your stash.</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {yarnLibrary.map(y=>(
                <div key={y.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:y.color||"#d4c5b0",border:`2px solid ${C.border}`,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:"bold",color:C.text}}>
                      {[y.brand,y.colourway].filter(Boolean).join(" — ")||"Unnamed yarn"}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                      {[y.weight,y.fibre,y.yardage&&`${y.yardage} yds`,y.skeinWeight&&`${y.skeinWeight}g/skein`,y.skeins&&`${y.skeins} skein${parseFloat(y.skeins)!==1?"s":""}`].filter(Boolean).join(" · ")}
                    </div>
                    {(y.shop||y.price)&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{[y.shop,y.price].filter(Boolean).join(" · ")}</div>}
                    {y.purchaseDate&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>Purchased {formatFlexDate(y.purchaseDate)}</div>}
                    {y.notes&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{y.notes}</div>}
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>{const p=parsePurchaseDate(y.purchaseDate);openModal("newYarnEntry",{editing:y.id,yBrand:YARN_BRANDS.includes(y.brand)?y.brand:"Other",yBrandCustom:YARN_BRANDS.includes(y.brand)?"":y.brand,yColourway:y.colourway,yWeight:y.weight,yFibre:y.fibre,yYardage:y.yardage,ySkeinWeight:y.skeinWeight,ySkeins:y.skeins,yColor:y.color,yPdY:p.y,yPdM:p.m,yPdD:p.day,yShop:y.shop,yPrice:y.price,yNotes:y.notes});}} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Edit</button>
                    <button onClick={()=>deleteYarn(y.id)} style={{...btnDanger,fontSize:11,padding:"4px 10px"}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {libraryView==="fibre"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:"24px 24px"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:"bold",color:C.text}}>🌿 Fibre Stash</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{fibreLibrary.length} fibre{fibreLibrary.length!==1?"s":""} recorded</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={exportFibre} style={{...btnSecondary,fontSize:12}}>⬇ Export</button>
              <button onClick={importFibre} style={{...btnSecondary,fontSize:12}}>⬆ Import</button>
              <button onClick={()=>openModal("newFibre",{})} style={btnPrimary}>+ Add fibre</button>
            </div>
          </div>
          {fibreLibrary.length===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:32,marginBottom:12}}>🌿</div>
              <div style={{fontSize:15,fontWeight:"bold",marginBottom:6}}>No fibre recorded yet</div>
              <div style={{fontSize:13}}>Click "Add fibre" to record your raw fibre stash.</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {fibreLibrary.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                  <div style={{width:40,height:40,borderRadius:6,background:f.color||"#d4c5b0",border:`2px solid ${C.border}`,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:"bold",color:C.text}}>
                      {f.name||[f.type,f.breed].filter(Boolean).join(" — ")||"Unnamed fibre"}
                    </div>
                    {f.name&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{[f.type,f.breed].filter(Boolean).join(" — ")}</div>}
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>
                      {[f.dyer&&`Dyer: ${f.dyer}`,f.colourway,f.weightG&&`${f.weightG}g`,f.prep].filter(Boolean).join(" · ")}
                    </div>
                    {f.shop&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{f.shop}</div>}
                    {f.purchaseDate&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>Purchased {formatFlexDate(f.purchaseDate)}</div>}
                    {f.notes&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{f.notes}</div>}
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>{const p=parsePurchaseDate(f.purchaseDate);openModal("newFibre",{editing:f.id,fName:f.name||"",fType:f.type,fBreed:f.breed,fDyer:f.dyer,fColourway:f.colourway,fWeightG:f.weightG,fPrep:f.prep,fColor:f.color,fPdY:p.y,fPdM:p.m,fPdD:p.day,fShop:f.shop,fNotes:f.notes});}} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Edit</button>
                    <button onClick={()=>deleteFibre(f.id)} style={{...btnDanger,fontSize:11,padding:"4px 10px"}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
