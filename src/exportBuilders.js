import { STITCH_SHADES, STITCH_TEXT } from "./constants.js";
import { contrastText } from "./utils.js";

export function buildKnittingHTML(project,section,stitchesList,cpLine){
  const sm={};stitchesList.forEach(s=>{sm[s.id]=s;});
  const usedIds=new Set();section.grid.forEach(r=>r.forEach(c=>usedIds.add(c.stitch)));
  const rows=section.rows;const cur=section.currentRow??rows-1;
  let tbl=`<table style="border-collapse:collapse;font-family:monospace">`;
  tbl+=`<tr><td style="width:38px"></td>`;
  for(let ci=0;ci<section.cols;ci++){const n=ci+1;tbl+=`<td style="width:20px;text-align:center;font-size:8px;color:${n%10===0?"#b8834a":"#9a8a7a"};font-family:sans-serif;font-weight:${n%10===0?"bold":"normal"}">${n%10===0?n:n%5===0?"·":""}</td>`;}
  tbl+=`</tr>`;
  section.grid.forEach((row,ri)=>{
    const dispRow=rows-ri;const done=(section.completedRows||[]).includes(ri);const isCur=ri===cur;
    tbl+=`<tr><td style="text-align:right;padding-right:4px;font-size:9px;font-family:sans-serif;color:${isCur?"#b8834a":"#9a8a7a"};font-weight:${isCur?"bold":"normal"}">${dispRow%5===0||isCur?dispRow:""}</td>`;
    row.forEach(cell=>{
      const s=sm[cell.stitch]||sm["empty"]||{symbol:""};
      const yarn=(project.yarnPalette||[]).find(y=>y.id===cell.yarn);
      const bg=cell.stitch==="mistake"?"#fdecea":yarn?yarn.color:(STITCH_SHADES[cell.stitch]||"#e8e0d8");
      const tc=cell.stitch==="mistake"?"#c0504a":yarn?contrastText(yarn.color):(STITCH_TEXT[cell.stitch]||"#3a2a1a");
      const brd=isCur?"1px solid #b8834a":done?"1px solid #8ab88a":"1px solid #c8beb4";
      tbl+=`<td style="background-color:${bg};width:20px;height:20px;min-width:20px;min-height:20px;border:${brd};text-align:center;font-size:11px;color:${tc};font-weight:bold">${s.symbol||""}</td>`;
    });
    tbl+=`<td style="padding-left:3px;font-size:9px;font-family:sans-serif;color:${done?"#6a9a6a":"transparent"}">✓</td></tr>`;
  });
  tbl+=`</table>`;
  const keyItems=stitchesList.filter(s=>usedIds.has(s.id)&&s.id!=="empty").map(st=>{
    const bg=st.shade||STITCH_SHADES[st.id]||"#e8e0d8";const tc=STITCH_TEXT[st.id]||"#333";
    return `<div style="display:flex;align-items:center;gap:5px;font-size:11px;font-family:sans-serif"><div style="width:18px;height:18px;background:${bg};border:1px solid #c8beb4;display:flex;align-items:center;justify-content:center;font-size:10px;color:${tc};font-weight:bold">${(sm[st.id]||st).symbol||""}</div>${(sm[st.id]||st).abbr} — ${(sm[st.id]||st).label}</div>`;
  }).join("");
  const yarnItems=(project.yarnPalette||[]).map(y=>`<div style="display:flex;align-items:center;gap:5px;font-size:11px;font-family:sans-serif"><div style="width:14px;height:14px;border-radius:50%;background:${y.color};border:1px solid #c8beb4"></div>${y.name}</div>`).join("");
  const notesHTML=project.notes?`<div style="margin-top:16px"><div style="font-size:11px;color:#9a8a7a;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #d4c5b0;padding-bottom:6px">Notes</div><div style="font-size:13px;white-space:pre-wrap">${project.notes}</div></div>`:"";
  const cpHtml=cpLine?`<div style="text-align:center;font-size:11px;color:#9a8a7a;margin-top:20px;padding-top:14px;border-top:1px solid #d4c5b0">${cpLine}</div>`:"";
  const sectionLabel=section.name!=="Main Pattern"?`<div style="font-size:13px;color:#b8834a;margin-bottom:6px">Section: ${section.name} (${section.rows}&#215;${section.cols})</div>`:"";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${project.name}</title><style>body{font-family:Georgia,serif;background:#f5f0eb;color:#3a2a1a;margin:0;padding:24px}.card{background:#fff;border:1px solid #d4c5b0;border-radius:8px;padding:24px;margin-bottom:16px}@media print{body{padding:12px}.card{break-inside:avoid}}</style></head><body><div class="card"><h1 style="font-size:22px;margin:0 0 4px">${project.name}</h1>${sectionLabel}<div style="font-size:12px;color:#9a8a7a;margin-bottom:18px">${project.yarn?"&#127745; "+project.yarn:""} ${project.needles?"&#183; "+project.needles:""} &#183; ${project.status}${project.created?" &#183; Created "+project.created:""}</div><div style="overflow-x:auto">${tbl}</div><div style="margin-top:16px"><div style="font-size:11px;color:#9a8a7a;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #d4c5b0;padding-bottom:6px">Stitch Key</div><div style="display:flex;flex-wrap:wrap;gap:10px">${keyItems}${yarnItems}</div></div>${notesHTML}${cpHtml}</div></body></html>`;
}

export function buildSpinningHTML(sp,cpLine){
  const prepBase=sp.washedWeight||sp.fiberWeight;
  const washYld=sp.fiberWeight>0&&sp.washedWeight>0?`${Math.round((sp.washedWeight/sp.fiberWeight)*100)}%`:"&#8212;";
  const prepYld=prepBase>0&&sp.preparedWeight>0?`${Math.round((sp.preparedWeight/prepBase)*100)}%`:"&#8212;";
  const logRows=(sp.log||[]).map(e=>`<tr><td>${e.date}</td><td>${e.hours?e.hours+"h":"&#8212;"}</td><td>${e.gSpun?e.gSpun+"g":"&#8212;"}</td><td>${e.note||""}</td></tr>`).join("");
  const logTotal=sp.log?.length?`<tr style="font-weight:bold;background:#f5f0eb"><td>Total</td><td>${(sp.log||[]).reduce((a,e)=>a+(parseFloat(e.hours)||0),0).toFixed(1)}h</td><td>${(sp.log||[]).reduce((a,e)=>a+(parseFloat(e.gSpun)||0),0)}g</td><td></td></tr>`:"";
  const photos=(sp.photos||[]).map(ph=>`<img src="${ph.src}" style="width:120px;height:90px;object-fit:cover;border-radius:4px;border:1px solid #d4c5b0" alt="photo"/>`).join(" ");
  const stBg=sp.status==="Finished"?"#6a9a6a":sp.status==="Plying"?"#c09050":"#b8834a";
  const cpHtml=cpLine?`<div style="text-align:center;font-size:11px;color:#9a8a7a;margin-top:20px;padding-top:14px;border-top:1px solid #d4c5b0">${cpLine}</div>`:"";
  const h2=t=>`<div style="font-size:11px;color:#9a8a7a;letter-spacing:1px;text-transform:uppercase;margin:18px 0 8px;padding-bottom:6px;border-bottom:1px solid #d4c5b0">${t}</div>`;
  const item=(l,v)=>v!=null&&v!==""?`<div style="margin-bottom:9px"><div style="font-size:9px;color:#9a8a7a;letter-spacing:1px;text-transform:uppercase">${l}</div><div style="font-size:13px">${v}</div></div>`:"";
  const g2=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px">`;
  const fibers=sp.fibers?.length?sp.fibers:(sp.fiberType?[{type:sp.fiberType,pct:100}]:[]);
  const fiberHTML=fibers.length>1
    ?fibers.map(f=>`<div style="font-size:13px">${f.pct?`<strong>${f.pct}%</strong> `:""} ${f.type}</div>`).join("")
    :fibers[0]?.type||"";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${sp.name} &#8212; Spinning</title><style>body{font-family:Georgia,serif;background:#f5f0eb;color:#3a2a1a;margin:0;padding:24px}.card{background:#fff;border:1px solid #d4c5b0;border-radius:8px;padding:24px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px}th{background:#ede5da;padding:6px 10px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9a8a7a}td{padding:6px 10px;border-bottom:1px solid #ede5da}@media print{body{padding:12px}.card{break-inside:avoid}}</style></head><body><div class="card"><h1 style="font-size:22px;margin:0 0 4px">${sp.name}</h1><div style="font-size:12px;color:#9a8a7a;margin-bottom:18px">Created ${sp.created||""} &#183; <span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:bold;background:${stBg};color:#fff">${sp.status}</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">${h2("Fibre")+g2+`<div style="margin-bottom:9px"><div style="font-size:9px;color:#9a8a7a;letter-spacing:1px;text-transform:uppercase">${fibers.length>1?"BLEND":"TYPE"}</div>${typeof fiberHTML==="string"?`<div style="font-size:13px">${fiberHTML}</div>`:fiberHTML}</div>`+item("Purchased Weight",sp.fiberWeight?sp.fiberWeight+"g":"")+item("Source / Dyer",sp.source)+item("Colorway",sp.colorway)+item("Purchased at",sp.purchasePlace)+"</div>"+h2("Tool")+g2+item("Tool",sp.tool)+item("Details",sp.toolDetails)+item("Ratio / Whorl",sp.ratio)+item("Plies",sp.plies?sp.plies+"-ply":"")+item("Target Yardage",sp.targetYardage?sp.targetYardage+" yds":"")+"</div>"}</div>${h2("Processing")}<table><tr><th>Stage</th><th>Weight</th><th>Yield</th></tr><tr><td>Purchased (raw)</td><td>${sp.fiberWeight||"&#8212;"}g</td><td>&#8212;</td></tr><tr><td>After Washing</td><td>${sp.washedWeight?sp.washedWeight+"g":"not recorded"}</td><td>${washYld}</td></tr><tr><td>After Prep (carding/combing)</td><td>${sp.preparedWeight?sp.preparedWeight+"g":"not recorded"}</td><td>${prepYld}</td></tr></table>${h2("Progress")}${g2}${item("Spun",(sp.gSpun||0)+"g")}${item("Plied",(sp.gPlied||0)+"g")}${item("Finished Yardage",(sp.finishedYardage||0)+(sp.targetYardage?" / "+sp.targetYardage+" target":""))}${item("WPI",sp.wpi||0)}</div>${sp.log?.length?h2("Work Log")+`<table><tr><th>Date</th><th>Hours</th><th>Grams Spun</th><th>Notes</th></tr>${logRows}${logTotal}</table>`:""}${sp.photos?.length?h2("Photos")+`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:4px">${photos}</div>`:""}${sp.notes?h2("Notes")+`<div style="font-size:13px;white-space:pre-wrap">${sp.notes}</div>`:""}${cpHtml}</div></body></html>`;
}
