import { useState, useRef, useEffect } from "react";

// ── Theme ──────────────────────────────────────────────────────────────────
const DEFAULT_THEME = {
  bg:"#f5f0eb", surface:"#ffffff", surface2:"#ede5da", border:"#d4c5b0",
  text:"#3a2a1a", muted:"#9a8a7a", accent:"#b8834a", green:"#6a9a6a", red:"#c0504a",
};
const THEME_FIELDS = [
  {key:"bg",label:"Page background"},{key:"surface",label:"Card / panel"},
  {key:"surface2",label:"Secondary panel"},{key:"border",label:"Borders"},
  {key:"text",label:"Primary text"},{key:"muted",label:"Muted text"},
  {key:"accent",label:"Accent (buttons, highlights)"},{key:"green",label:"Success / Complete"},
  {key:"red",label:"Error / Mistake"},
];

// ── Stitches ───────────────────────────────────────────────────────────────
const BUILTIN_STITCHES = [
  {id:"co",  label:"Cast On",   symbol:"▓",abbr:"CO", group:"cast",    desc:"Cast on — foundation row"},
  {id:"bo",  label:"Cast Off",  symbol:"═",abbr:"BO", group:"cast",    desc:"Bind off stitch"},
  {id:"empty",label:"Empty",   symbol:"", abbr:"",   group:"basic",   desc:"No stitch"},
  {id:"knit",label:"Knit",     symbol:"□",abbr:"K",  group:"basic",   desc:"Knit stitch (RS)"},
  {id:"purl",label:"Purl",     symbol:"−",abbr:"P",  group:"basic",   desc:"Purl stitch"},
  {id:"yo",  label:"Yarn Over", symbol:"O",abbr:"YO", group:"basic",   desc:"Yarn over"},
  {id:"sl",  label:"Slip",      symbol:"V",abbr:"SL", group:"basic",   desc:"Slip stitch purlwise"},
  {id:"k2tog",label:"K2tog",   symbol:"\\",abbr:"K2T",group:"decrease",desc:"Knit 2 together"},
  {id:"ssk", label:"SSK",       symbol:"/",abbr:"SSK",group:"decrease",desc:"Slip slip knit"},
  {id:"m1l", label:"M1L",       symbol:"↖",abbr:"M1L",group:"increase",desc:"Make 1 left"},
  {id:"m1r", label:"M1R",       symbol:"↗",abbr:"M1R",group:"increase",desc:"Make 1 right"},
  {id:"c4f", label:"C4F",       symbol:"><",abbr:"C4F",group:"cable",  desc:"Cable 4 front"},
  {id:"c4b", label:"C4B",       symbol:"<>",abbr:"C4B",group:"cable",  desc:"Cable 4 back"},
  {id:"brk", label:"brk",       symbol:"⊕",abbr:"BRK",group:"brioche",desc:"Brioche knit"},
  {id:"brp", label:"brp",       symbol:"⊙",abbr:"BRP",group:"brioche",desc:"Brioche purl"},
  {id:"mb",  label:"Bobble",    symbol:"✦",abbr:"MB", group:"texture", desc:"Make bobble"},
  {id:"mistake",label:"Mistake",symbol:"!",abbr:"ERR",group:"marker",  desc:"Mistake marker"},
];
const GROUPS = ["cast","basic","decrease","increase","cable","brioche","texture","marker","custom"];
const GROUP_LABELS = {cast:"Cast On/Off",basic:"Basic",decrease:"Decrease",increase:"Increase",cable:"Cable",brioche:"Brioche",texture:"Texture",marker:"Markers",custom:"Custom"};
const STITCH_SHADES = {co:"#444",bo:"#666",empty:"#f5f0eb",knit:"#e8e0d8",purl:"#d0c4b8",yo:"#f0e8e0",sl:"#dcd4cc",k2tog:"#c8beb4",ssk:"#c8beb4",m1l:"#e4dcd4",m1r:"#dcd4cc",c4f:"#ccc4b8",c4b:"#ccc4b8",brk:"#b8b0a8",brp:"#c8c0b8",mb:"#e8e0d8",mistake:"#fdecea"};
const STITCH_TEXT  = {co:"#fff",bo:"#fff",empty:"#ccc",knit:"#5a4a3a",purl:"#4a3a2a",yo:"#7a6a5a",sl:"#6a5a4a",k2tog:"#3a2a1a",ssk:"#3a2a1a",m1l:"#5a4a3a",m1r:"#5a4a3a",c4f:"#3a2a1a",c4b:"#3a2a1a",brk:"#fff",brp:"#3a2a1a",mb:"#5a4a3a",mistake:"#c0504a"};

const PROJECT_STATUSES = ["Active","Paused","Complete"];
const PROJECT_TYPES    = ["Garment","Accessory","Home","Other"];

// ── Spinning constants ─────────────────────────────────────────────────────
const SPIN_STATUSES = ["Active","Plying","Finished"];
const FIBER_TYPES   = ["Merino","BFL","Corriedale","Corriedale Cross","Alpaca","Silk","Cashmere","Mohair","Linen","Cotton","Other"];
const SPIN_TOOLS    = ["Wheel","Drop Spindle","Supported Spindle"];

// ── Helpers ────────────────────────────────────────────────────────────────
function createGrid(rows,cols){return Array.from({length:rows},()=>Array.from({length:cols},()=>({stitch:"empty",yarn:null})));}
function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function today(){return new Date().toISOString().slice(0,10);}
function contrastText(hex){if(!hex)return"#000";const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(r*299+g*587+b*114)/1000>128?"#222":"#fff";}

function makeSection(name="Section 1",rows=20,cols=30){
  return {id:newId(),name,rows,cols,grid:createGrid(rows,cols),completedRows:[],currentRow:rows-1,rowNotes:{},rowWidths:{},mistakeMarkers:{},stitchMarkers:[],repeatMarkers:[]};
}

const INIT_PROJECTS = [
  {id:"p1",name:"Zauberball Wave Scarf",yarn:"Schoppel Zauberball Crazy",needles:"2.75mm",status:"Active",type:"Accessory",
   notes:"Two-colour brioche scallop wave.",photos:[],log:[],created:"2024-11-01",
   yarnPalette:[{id:"y1",name:"CA – Black",color:"#1a1a1a"},{id:"y2",name:"CB – Zauberball",color:"#7a4a9a"}],
   sections:[makeSection("Main Pattern",20,30)],activeSectionId:null},
  {id:"p2",name:"Cable Knit Sweater",yarn:"Merino Wool – Oatmeal",needles:"5mm",status:"Paused",type:"Garment",
   notes:"",photos:[],log:[],created:"2024-09-15",
   yarnPalette:[{id:"y3",name:"Main – Oatmeal",color:"#d4c5a0"}],
   sections:[makeSection("Body",24,40),makeSection("Sleeve",20,28)],activeSectionId:null},
  {id:"p3",name:"Lace Shawl",yarn:"Fingering Weight – Blush",needles:"3.5mm",status:"Active",type:"Accessory",
   notes:"",photos:[],log:[],created:"2024-12-01",
   yarnPalette:[{id:"y4",name:"Main – Blush",color:"#e8b4a8"}],
   sections:[makeSection("Chart A",16,24),makeSection("Chart B",12,20),makeSection("Border",8,30)],activeSectionId:null},
];

const SYSTEM_PROMPT = `You are a knitting pattern interpreter. Convert the knitting pattern into a stitch grid.
Available stitch IDs: empty, knit, purl, yo, k2tog, ssk, sl, co, bo, c4f, c4b, m1l, m1r, brk, brp, mb
Respond ONLY with valid JSON, no markdown: {"rows":[["knit","purl",...],...],"notes":"Brief summary"}
Rules: Each array = one row left to right. All rows same length. Expand repeats. Max 40 cols, 30 rows. Row 1 = bottom. Only return JSON.`;

// ── Selection helpers ──────────────────────────────────────────────────────
function extractSelection(grid,sel){
  const r1=Math.min(sel.r1,sel.r2),r2=Math.max(sel.r1,sel.r2);
  const c1=Math.min(sel.c1,sel.c2),c2=Math.max(sel.c1,sel.c2);
  return {r1,r2,c1,c2,cells:grid.slice(r1,r2+1).map(row=>row.slice(c1,c2+1).map(c=>({...c})))};
}
function rotateCW(cells){
  const rows=cells.length,cols=cells[0].length;
  return Array.from({length:cols},(_,ci)=>Array.from({length:rows},(_,ri)=>({...cells[rows-1-ri][ci]})));
}
function flipH(cells){return cells.map(row=>[...row].reverse().map(c=>({...c})));}
function flipV(cells){return [...cells].reverse().map(row=>row.map(c=>({...c})));}

// ── Export builders (pure, module-scope) ──────────────────────────────────
function buildKnittingHTML(project,section,stitchesList,cpLine){
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

function buildSpinningHTML(sp,cpLine){
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
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${sp.name} &#8212; Spinning</title><style>body{font-family:Georgia,serif;background:#f5f0eb;color:#3a2a1a;margin:0;padding:24px}.card{background:#fff;border:1px solid #d4c5b0;border-radius:8px;padding:24px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px}th{background:#ede5da;padding:6px 10px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9a8a7a}td{padding:6px 10px;border-bottom:1px solid #ede5da}@media print{body{padding:12px}.card{break-inside:avoid}}</style></head><body><div class="card"><h1 style="font-size:22px;margin:0 0 4px">${sp.name}</h1><div style="font-size:12px;color:#9a8a7a;margin-bottom:18px">Created ${sp.created||""} &#183; <span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:bold;background:${stBg};color:#fff">${sp.status}</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">${h2("Fibre")+g2+item("Type",sp.fiberType)+item("Purchased Weight",sp.fiberWeight?sp.fiberWeight+"g":"")+item("Source / Dyer",sp.source)+item("Colorway",sp.colorway)+item("Purchased at",sp.purchasePlace)+"</div>"+h2("Tool")+g2+item("Tool",sp.tool)+item("Details",sp.toolDetails)+item("Ratio / Whorl",sp.ratio)+item("Plies",sp.plies?sp.plies+"-ply":"")+item("Target Yardage",sp.targetYardage?sp.targetYardage+" yds":"")+"</div>"}</div>${h2("Processing")}<table><tr><th>Stage</th><th>Weight</th><th>Yield</th></tr><tr><td>Purchased (raw)</td><td>${sp.fiberWeight||"&#8212;"}g</td><td>&#8212;</td></tr><tr><td>After Washing</td><td>${sp.washedWeight?sp.washedWeight+"g":"not recorded"}</td><td>${washYld}</td></tr><tr><td>After Prep (carding/combing)</td><td>${sp.preparedWeight?sp.preparedWeight+"g":"not recorded"}</td><td>${prepYld}</td></tr></table>${h2("Progress")}${g2}${item("Spun",(sp.gSpun||0)+"g")}${item("Plied",(sp.gPlied||0)+"g")}${item("Finished Yardage",(sp.finishedYardage||0)+(sp.targetYardage?" / "+sp.targetYardage+" target":""))}${item("WPI",sp.wpi||0)}</div>${sp.log?.length?h2("Work Log")+`<table><tr><th>Date</th><th>Hours</th><th>Grams Spun</th><th>Notes</th></tr>${logRows}${logTotal}</table>`:""}${sp.photos?.length?h2("Photos")+`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:4px">${photos}</div>`:""}${sp.notes?h2("Notes")+`<div style="font-size:13px;white-space:pre-wrap">${sp.notes}</div>`:""}${cpHtml}</div></body></html>`;
}

// ══════════════════════════════════════════════════════════════════════════
export default function KnittingApp() {
  const [theme, setTheme] = useState(()=>{
    try{const s=localStorage.getItem("ww_theme");return s?JSON.parse(s):DEFAULT_THEME;}catch{return DEFAULT_THEME;}
  });
  const C = theme;

  const [customStitches, setCustomStitches] = useState(()=>{
    try{const s=localStorage.getItem("ww_custom_stitches");return s?JSON.parse(s):[];}catch{return [];}
  });
  const [stitchOverrides, setStitchOverrides] = useState(()=>{
    try{const s=localStorage.getItem("ww_stitch_overrides");return s?JSON.parse(s):{};}catch{return {};}
  });
  const allStitches = () => [...BUILTIN_STITCHES, ...customStitches];
  const getStitch = id => { const base=allStitches().find(s=>s.id===id)||BUILTIN_STITCHES[0]; const ov=stitchOverrides[id]; return ov?{...base,...ov}:base; };

  // ── Projects ──────────────────────────────────────────────────────────
  const [projects, setProjects] = useState(()=>{
    try{const s=localStorage.getItem("ww_projects");return s?JSON.parse(s):INIT_PROJECTS.map(p=>({...p,activeSectionId:p.sections[0].id}));}
    catch{return INIT_PROJECTS.map(p=>({...p,activeSectionId:p.sections[0].id}));}
  });
  const [activeProjectId, setActiveProjectId] = useState(()=>{
    try{return localStorage.getItem("ww_active_project_id")||"p1";}catch{return "p1";}
  });
  const activeProject = projects.find(p=>p.id===activeProjectId)||projects[0];
  const yarnPalette   = activeProject.yarnPalette||[];

  const updateProject = (id,changes) => setProjects(prev=>prev.map(p=>p.id===id?{...p,...changes}:p));

  // ── Active section ─────────────────────────────────────────────────────
  const activeSectionId = activeProject.activeSectionId||activeProject.sections?.[0]?.id;
  const activeSection   = activeProject.sections?.find(s=>s.id===activeSectionId)||activeProject.sections?.[0];

  const updateSection = (pid, sid, changes) => {
    setProjects(prev=>prev.map(p=>p.id===pid?{...p,sections:p.sections.map(s=>s.id===sid?{...s,...changes}:s)}:p));
  };
  const updateActiveSection = changes => updateSection(activeProjectId, activeSectionId, changes);

  // Derived section state
  const grid          = activeSection?.grid         || createGrid(20,30);
  const gridRows      = activeSection?.rows         || 20;
  const gridCols      = activeSection?.cols         || 30;
  const currentRow    = activeSection?.currentRow   ?? gridRows-1;
  const completedRows = new Set(activeSection?.completedRows||[]);
  const rowNotes      = activeSection?.rowNotes     || {};
  const rowWidths     = activeSection?.rowWidths    || {};
  const mistakeMarkers= activeSection?.mistakeMarkers||{};
  const stitchMarkers = new Set(activeSection?.stitchMarkers||[]);
  const repeatMarkers = activeSection?.repeatMarkers||[];

  // Setters that write into the section
  const setGrid           = fn => updateActiveSection({grid: typeof fn==="function"?fn(grid):fn});
  const setCurrentRow     = fn => updateActiveSection({currentRow: typeof fn==="function"?fn(currentRow):fn});
  const setCompletedRows  = fn => { const next=typeof fn==="function"?fn(completedRows):fn; updateActiveSection({completedRows:[...next]}); };
  const setRowNotes       = fn => updateActiveSection({rowNotes: typeof fn==="function"?fn(rowNotes):fn});
  const setRowWidths      = fn => updateActiveSection({rowWidths: typeof fn==="function"?fn(rowWidths):fn});
  const setMistakeMarkers = fn => updateActiveSection({mistakeMarkers: typeof fn==="function"?fn(mistakeMarkers):fn});
  const setStitchMarkers  = fn => { const next=typeof fn==="function"?fn(stitchMarkers):fn; updateActiveSection({stitchMarkers:[...next]}); };
  const setRepeatMarkers  = fn => updateActiveSection({repeatMarkers: typeof fn==="function"?fn(repeatMarkers):fn});

  // ── Tool state ────────────────────────────────────────────────────────
  const [selectedStitch, setSelectedStitch] = useState("knit");
  const [selectedYarn,   setSelectedYarn]   = useState(null);
  const [markerMode, setMarkerMode]         = useState(false);
  const [zoom, setZoom]                     = useState(1);
  const [showSymbolKey, setShowSymbolKey]   = useState(true);
  const [isDrawing, setIsDrawing]           = useState(false);

  // ── Selection state ───────────────────────────────────────────────────
  const [selMode,   setSelMode]   = useState(false);   // selection tool active
  const [selDrag,   setSelDrag]   = useState(false);
  const [selection, setSelection] = useState(null);    // {r1,c1,r2,c2}
  const [selAction, setSelAction] = useState(null);    // result of extractSelection for actions

  // ── Clipboard library (global, across all projects) ───────────────────
  const [clipboard, setClipboard]       = useState([]); // [{id,name,cells,rows,cols,date}]
  const [pastePreview, setPastePreview] = useState(null); // {clipId, offsetR, offsetC}

  // ── App mode ──────────────────────────────────────────────────────────
  const [appMode, setAppMode]     = useState(()=>{
    try{return localStorage.getItem("ww_app_mode")||"knitting";}catch{return "knitting";}
  }); // "knitting" | "spinning"

  // ── Navigation / Modals ───────────────────────────────────────────────
  const [view, setView]           = useState("pattern");
  const [modal, setModal]         = useState(null);
  const [modalData, setModalData] = useState({});
  const openModal  = (name,data={})=>{setModal(name);setModalData(data);};
  const closeModal = ()=>{setModal(null);setModalData({});};

  // Resize form
  const [newRows, setNewRows] = useState(20);
  const [newCols, setNewCols] = useState(30);

  // Import
  const [importText,    setImportText]    = useState("");
  const [importImage,   setImportImage]   = useState(null);
  const [importing,     setImporting]     = useState(false);
  const [importError,   setImportError]   = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  // Projects UI
  const [projectSearch,       setProjectSearch]       = useState("");
  const [projectFilterStatus, setProjectFilterStatus] = useState("All");
  const [projectFilterType,   setProjectFilterType]   = useState("All");
  const [editingProject,      setEditingProject]      = useState(null);

  // Work log
  const [logDate,logHours,logRowsFrom,logRowsTo,logNote]=[useState(today()),useState(""),useState(""),useState(""),useState("")];
  const setLog={date:logDate[1],hours:logHours[1],rowsFrom:logRowsFrom[1],rowsTo:logRowsTo[1],note:logNote[1]};

  // ── Spinning state ────────────────────────────────────────────────────
  const [spinProjects,      setSpinProjects]      = useState(()=>{
    try{const s=localStorage.getItem("ww_spin_projects");return s?JSON.parse(s):[];}catch{return [];}
  });
  const [activeSpinId,      setActiveSpinId]      = useState(()=>{
    try{return localStorage.getItem("ww_active_spin_id")||null;}catch{return null;}
  });
  const [spinView,          setSpinView]          = useState("projects");
  const [editingSpinProject,setEditingSpinProject]= useState(null);
  const [spinSearch,        setSpinSearch]        = useState("");
  const [spinFilterStatus,  setSpinFilterStatus]  = useState("All");
  const [spinLogDate,       setSpinLogDate]       = useState(today());
  const [spinLogHours,      setSpinLogHours]      = useState("");
  const [spinLogGSpun,      setSpinLogGSpun]      = useState("");
  const [spinLogNote,       setSpinLogNote]       = useState("");

  const [exportCreator,          setExportCreator]          = useState("");
  const [exportOriginalDesigner, setExportOriginalDesigner] = useState("");
  const [exportAttribution,      setExportAttribution]      = useState("original"); // "original"|"modified"|"other"
  const [exportFormat,           setExportFormat]           = useState("html");

  const fileInputRef     = useRef();
  const photoInputRef    = useRef();
  const spinPhotoInputRef= useRef();

  // ── localStorage persistence ──────────────────────────────────────────
  useEffect(()=>{ try{localStorage.setItem("ww_projects",          JSON.stringify(projects));}catch{} }, [projects]);
  useEffect(()=>{ try{localStorage.setItem("ww_active_project_id", activeProjectId);}catch{} },          [activeProjectId]);
  useEffect(()=>{ try{localStorage.setItem("ww_spin_projects",     JSON.stringify(spinProjects));}catch{} }, [spinProjects]);
  useEffect(()=>{ try{localStorage.setItem("ww_active_spin_id",    activeSpinId||"");}catch{} },          [activeSpinId]);
  useEffect(()=>{ try{localStorage.setItem("ww_app_mode",          appMode);}catch{} },                   [appMode]);
  useEffect(()=>{ try{localStorage.setItem("ww_theme",             JSON.stringify(theme));}catch{} },     [theme]);
  useEffect(()=>{ try{localStorage.setItem("ww_custom_stitches",   JSON.stringify(customStitches));}catch{} }, [customStitches]);
  useEffect(()=>{ try{localStorage.setItem("ww_stitch_overrides",  JSON.stringify(stitchOverrides));}catch{} }, [stitchOverrides]);

  // ── Derived ───────────────────────────────────────────────────────────
  const cellSize       = Math.round(22*zoom);
  const completedCount = completedRows.size;
  const progressPct    = Math.round((completedCount/gridRows)*100);
  const mistakeCount   = Object.keys(mistakeMarkers).length;

  const getCellBg = cell => {
    if(cell.stitch==="mistake")return"#fdecea";
    const yarn=yarnPalette.find(y=>y.id===cell.yarn);
    return yarn?yarn.color:(STITCH_SHADES[cell.stitch]||"#e8e0d8");
  };
  const getCellText = cell => {
    if(cell.stitch==="mistake")return C.red;
    const yarn=yarnPalette.find(y=>y.id===cell.yarn);
    return yarn?contrastText(yarn.color):(STITCH_TEXT[cell.stitch]||"#3a2a1a");
  };
  const getRowWidth   = ri => rowWidths[ri]??gridCols;
  const hasMistake    = (ri,ci) => mistakeMarkers[`${ri}_${ci}`]!==undefined;
  const mistakeNote   = (ri,ci) => mistakeMarkers[`${ri}_${ci}`]||"";
  const clearMistake  = (ri,ci) => setMistakeMarkers(p=>{const n={...p};delete n[`${ri}_${ci}`];return n;});
  const setMistakeNote= (ri,ci,note) => setMistakeMarkers(p=>({...p,[`${ri}_${ci}`]:note}));
  const getRepeat     = (ri,ci) => repeatMarkers.find(m=>ri>=m.rStart&&ri<=m.rEnd&&ci>=m.cStart&&ci<=m.cEnd);

  // ── Paint ─────────────────────────────────────────────────────────────
  const paintCell = (r,c)=>{
    if(selMode)return;
    if(markerMode){
      const key=`${r}_${c}`;
      setStitchMarkers(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});
      return;
    }
    if(pastePreview)return;
    if(selectedStitch==="mistake"){
      const key=`${r}_${c}`;
      setMistakeMarkers(prev=>{const m={...prev};m[key]!==undefined?delete m[key]:m[key]="";return m;});
      return;
    }
    setGrid(prev=>{
      const n=prev.map(row=>row.map(cell=>({...cell})));
      if(r<n.length&&c<n[r].length) n[r][c]={stitch:selectedStitch,yarn:selectedYarn||n[r][c].yarn||null};
      return n;
    });
  };

  const handleCellDown  = (r,c)=>{
    if(selMode){setSelDrag(true);setSelection({r1:r,c1:c,r2:r,c2:c});setSelAction(null);}
    else{setIsDrawing(true);paintCell(r,c);}
  };
  const handleCellEnter = (r,c)=>{
    if(selMode&&selDrag){setSelection(prev=>prev?{...prev,r2:r,c2:c}:null);}
    else if(isDrawing&&!markerMode&&!pastePreview){paintCell(r,c);}
  };
  const handleMouseUp   = ()=>{
    setIsDrawing(false);
    if(selMode&&selDrag){
      setSelDrag(false);
      if(selection){
        const ex=extractSelection(grid,selection);
        setSelAction(ex);
        setSelection({r1:ex.r1,c1:ex.c1,r2:ex.r2,c2:ex.c2});
      }
    }
  };

  const toggleRowComplete = r => setCompletedRows(prev=>{const n=new Set(prev);n.has(r)?n.delete(r):n.add(r);return n;});

  // ── Row width ─────────────────────────────────────────────────────────
  const setRowWidth = (ri,w)=>{
    const clamped=Math.max(1,Math.min(60,w));
    setRowWidths(prev=>({...prev,[ri]:clamped}));
    setGrid(prev=>{
      const n=prev.map(row=>row.map(c=>({...c})));
      if(clamped<n[ri].length)n[ri]=n[ri].slice(0,clamped);
      else while(n[ri].length<clamped)n[ri].push({stitch:"empty",yarn:null});
      return n;
    });
  };
  const resetRowWidth = ri=>{
    setRowWidths(prev=>{const n={...prev};delete n[ri];return n;});
    setGrid(prev=>{
      const n=prev.map(row=>row.map(c=>({...c})));
      if(n[ri].length<gridCols)while(n[ri].length<gridCols)n[ri].push({stitch:"empty",yarn:null});
      else if(n[ri].length>gridCols)n[ri]=n[ri].slice(0,gridCols);
      return n;
    });
  };

  // ── Resize section ────────────────────────────────────────────────────
  const applyResize = ()=>{
    const r=Math.max(1,Math.min(60,newRows)),c=Math.max(1,Math.min(60,newCols));
    const ng=createGrid(r,c);
    for(let ri=0;ri<Math.min(r,grid.length);ri++) for(let ci=0;ci<Math.min(c,grid[0]?.length||0);ci++) ng[ri][ci]={...grid[ri][ci]};
    updateActiveSection({rows:r,cols:c,grid:ng,completedRows:[],currentRow:r-1,rowWidths:{},mistakeMarkers:{},stitchMarkers:[],rowNotes:{}});
    setSelection(null);setSelAction(null);closeModal();
  };
  const clearGrid = ()=>{
    updateActiveSection({grid:createGrid(gridRows,gridCols),completedRows:[],currentRow:gridRows-1,rowNotes:{},rowWidths:{},mistakeMarkers:{},stitchMarkers:[],repeatMarkers:[]});
    setSelection(null);setSelAction(null);
  };

  // ── Selection actions ─────────────────────────────────────────────────
  const applySelectionTransform = (fn) => {
    if(!selAction)return;
    const {r1,c1,cells}=selAction;
    const newCells=fn(cells);
    setGrid(prev=>{
      const n=prev.map(row=>row.map(c=>({...c})));
      newCells.forEach((row,ri)=>row.forEach((cell,ci)=>{
        const gr=r1+ri,gc=c1+ci;
        if(gr>=0&&gr<n.length&&gc>=0&&gc<n[gr].length)n[gr][gc]={...cell};
      }));
      return n;
    });
    const nr=newCells.length,nc=newCells[0]?.length||0;
    setSelAction({...selAction,cells:newCells,r2:r1+nr-1,c2:c1+nc-1});
    setSelection({r1,c1,r2:r1+nr-1,c2:c1+nc-1});
  };

  const copySelection = (cut=false) => {
    if(!selAction)return;
    const name=`${activeSection?.name||"Grid"} — ${selAction.cells.length}×${selAction.cells[0]?.length||0}`;
    const entry={id:newId(),name,cells:selAction.cells.map(r=>r.map(c=>({...c}))),rows:selAction.cells.length,cols:selAction.cells[0]?.length||0,date:today()};
    setClipboard(prev=>[entry,...prev]);
    if(cut){
      setGrid(prev=>{
        const n=prev.map(row=>row.map(c=>({...c})));
        for(let ri=selAction.r1;ri<=selAction.r2;ri++) for(let ci=selAction.c1;ci<=selAction.c2;ci++) if(ri<n.length&&ci<n[ri].length)n[ri][ci]={stitch:"empty",yarn:null};
        return n;
      });
    }
    setSelection(null);setSelAction(null);setSelMode(false);
  };

  const startPaste = (clipEntry) => {
    setPastePreview({clipId:clipEntry.id,offsetR:0,offsetC:0,cells:clipEntry.cells});
    setSelMode(false);setSelection(null);setSelAction(null);closeModal();
  };

  const commitPaste = (r,c) => {
    if(!pastePreview)return;
    setGrid(prev=>{
      const n=prev.map(row=>row.map(x=>({...x})));
      pastePreview.cells.forEach((row,ri)=>row.forEach((cell,ci)=>{
        const gr=r+ri,gc=c+ci;
        if(gr>=0&&gr<n.length&&gc>=0&&gc<n[gr].length)n[gr][gc]={...cell};
      }));
      return n;
    });
    setPastePreview(null);
  };

  // ── AI Import ─────────────────────────────────────────────────────────
  const handleImport = async()=>{
    if(!importText.trim()&&!importImage)return;
    setImporting(true);setImportError("");
    try{
      const msgContent=importImage?[{type:"image",source:{type:"base64",media_type:importImage.type,data:importImage.data}},{type:"text",text:importText.trim()||"Convert this knitting pattern."}]:importText;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:[{role:"user",content:msgContent}]})});
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"";
      let parsed;
      try{parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());}catch{throw new Error("AI returned unexpected format.");}
      if(!parsed.rows?.length)throw new Error("No rows found.");
      const numR=Math.min(parsed.rows.length,gridRows),numC=Math.min(parsed.rows[0]?.length||0,gridCols);
      const ng=createGrid(gridRows,gridCols);
      for(let ri=0;ri<numR;ri++){const gi=gridRows-numR+ri;for(let ci=0;ci<numC;ci++){const id=parsed.rows[ri][ci];if(allStitches().find(s=>s.id===id))ng[gi][ci]={stitch:id,yarn:null};}}
      updateActiveSection({grid:ng,completedRows:[],currentRow:gridRows-1,mistakeMarkers:{},stitchMarkers:[]});
      setImportSuccess(parsed.notes||"Pattern imported.");
      setImportText("");setImportImage(null);closeModal();
    }catch(err){setImportError(err.message||"Something went wrong.");}
    finally{setImporting(false);}
  };
  const handleImageFile=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setImportImage({data:ev.target.result.split(",")[1],type:file.type});reader.readAsDataURL(file);};

  // ── Section management ────────────────────────────────────────────────
  const addSection = (name) => {
    const sec=makeSection(name||`Section ${(activeProject.sections?.length||0)+1}`);
    updateProject(activeProjectId,{sections:[...(activeProject.sections||[]),sec],activeSectionId:sec.id});
  };
  const deleteSection = (sid) => {
    const secs=(activeProject.sections||[]).filter(s=>s.id!==sid);
    if(secs.length===0)return;
    const nextId=secs[0].id;
    updateProject(activeProjectId,{sections:secs,activeSectionId:nextId});
  };
  const renameSection = (sid,name) => updateSection(activeProjectId,sid,{name});
  const duplicateSection = (sid) => {
    const src=(activeProject.sections||[]).find(s=>s.id===sid);
    if(!src)return;
    const dup={...src,id:newId(),name:src.name+" (copy)",grid:src.grid.map(row=>row.map(c=>({...c})))};
    updateProject(activeProjectId,{sections:[...(activeProject.sections||[]),dup]});
  };
  const switchSection = sid => updateProject(activeProjectId,{activeSectionId:sid});

  // ── Project helpers ───────────────────────────────────────────────────
  const addLogEntry = ()=>{
    if(!logDate[0])return;
    const entry={id:newId(),date:logDate[0],hours:logHours[0]||null,rowsFrom:logRowsFrom[0]||null,rowsTo:logRowsTo[0]||null,note:logNote[0]};
    updateProject(activeProjectId,{log:[...(activeProject.log||[]),entry]});
    setLog.date(today());setLog.hours("");setLog.rowsFrom("");setLog.rowsTo("");setLog.note("");closeModal();
  };
  const addPhoto=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>updateProject(activeProjectId,{photos:[...(activeProject.photos||[]),{id:newId(),src:ev.target.result,date:today()}]});reader.readAsDataURL(file);};
  const addYarn=()=>{const{yName,yColor}=modalData;if(!yName?.trim())return;const y={id:newId(),name:yName,color:yColor||"#d4c5b0"};updateProject(activeProjectId,{yarnPalette:[...yarnPalette,y]});closeModal();};
  const removeYarn=yid=>updateProject(activeProjectId,{yarnPalette:yarnPalette.filter(y=>y.id!==yid)});
  const updateYarn=(yid,changes)=>updateProject(activeProjectId,{yarnPalette:yarnPalette.map(y=>y.id===yid?{...y,...changes}:y)});

  // ── Spinning helpers ──────────────────────────────────────────────────
  const updateSpinProject=(id,changes)=>setSpinProjects(prev=>prev.map(p=>p.id===id?{...p,...changes}:p));

  const saveSpinProject=()=>{
    const{spName,spFiberType,spFiberWeight,spSource,spColorway,spPurchasePlace,spTool,spToolDetails,spRatio,spPlies,spTargetYardage,spStatus}=modalData;
    if(!spName?.trim())return;
    if(editingSpinProject){
      updateSpinProject(editingSpinProject,{name:spName,fiberType:spFiberType||"",fiberWeight:+spFiberWeight||0,source:spSource||"",colorway:spColorway||"",purchasePlace:spPurchasePlace||"",tool:spTool||"Wheel",toolDetails:spToolDetails||"",ratio:spRatio||"",plies:+spPlies||2,targetYardage:+spTargetYardage||0,status:spStatus||"Active"});
    }else{
      const np={id:newId(),name:spName,fiberType:spFiberType||"",fiberWeight:+spFiberWeight||0,source:spSource||"",colorway:spColorway||"",purchasePlace:spPurchasePlace||"",tool:spTool||"Wheel",toolDetails:spToolDetails||"",ratio:spRatio||"",plies:+spPlies||2,targetYardage:+spTargetYardage||0,status:spStatus||"Active",notes:"",log:[],photos:[],created:today(),gSpun:0,gPlied:0,finishedYardage:0,wpi:0,washedWeight:0,preparedWeight:0};
      setSpinProjects(prev=>[np,...prev]);
      setActiveSpinId(np.id);
    }
    closeModal();setEditingSpinProject(null);
  };

  const exportPNG=(project,section,creator)=>{
    const px=22,padL=38,padT=44,padB=creator?26:10;
    const canvas=document.createElement("canvas");
    canvas.width=padL+section.cols*px+12;canvas.height=padT+section.rows*px+padB;
    const ctx=canvas.getContext("2d");
    const sl=[...BUILTIN_STITCHES,...customStitches];
    const sm={};sl.forEach(s=>{sm[s.id]=s;});
    ctx.fillStyle="#f5f0eb";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#3a2a1a";ctx.font="bold 13px Georgia,serif";ctx.textAlign="left";ctx.textBaseline="top";
    ctx.fillText(`${project.name}${section.name!=="Main Pattern"?` — ${section.name}`:""}`,padL,8);
    ctx.fillStyle="#9a8a7a";ctx.font="10px Georgia,serif";
    ctx.fillText(`${project.yarn||""}${project.needles?` · ${project.needles}`:""}  ${section.rows}×${section.cols}`,padL,26);
    const rows=section.rows;const cur=section.currentRow??rows-1;
    section.grid.forEach((row,ri)=>{
      const dispRow=rows-ri;const done=(section.completedRows||[]).includes(ri);const isCur=ri===cur;
      row.forEach((cell,ci)=>{
        const x=padL+ci*px;const y=padT+ri*px;
        const yarn=(project.yarnPalette||[]).find(yy=>yy.id===cell.yarn);
        const bg=cell.stitch==="mistake"?"#fdecea":yarn?yarn.color:(STITCH_SHADES[cell.stitch]||"#e8e0d8");
        const tc=cell.stitch==="mistake"?"#c0504a":yarn?contrastText(yarn.color):(STITCH_TEXT[cell.stitch]||"#3a2a1a");
        ctx.fillStyle=bg;ctx.fillRect(x,y,px,px);
        if(done){ctx.fillStyle="rgba(100,160,100,0.14)";ctx.fillRect(x,y,px,px);}
        ctx.strokeStyle=isCur?"#b8834a":"#c8beb4";ctx.lineWidth=isCur?1:0.5;ctx.strokeRect(x+.5,y+.5,px-1,px-1);
        const sym=(sm[cell.stitch]?.symbol)||"";
        if(sym){ctx.fillStyle=tc;ctx.font=`bold ${Math.floor(px*.55)}px monospace`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(sym,x+px/2,y+px/2);}
      });
      if(dispRow%5===0||dispRow===1||isCur){
        ctx.fillStyle=isCur?"#b8834a":"#9a8a7a";ctx.font=`${isCur?"bold ":""}8px sans-serif`;ctx.textAlign="right";ctx.textBaseline="middle";
        ctx.fillText(dispRow,padL-3,padT+ri*px+px/2);
      }
    });
    if(creator){ctx.fillStyle="#9a8a7a";ctx.font="9px Georgia,serif";ctx.textAlign="right";ctx.textBaseline="bottom";ctx.fillText(`© ${creator}`,canvas.width-6,canvas.height-4);}
    canvas.toBlob(blob=>{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${project.name.replace(/[^a-z0-9]/gi,"_")}_${section.name.replace(/[^a-z0-9]/gi,"_")}.png`;a.click();});
  };

  const getAttributionLine=()=>{
    const me=exportCreator.trim();const orig=exportOriginalDesigner.trim();
    if(exportAttribution==="original") return me?`&#169; ${me} &#8212; All rights reserved. Do not reproduce without permission.`:"";
    if(exportAttribution==="modified") return [orig?`Based on a pattern by ${orig}.`:"",me?`Modified version &#169; ${me}.`:""].filter(Boolean).join(" ");
    if(exportAttribution==="other") return orig?`Pattern by ${orig}. Reproduced for personal use only. No copyright claimed.`:"";
    return "";
  };

  const runExport=()=>{
    const{exportContext}=modalData;const fmt=exportFormat;const cpLine=getAttributionLine();
    const dl=(content,name,type)=>{const blob=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();};
    const safeName=n=>n.replace(/[^a-z0-9]/gi,"_");
    if(exportContext==="knitting-project"){
      const sl=[...BUILTIN_STITCHES,...customStitches];
      if(fmt==="json") dl(JSON.stringify(activeProject,null,2),`${safeName(activeProject.name)}_knitting.json`,"application/json");
      else if(fmt==="html") dl(buildKnittingHTML(activeProject,activeSection,sl,cpLine),`${safeName(activeProject.name)}_pattern.html`,"text/html");
      else if(fmt==="image") exportPNG(activeProject,activeSection,cpLine);
    } else if(exportContext==="knitting-all"){
      dl(JSON.stringify(projects,null,2),"woolwork_knitting_projects.json","application/json");
    } else if(exportContext==="spinning-project"){
      if(fmt==="json") dl(JSON.stringify(activeSpinProject,null,2),`${safeName(activeSpinProject.name)}_spinning.json`,"application/json");
      else if(fmt==="html") dl(buildSpinningHTML(activeSpinProject,cpLine),`${safeName(activeSpinProject.name)}_spinning.html`,"text/html");
    } else if(exportContext==="spinning-all"){
      dl(JSON.stringify(spinProjects,null,2),"woolwork_spinning_projects.json","application/json");
    }
    closeModal();
  };

  const addSpinLogEntry=()=>{
    if(!activeSpinId)return;
    const entry={id:newId(),date:spinLogDate,hours:spinLogHours,gSpun:spinLogGSpun,note:spinLogNote};
    updateSpinProject(activeSpinId,{log:[...(activeSpinProject.log||[]),entry]});
    setSpinLogDate(today());setSpinLogHours("");setSpinLogGSpun("");setSpinLogNote("");
    closeModal();
  };

  const addSpinPhoto=e=>{
    const file=e.target.files?.[0];if(!file||!activeSpinId)return;
    const reader=new FileReader();
    reader.onload=ev=>updateSpinProject(activeSpinId,{photos:[...(activeSpinProject.photos||[]),{id:newId(),src:ev.target.result,date:today()}]});
    reader.readAsDataURL(file);
  };
  const addRepeat=()=>{const{rStart,rEnd,cStart,cEnd,label}=modalData;if(rStart==null)return;setRepeatMarkers(prev=>[...prev,{id:newId(),rStart:+rStart,rEnd:+rEnd,cStart:+cStart,cEnd:+cEnd,label:label||"Repeat"}]);closeModal();};
  const addCustomStitch=()=>{const{csName,csAbbr,csSymbol,csColor,csDesc}=modalData;if(!csName?.trim()||!csSymbol?.trim())return;const id="custom_"+newId();setCustomStitches(prev=>[...prev,{id,label:csName,abbr:csAbbr||csSymbol,symbol:csSymbol,shade:csColor||"#e8d5c4",group:"custom",desc:csDesc||""}]);closeModal();};

  const filteredProjects=projects.filter(p=>{
    const ms=p.name.toLowerCase().includes(projectSearch.toLowerCase())||p.yarn.toLowerCase().includes(projectSearch.toLowerCase());
    return ms&&(projectFilterStatus==="All"||p.status===projectFilterStatus)&&(projectFilterType==="All"||p.type===projectFilterType);
  });

  // ── Spinning derived ──────────────────────────────────────────────────
  const activeSpinProject = spinProjects.find(p=>p.id===activeSpinId)||null;
  const filteredSpinProjects = spinProjects.filter(p=>{
    const ms=p.name.toLowerCase().includes(spinSearch.toLowerCase())||(p.fiberType||"").toLowerCase().includes(spinSearch.toLowerCase())||(p.colorway||"").toLowerCase().includes(spinSearch.toLowerCase());
    return ms&&(spinFilterStatus==="All"||p.status===spinFilterStatus);
  });

  const accentRgba = (a) => {
    const h=C.accent.replace("#","");
    const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  };
  const inSelection=(ri,ci)=>{
    if(!selection)return false;
    const r1=Math.min(selection.r1,selection.r2),r2=Math.max(selection.r1,selection.r2);
    const c1=Math.min(selection.c1,selection.c2),c2=Math.max(selection.c1,selection.c2);
    return ri>=r1&&ri<=r2&&ci>=c1&&ci<=c2;
  };

  // ── Styles ────────────────────────────────────────────────────────────
  const btnPrimary   = {padding:"7px 16px",borderRadius:6,border:"none",background:C.accent,color:contrastText(C.accent),cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:"bold"};
  const btnSecondary = {padding:"6px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,cursor:"pointer",fontSize:12,fontFamily:"inherit"};
  const btnDanger    = {padding:"6px 14px",borderRadius:6,border:"1px solid #f5c0bb",background:"#fdecea",color:C.red,cursor:"pointer",fontSize:12,fontFamily:"inherit"};
  const btnTab       = active=>({padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,background:active?C.accent:"transparent",color:active?contrastText(C.accent):C.muted,transition:"all 0.2s"});
  const inp          = {padding:"7px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontFamily:"inherit",fontSize:13,width:"100%",boxSizing:"border-box"};
  const lbl          = {fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:4};

  const Modal=({title,onClose,children,width=480})=>(
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

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Georgia','Times New Roman',serif",color:C.text,userSelect:"none"}} onMouseUp={handleMouseUp}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes marchingAnts{to{stroke-dashoffset:-16}} button:focus{outline:none}`}</style>

      {/* ═══ MODALS ═══════════════════════════════════════════════════════ */}

      {/* Theme */}
      {modal==="theme"&&(
        <Modal title="🎨 Customise Theme" onClose={closeModal} width={520}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {THEME_FIELDS.map(({key,label})=>(
              <div key={key}>
                <span style={lbl}>{label}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input type="color" value={theme[key]} onChange={e=>setTheme(t=>({...t,[key]:e.target.value}))} style={{width:38,height:34,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",padding:2}}/>
                  <input value={theme[key]} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))setTheme(t=>({...t,[key]:e.target.value}));}} style={{...inp,flex:1,fontFamily:"monospace",fontSize:12}}/>
                  <div style={{width:28,height:28,borderRadius:4,background:theme[key],border:`1px solid ${C.border}`,flexShrink:0}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:8}}>
              {[{label:"Oatmeal",t:{bg:"#f5f0eb",surface:"#ffffff",surface2:"#ede5da",border:"#d4c5b0",text:"#3a2a1a",muted:"#9a8a7a",accent:"#b8834a",green:"#6a9a6a",red:"#c0504a"}},{label:"Sage",t:{bg:"#eef2ee",surface:"#ffffff",surface2:"#e0e8e0",border:"#b8ccb8",text:"#1e301e",muted:"#6a8a6a",accent:"#4a8a5a",green:"#4a8a4a",red:"#c05050"}},{label:"Blush",t:{bg:"#f8f0f0",surface:"#ffffff",surface2:"#f0e4e4",border:"#e0c8c8",text:"#3a1a1a",muted:"#9a6a6a",accent:"#c06878",green:"#6a8a6a",red:"#c04040"}},{label:"Slate",t:{bg:"#1a1e24",surface:"#242830",surface2:"#2e3240",border:"#3a3e4a",text:"#e8eaf0",muted:"#8890a0",accent:"#7090d0",green:"#50a060",red:"#d05050"}}]
                .map(({label,t})=><button key={label} onClick={()=>setTheme(t)} style={{...btnSecondary,fontSize:11}}>{label}</button>)}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setTheme(DEFAULT_THEME)} style={{...btnSecondary,fontSize:11}}>Reset</button>
              <button onClick={closeModal} style={btnPrimary}>Done</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Section manager */}
      {modal==="sections"&&(
        <Modal title="📋 Manage Sections" onClose={closeModal} width={500}>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Each section is its own pattern grid within this project. Switch between them using the dropdown above the grid.</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {(activeProject.sections||[]).map(sec=>(
              <div key={sec.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:sec.id===activeSectionId?C.surface2:C.surface,border:`1px solid ${sec.id===activeSectionId?C.accent:C.border}`,borderRadius:8}}>
                <span style={{fontSize:16,flexShrink:0}}>📐</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:"bold"}}>{sec.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{sec.rows}×{sec.cols} grid</div>
                </div>
                <button onClick={()=>{switchSection(sec.id);closeModal();}} style={{...btnPrimary,fontSize:11,padding:"4px 10px"}}>Open</button>
                <button onClick={()=>openModal("renameSection",{sid:sec.id,name:sec.name})} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Rename</button>
                <button onClick={()=>duplicateSection(sec.id)} style={{...btnSecondary,fontSize:11,padding:"4px 10px"}}>Duplicate</button>
                {(activeProject.sections||[]).length>1&&<button onClick={()=>deleteSection(sec.id)} style={{...btnDanger,fontSize:11,padding:"4px 10px"}}>Delete</button>}
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
            <div style={{fontSize:12,fontWeight:"bold",marginBottom:10}}>Add new section</div>
            <div style={{display:"flex",gap:8}}>
              <input placeholder="Section name, e.g. Sleeve, Border" value={modalData.newSecName||""} onChange={e=>setModalData(d=>({...d,newSecName:e.target.value}))} style={{...inp,flex:1}} onKeyDown={e=>{if(e.key==="Enter"){addSection(modalData.newSecName);setModalData(d=>({...d,newSecName:""}));}}}/>
              <button onClick={()=>{addSection(modalData.newSecName);setModalData(d=>({...d,newSecName:""}));}} style={btnPrimary}>Add</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rename section */}
      {modal==="renameSection"&&(
        <Modal title="Rename Section" onClose={closeModal} width={360}>
          <input value={modalData.name||""} onChange={e=>setModalData(d=>({...d,name:e.target.value}))} autoFocus style={{...inp,marginBottom:14}} onKeyDown={e=>{if(e.key==="Enter"){renameSection(modalData.sid,modalData.name);closeModal();}}}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={()=>{renameSection(modalData.sid,modalData.name);closeModal();}} style={btnPrimary}>Rename</button>
          </div>
        </Modal>
      )}

      {/* Clipboard library */}
      {modal==="clipboard"&&(
        <Modal title="📎 Clipboard Library" onClose={closeModal} width={560}>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Saved selections from any project. Click "Paste" to place a snippet onto the current grid — then click a cell to position it.</div>
          {clipboard.length===0&&<div style={{fontSize:13,color:C.muted,padding:"20px 0",textAlign:"center"}}>No saved snippets yet. Select an area on the grid and click Copy or Cut.</div>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {clipboard.map(entry=>(
              <div key={entry.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
                <div style={{fontSize:11,color:C.muted,flexShrink:0}}>
                  <div style={{display:"flex",gap:2,flexWrap:"wrap",maxWidth:120}}>
                    {entry.cells.slice(0,4).map((row,ri)=>row.slice(0,8).map((cell,ci)=>(
                      <div key={`${ri}_${ci}`} style={{width:10,height:10,background:STITCH_SHADES[cell.stitch]||"#e8e0d8",border:"0.5px solid rgba(0,0,0,0.1)",borderRadius:1,flexShrink:0}}/>
                    )))}
                  </div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:"bold"}}>{entry.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{entry.rows} rows × {entry.cols} sts · {entry.date}</div>
                </div>
                <button onClick={()=>startPaste(entry)} style={{...btnPrimary,fontSize:11,padding:"5px 12px"}}>Paste</button>
                <button onClick={()=>setClipboard(prev=>prev.filter(e=>e.id!==entry.id))} style={{...btnDanger,fontSize:11,padding:"5px 10px"}}>✕</button>
              </div>
            ))}
          </div>
          {clipboard.length>0&&<div style={{marginTop:12,display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setClipboard([])} style={{...btnDanger,fontSize:11}}>Clear all</button></div>}
        </Modal>
      )}

      {/* Resize */}
      {modal==="resize"&&(
        <Modal title="Resize Grid" onClose={closeModal} width={340}>
          {[["Rows",newRows,setNewRows],["Columns",newCols,setNewCols]].map(([lbl2,val,setter])=>(
            <div key={lbl2} style={{marginBottom:14}}>
              <span style={lbl}>{lbl2} (1–60)</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>setter(v=>Math.max(1,v-1))} style={{...btnSecondary,padding:"5px 12px",fontSize:16}}>−</button>
                <input type="number" value={val} min={1} max={60} onChange={e=>setter(Math.max(1,Math.min(60,+e.target.value||1)))} style={{...inp,textAlign:"center",width:70}}/>
                <button onClick={()=>setter(v=>Math.min(60,v+1))} style={{...btnSecondary,padding:"5px 12px",fontSize:16}}>+</button>
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Existing stitches preserved where possible.</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={applyResize} style={btnPrimary}>Apply</button>
          </div>
        </Modal>
      )}

      {/* Edit stitch symbol */}
      {modal==="editStitch"&&(
        <Modal title={`Edit Symbol — ${modalData.label}`} onClose={closeModal} width={400}>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Changes apply to all cells using this stitch globally.</div>
          <div style={{marginBottom:12}}>
            <span style={lbl}>Symbol (1–3 chars)</span>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <input maxLength={3} value={modalData.newSymbol??modalData.currentSymbol} onChange={e=>setModalData(d=>({...d,newSymbol:e.target.value}))} style={{...inp,width:80,textAlign:"center",fontSize:20,fontWeight:"bold"}}/>
              <div style={{width:44,height:44,borderRadius:6,background:STITCH_SHADES[modalData.id]||"#e8e0d8",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:STITCH_TEXT[modalData.id]||"#333",fontWeight:"bold"}}>{modalData.newSymbol??modalData.currentSymbol}</div>
            </div>
          </div>
          <div style={{marginBottom:14}}><span style={lbl}>Description</span><input value={modalData.newDesc??modalData.currentDesc??""} onChange={e=>setModalData(d=>({...d,newDesc:e.target.value}))} style={inp}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setStitchOverrides(p=>{const n={...p};delete n[modalData.id];return n;});closeModal();}} style={{...btnSecondary,fontSize:11}}>Reset</button>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={()=>{setStitchOverrides(p=>({...p,[modalData.id]:{symbol:(modalData.newSymbol??modalData.currentSymbol)||"",desc:(modalData.newDesc??modalData.currentDesc??"")||""}}));closeModal();}} style={btnPrimary}>Save</button>
          </div>
        </Modal>
      )}

      {/* Yarn palette */}
      {modal==="yarnPalette"&&(
        <Modal title="🧶 Yarn Colours" onClose={closeModal} width={460}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            {yarnPalette.map(y=>(
              <div key={y.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.surface2,borderRadius:8,border:`1px solid ${C.border}`}}>
                <input type="color" value={y.color} onChange={e=>updateYarn(y.id,{color:e.target.value})} style={{width:34,height:34,border:"none",borderRadius:6,cursor:"pointer",padding:0}}/>
                <input value={y.name} onChange={e=>updateYarn(y.id,{name:e.target.value})} style={{...inp,flex:1,padding:"5px 8px"}}/>
                <div style={{width:34,height:34,borderRadius:6,background:y.color,border:`1px solid ${C.border}`,flexShrink:0}}/>
                <button onClick={()=>removeYarn(y.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,padding:0}}>✕</button>
              </div>
            ))}
            {yarnPalette.length===0&&<div style={{fontSize:12,color:C.muted}}>No yarns added yet.</div>}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:"bold",marginBottom:10}}>Add new yarn</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <div style={{flex:1}}><span style={lbl}>Name</span><input placeholder="e.g. CA – Black" value={modalData.yName||""} onChange={e=>setModalData(d=>({...d,yName:e.target.value}))} style={inp}/></div>
              <div><span style={lbl}>Colour</span><input type="color" value={modalData.yColor||"#b8834a"} onChange={e=>setModalData(d=>({...d,yColor:e.target.value}))} style={{width:44,height:36,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",padding:2}}/></div>
              <button onClick={addYarn} style={{...btnPrimary,flexShrink:0}}>Add</button>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={closeModal} style={btnPrimary}>Done</button></div>
        </Modal>
      )}

      {/* Custom stitch */}
      {modal==="customStitch"&&(
        <Modal title="➕ Create Custom Stitch" onClose={closeModal} width={440}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Name *</span><input placeholder="e.g. Twisted Knit" value={modalData.csName||""} onChange={e=>setModalData(d=>({...d,csName:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Symbol *</span><input maxLength={3} value={modalData.csSymbol||""} onChange={e=>setModalData(d=>({...d,csSymbol:e.target.value}))} style={{...inp,textAlign:"center",fontSize:16,fontWeight:"bold"}}/></div>
            <div><span style={lbl}>Abbreviation</span><input maxLength={4} value={modalData.csAbbr||""} onChange={e=>setModalData(d=>({...d,csAbbr:e.target.value}))} style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Description</span><input value={modalData.csDesc||""} onChange={e=>setModalData(d=>({...d,csDesc:e.target.value}))} style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={lbl}>Default colour</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="color" value={modalData.csColor||"#e8d5c4"} onChange={e=>setModalData(d=>({...d,csColor:e.target.value}))} style={{width:38,height:34,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",padding:2}}/>
                <input value={modalData.csColor||"#e8d5c4"} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))setModalData(d=>({...d,csColor:e.target.value}));}} style={{...inp,flex:1,fontFamily:"monospace"}}/>
                <div style={{width:34,height:34,borderRadius:4,background:modalData.csColor||"#e8d5c4",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:"bold",color:contrastText(modalData.csColor||"#e8d5c4")}}>{modalData.csSymbol||"?"}</div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={addCustomStitch} disabled={!modalData.csName?.trim()||!modalData.csSymbol?.trim()} style={{...btnPrimary,opacity:(!modalData.csName?.trim()||!modalData.csSymbol?.trim())?0.5:1}}>Add Stitch</button>
          </div>
        </Modal>
      )}

      {/* Import */}
      {modal==="import"&&(
        <Modal title="🪄 Import Pattern" onClose={closeModal} width={560}>
          <div style={{marginBottom:14}}>
            <span style={lbl}>Upload pattern image (optional)</span>
            <div style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:14,textAlign:"center",background:C.surface2,cursor:"pointer"}} onClick={()=>fileInputRef.current?.click()}>
              {importImage?<div style={{fontSize:13,color:C.green}}>✓ Image ready</div>:<div style={{fontSize:13,color:C.muted}}>Click to upload</div>}
              <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageFile}/>
            </div>
            {importImage&&<button onClick={()=>setImportImage(null)} style={{...btnSecondary,marginTop:6,fontSize:11}}>✕ Remove</button>}
          </div>
          <div style={{marginBottom:14}}>
            <span style={lbl}>Or paste pattern text</span>
            <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder={"Row 1: CO 12\nRow 2: K2, P2, repeat\nLast row: BO all sts"} style={{...inp,minHeight:110,resize:"vertical",lineHeight:1.7}}/>
          </div>
          {importError&&<div style={{padding:"8px 12px",background:"#fdecea",border:"1px solid #f5c0bb",borderRadius:6,fontSize:12,color:C.red,marginBottom:12}}>⚠ {importError}</div>}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={handleImport} disabled={importing||(!importText.trim()&&!importImage)} style={{...btnPrimary,opacity:importing||(!importText.trim()&&!importImage)?0.5:1,display:"flex",alignItems:"center",gap:8}}>
              {importing?<><span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.4)",borderTop:`2px solid ${contrastText(C.accent)}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Interpreting…</>:"🪄 Convert"}
            </button>
          </div>
        </Modal>
      )}

      {/* Row note */}
      {modal==="rowNote"&&(
        <Modal title={`Note — Row ${gridRows-modalData.ri}`} onClose={closeModal} width={380}>
          <textarea value={modalData.text||""} onChange={e=>setModalData(d=>({...d,text:e.target.value}))} autoFocus style={{...inp,minHeight:90,resize:"vertical",marginBottom:12}}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            {rowNotes[modalData.ri]&&<button onClick={()=>{setRowNotes(p=>{const n={...p};delete n[modalData.ri];return n;});closeModal();}} style={btnDanger}>Delete</button>}
            <button onClick={()=>{setRowNotes(p=>({...p,[modalData.ri]:modalData.text||""}));closeModal();}} style={btnPrimary}>Save</button>
          </div>
        </Modal>
      )}

      {/* Mistake note */}
      {modal==="mistakeNote"&&(
        <Modal title={`⚠ Mistake — Row ${gridRows-modalData.ri}, Col ${modalData.ci+1}`} onClose={closeModal} width={380}>
          <textarea value={modalData.note||""} onChange={e=>setModalData(d=>({...d,note:e.target.value}))} autoFocus style={{...inp,minHeight:80,resize:"vertical",marginBottom:12}}/>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={closeModal} style={btnSecondary}>Cancel</button>
            <button onClick={()=>{clearMistake(modalData.ri,modalData.ci);closeModal();}} style={btnDanger}>Remove</button>
            <button onClick={()=>{setMistakeNote(modalData.ri,modalData.ci,modalData.note||"");closeModal();}} style={btnPrimary}>Save</button>
          </div>
        </Modal>
      )}

      {/* Repeat marker */}
      {modal==="repeat"&&(
        <Modal title="Add Repeat Section Marker" onClose={closeModal} width={400}>
          {[["Label","label","text","e.g. Cable Repeat"],["Row from","rStart","number",""],["Row to","rEnd","number",""],["Col from","cStart","number",""],["Col to","cEnd","number",""]].map(([l,key,type,ph])=>(
            <div key={key} style={{marginBottom:10}}><span style={lbl}>{l}</span><input type={type} placeholder={ph} value={modalData[key]||""} onChange={e=>setModalData(d=>({...d,[key]:e.target.value}))} style={inp}/></div>
          ))}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:6}}><button onClick={closeModal} style={btnSecondary}>Cancel</button><button onClick={addRepeat} style={btnPrimary}>Add</button></div>
        </Modal>
      )}

      {/* New/Edit Project */}
      {modal==="newProject"&&(
        <Modal title={editingProject?"Edit Project":"New Project"} onClose={()=>{closeModal();setEditingProject(null);}} width={460}>
          {[["Project name","pName","text","e.g. Cabled Beanie"],["Yarn","pYarn","text","e.g. Merino DK – Slate"],["Needle size","pNeedles","text","e.g. 4mm"]].map(([l,key,type,ph])=>(
            <div key={key} style={{marginBottom:10}}><span style={lbl}>{l}</span><input type={type} placeholder={ph} value={modalData[key]||""} onChange={e=>setModalData(d=>({...d,[key]:e.target.value}))} style={inp}/></div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><span style={lbl}>Status</span><select value={modalData.pStatus||"Active"} onChange={e=>setModalData(d=>({...d,pStatus:e.target.value}))} style={inp}>{PROJECT_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><span style={lbl}>Type</span><select value={modalData.pType||"Accessory"} onChange={e=>setModalData(d=>({...d,pType:e.target.value}))} style={inp}>{PROJECT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{marginBottom:14}}><span style={lbl}>Notes</span><textarea value={modalData.pNotes||""} onChange={e=>setModalData(d=>({...d,pNotes:e.target.value}))} style={{...inp,minHeight:70,resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{closeModal();setEditingProject(null);}} style={btnSecondary}>Cancel</button>
            <button onClick={()=>{
              if(!modalData.pName?.trim())return;
              if(editingProject)updateProject(editingProject,{name:modalData.pName,yarn:modalData.pYarn||"",needles:modalData.pNeedles||"",status:modalData.pStatus||"Active",type:modalData.pType||"Accessory",notes:modalData.pNotes||""});
              else{const sec=makeSection("Main Pattern");const np={id:newId(),name:modalData.pName,yarn:modalData.pYarn||"",needles:modalData.pNeedles||"",status:modalData.pStatus||"Active",type:modalData.pType||"Accessory",notes:modalData.pNotes||"",photos:[],log:[],created:today(),yarnPalette:[],sections:[sec],activeSectionId:sec.id};setProjects(prev=>[np,...prev]);setActiveProjectId(np.id);}
              closeModal();setEditingProject(null);
            }} style={btnPrimary}>{editingProject?"Save":"Create"}</button>
          </div>
        </Modal>
      )}

      {/* Log session */}
      {modal==="log"&&(
        <Modal title="Log a Work Session" onClose={closeModal} width={420}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><span style={lbl}>Date</span><input type="date" value={logDate[0]} onChange={e=>setLog.date(e.target.value)} style={inp}/></div>
            <div><span style={lbl}>Hours</span><input type="number" step="0.5" min="0" value={logHours[0]} onChange={e=>setLog.hours(e.target.value)} style={inp}/></div>
            <div><span style={lbl}>Rows from</span><input type="number" min="1" value={logRowsFrom[0]} onChange={e=>setLog.rowsFrom(e.target.value)} style={inp}/></div>
            <div><span style={lbl}>Rows to</span><input type="number" min="1" value={logRowsTo[0]} onChange={e=>setLog.rowsTo(e.target.value)} style={inp}/></div>
          </div>
          <div style={{marginBottom:12}}><span style={lbl}>Notes</span><input value={logNote[0]} onChange={e=>setLog.note(e.target.value)} style={inp}/></div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={closeModal} style={btnSecondary}>Cancel</button><button onClick={addLogEntry} style={btnPrimary}>Save</button></div>
        </Modal>
      )}

      {/* New / Edit spinning project */}
      {modal==="newSpinProject"&&(
        <Modal title={editingSpinProject?"Edit Spinning Project":"New Spinning Project"} onClose={()=>{closeModal();setEditingSpinProject(null);}} width={520}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Project Name *</span><input autoFocus value={modalData.spName||""} onChange={e=>setModalData(d=>({...d,spName:e.target.value}))} style={inp} onKeyDown={e=>{if(e.key==="Enter")saveSpinProject();}}/></div>
            {/* Fibre */}
            <div><span style={lbl}>Fibre Type</span><select value={modalData.spFiberType||""} onChange={e=>setModalData(d=>({...d,spFiberType:e.target.value}))} style={inp}><option value="">Select…</option>{FIBER_TYPES.map(f=><option key={f}>{f}</option>)}</select></div>
            <div><span style={lbl}>Purchased Weight (g)</span><input type="number" min="0" value={modalData.spFiberWeight||""} onChange={e=>setModalData(d=>({...d,spFiberWeight:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Source / Dyer</span><input value={modalData.spSource||""} onChange={e=>setModalData(d=>({...d,spSource:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Colorway</span><input value={modalData.spColorway||""} onChange={e=>setModalData(d=>({...d,spColorway:e.target.value}))} style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><span style={lbl}>Purchase Place</span><input placeholder="e.g. Fibre East, local show, online…" value={modalData.spPurchasePlace||""} onChange={e=>setModalData(d=>({...d,spPurchasePlace:e.target.value}))} style={inp}/></div>
            {/* Tool */}
            <div style={{gridColumn:"1/-1",borderTop:`1px solid ${C.border}`,paddingTop:10,marginTop:2}}><span style={{...lbl,letterSpacing:1}}>TOOL</span></div>
            <div><span style={lbl}>Tool</span><select value={modalData.spTool||"Wheel"} onChange={e=>setModalData(d=>({...d,spTool:e.target.value}))} style={inp}>{SPIN_TOOLS.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><span style={lbl}>Tool Details</span><input placeholder="Wheel name, spindle weight…" value={modalData.spToolDetails||""} onChange={e=>setModalData(d=>({...d,spToolDetails:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Ratio / Whorl</span><input placeholder="e.g. 9:1" value={modalData.spRatio||""} onChange={e=>setModalData(d=>({...d,spRatio:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Plies</span><input type="number" min="1" max="8" value={modalData.spPlies||2} onChange={e=>setModalData(d=>({...d,spPlies:+e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Target Yardage</span><input type="number" min="0" value={modalData.spTargetYardage||""} onChange={e=>setModalData(d=>({...d,spTargetYardage:e.target.value}))} style={inp}/></div>
            <div><span style={lbl}>Status</span><select value={modalData.spStatus||"Active"} onChange={e=>setModalData(d=>({...d,spStatus:e.target.value}))} style={inp}>{SPIN_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{closeModal();setEditingSpinProject(null);}} style={btnSecondary}>Cancel</button>
            <button onClick={saveSpinProject} style={btnPrimary}>{editingSpinProject?"Save":"Create"}</button>
          </div>
        </Modal>
      )}

      {/* Spinning log session */}
      {modal==="spinLog"&&(
        <Modal title="Log Spinning Session" onClose={closeModal} width={400}>
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

      {/* Export */}
      {modal==="export"&&(
        <Modal title="⬇ Export" onClose={closeModal} width={480}>
          {(()=>{
            const ctx=modalData.exportContext||"";
            const isAll=ctx.includes("all");
            const isKnit=ctx.startsWith("knitting");
            const fmtOpts=[
              ...(!isAll?[
                {v:"html",label:"Shareable HTML",desc:"Formatted page with grid layout — opens in any browser, print-ready"},
              ]:[]),
              {v:"json",label:"Backup (JSON)",desc:"Full data backup including embedded photos — for archive or import"},
              ...(!isAll&&isKnit?[{v:"image",label:"Pattern Image (PNG)",desc:"Grid exported as a pixel-perfect image"}]:[]),
            ];
            return (
              <>
                <div style={{marginBottom:14}}>
                  <span style={lbl}>Format</span>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {fmtOpts.map(o=>(
                      <label key={o.v} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderRadius:8,border:`1px solid ${exportFormat===o.v?C.accent:C.border}`,background:exportFormat===o.v?C.surface2:C.surface,cursor:"pointer"}}>
                        <input type="radio" name="expFmt" value={o.v} checked={exportFormat===o.v} onChange={()=>setExportFormat(o.v)} style={{marginTop:3,accentColor:C.accent,flexShrink:0}}/>
                        <div><div style={{fontSize:13,fontWeight:"bold",color:C.text}}>{o.label}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{o.desc}</div></div>
                      </label>
                    ))}
                  </div>
                </div>
                {!isAll&&(
                  <div style={{marginBottom:16}}>
                    <div style={{marginBottom:8}}><span style={lbl}>Ownership / Attribution</span></div>
                    {/* --- three attribution radio options --- */}
                    {[
                      {v:"original", label:"My original design"},
                      {v:"modified", label:"Modified version of another designer's work"},
                      {v:"other",    label:"Another designer's work (no changes)"},
                    ].map(opt=>(
                      <label key={opt.v} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer",fontSize:13,color:C.text}}>
                        <input type="radio" name="exportAttribution" value={opt.v}
                          checked={exportAttribution===opt.v}
                          onChange={()=>setExportAttribution(opt.v)}
                          style={{accentColor:C.accent,cursor:"pointer"}}/>
                        {opt.label}
                      </label>
                    ))}
                    {/* --- conditional name fields --- */}
                    {(exportAttribution==="modified"||exportAttribution==="other")&&(
                      <div style={{marginTop:6,marginBottom:6}}>
                        <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Original designer's name</div>
                        <input value={exportOriginalDesigner} onChange={e=>setExportOriginalDesigner(e.target.value)}
                          placeholder="e.g. Jane Smith — janeknits.com" style={inp}/>
                      </div>
                    )}
                    {(exportAttribution==="original"||exportAttribution==="modified")&&(
                      <div style={{marginTop:6,marginBottom:6}}>
                        <div style={{fontSize:11,color:C.muted,marginBottom:3}}>{exportAttribution==="modified"?"Your name (modifier)":"Your name"}</div>
                        <input value={exportCreator} onChange={e=>setExportCreator(e.target.value)}
                          placeholder="e.g. Your Name — yoursite.com" style={inp}/>
                      </div>
                    )}
                    {/* --- live preview --- */}
                    {getAttributionLine()?(
                      <div style={{fontSize:11,color:C.muted,marginTop:8,padding:"6px 10px",background:C.surface2,borderRadius:6,border:`1px solid ${C.border}`}}>
                        Will add: {getAttributionLine().replace(/&#169;/g,"©").replace(/&#8212;/g,"—")}
                      </div>
                    ):(
                      <div style={{fontSize:11,color:C.muted,marginTop:8,fontStyle:"italic"}}>
                        {exportAttribution==="other"?"Enter the designer's name above to generate an attribution line.":
                         exportAttribution==="original"?"Enter your name above to add a copyright line (optional).":
                         "Enter name(s) above to generate an attribution line."}
                      </div>
                    )}
                  </div>
                )}
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={closeModal} style={btnSecondary}>Cancel</button>
                  <button onClick={runExport} style={btnPrimary}>Export</button>
                </div>
              </>
            );
          })()}
        </Modal>
      )}

      {/* ═══ HEADER ══════════════════════════════════════════════════════ */}
      <div style={{background:C.text,color:C.bg,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`3px solid ${C.accent}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>🧶</span>
          <div><div style={{fontSize:18,fontWeight:"bold",letterSpacing:1}}>Woolwork</div><div style={{fontSize:9,opacity:0.5,letterSpacing:2}}>KNITTING PATTERN STUDIO</div></div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
          {/* Mode toggle */}
          <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.1)",borderRadius:20,padding:3,marginRight:6}}>
            {[["knitting","🧶 Knitting"],["spinning","🪡 Spinning"]].map(([m,label])=>(
              <button key={m} onClick={()=>setAppMode(m)} style={{padding:"5px 14px",borderRadius:16,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:"bold",background:appMode===m?C.accent:"transparent",color:appMode===m?contrastText(C.accent):"rgba(255,255,255,0.65)",transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          {appMode==="knitting"&&["pattern","projects","log","notes"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{...btnTab(view===v),color:view===v?contrastText(C.accent):"rgba(255,255,255,0.6)"}}>
              {v==="log"?"Work Log":v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
          <button onClick={()=>openModal("theme")} style={{...btnSecondary,marginLeft:8,fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.7)"}}>🎨 Theme</button>
        </div>
      </div>

      {/* Project banner — knitting only */}
      <div style={{background:C.surface2,borderBottom:`1px solid ${C.border}`,padding:"8px 24px",display:appMode==="knitting"?"flex":"none",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{fontWeight:"bold",fontSize:14}}>{activeProject.name}</div>
        <div style={{fontSize:12,color:C.muted}}>🪡 {activeProject.yarn} · {activeProject.needles}</div>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:activeProject.status==="Complete"?C.green:activeProject.status==="Paused"?"#c09050":C.accent,color:contrastText(activeProject.status==="Complete"?C.green:activeProject.status==="Paused"?"#c09050":C.accent)}}>{activeProject.status}</span>
        {mistakeCount>0&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:"#fdecea",color:C.red,border:"1px solid #f5c0bb"}}>⚠ {mistakeCount} mistake{mistakeCount!==1?"s":""}</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:100,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{width:`${progressPct}%`,height:"100%",background:C.accent,borderRadius:3}}/></div>
          <span style={{fontSize:11,color:C.muted}}>{progressPct}%</span>
        </div>
      </div>

      {appMode==="knitting"&&importSuccess&&(
        <div style={{background:"#edf5ed",borderBottom:"1px solid #b8d4b8",padding:"7px 24px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:C.green}}>✓</span><span style={{fontSize:13}}><strong>Imported:</strong> {importSuccess}</span>
          <button onClick={()=>setImportSuccess("")} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16}}>✕</button>
        </div>
      )}

      {appMode==="knitting"&&pastePreview&&(
        <div style={{background:"#fff8e6",borderBottom:"1px solid #f0d080",padding:"7px 24px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13}}>📋 Click any cell on the grid to paste {pastePreview.cells.length}×{pastePreview.cells[0]?.length||0} snippet</span>
          <button onClick={()=>setPastePreview(null)} style={{marginLeft:"auto",...btnSecondary,fontSize:11}}>Cancel</button>
        </div>
      )}

      <div style={{padding:"16px 24px"}}>

        {/* ═══ PATTERN VIEW ════════════════════════════════════════════ */}
        {appMode==="knitting"&&view==="pattern"&&(
          <div>

            {/* ── Section selector ── */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:10,color:C.muted,letterSpacing:1,flexShrink:0}}>SECTION</span>
              <select
                value={activeSectionId}
                onChange={e=>switchSection(e.target.value)}
                style={{...inp,width:"auto",minWidth:160,cursor:"pointer",fontSize:13,fontWeight:"bold",color:C.text}}>
                {(activeProject.sections||[]).map(sec=>(
                  <option key={sec.id} value={sec.id}>{sec.name} ({sec.rows}×{sec.cols})</option>
                ))}
              </select>
              <button onClick={()=>openModal("sections")} style={{...btnSecondary,fontSize:11,padding:"4px 12px"}}>⚙ Manage sections</button>
              <button onClick={()=>addSection()} style={{...btnSecondary,fontSize:11,padding:"4px 12px"}}>+ Add section</button>
              <div style={{marginLeft:"auto",fontSize:11,color:C.muted}}>
                {(activeProject.sections||[]).length} section{(activeProject.sections||[]).length!==1?"s":""} in this project
              </div>
            </div>

            {/* ── Yarn palette ── */}
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:10,color:C.muted,letterSpacing:1}}>YARN COLOURS</span>
                <button onClick={()=>openModal("yarnPalette",{})} style={{...btnSecondary,fontSize:11,padding:"2px 10px",marginLeft:"auto"}}>Manage</button>
                {selectedYarn&&<button onClick={()=>setSelectedYarn(null)} style={{...btnSecondary,fontSize:11,padding:"2px 10px",color:C.muted}}>✕ None</button>}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                {yarnPalette.length===0&&<span style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>No yarns — click "Manage" to add.</span>}
                {yarnPalette.map(y=>(
                  <button key={y.id} onClick={()=>setSelectedYarn(selectedYarn===y.id?null:y.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,cursor:"pointer",border:selectedYarn===y.id?`2px solid ${C.text}`:`1px solid ${C.border}`,background:selectedYarn===y.id?C.surface2:C.surface,fontFamily:"inherit",fontSize:12,color:C.text,boxShadow:selectedYarn===y.id?"0 2px 6px rgba(0,0,0,0.1)":"none"}}>
                    <div style={{width:16,height:16,borderRadius:"50%",background:y.color,border:`1px solid ${C.border}`,flexShrink:0}}/>
                    {y.name}
                  </button>
                ))}
                {selectedYarn&&<span style={{fontSize:11,color:C.muted}}>Painting with <strong style={{color:C.text}}>{yarnPalette.find(y=>y.id===selectedYarn)?.name}</strong></span>}
              </div>
            </div>

            {/* ── Stitch palette ── */}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:10,color:C.muted,letterSpacing:1}}>STITCH TYPE</span>
                <button onClick={()=>openModal("customStitch",{})} style={{...btnSecondary,fontSize:11,padding:"2px 10px",marginLeft:"auto"}}>➕ Custom stitch</button>
              </div>
              {GROUPS.filter(g=>g!=="custom"||customStitches.length>0).map(group=>{
                const stitches=[...BUILTIN_STITCHES,...customStitches].filter(s=>s.group===group);
                if(!stitches.length)return null;
                return (
                  <div key={group} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:9,color:C.muted,minWidth:64,textAlign:"right",flexShrink:0}}>{GROUP_LABELS[group]}</span>
                    {stitches.map(st=>{
                      const s=getStitch(st.id);
                      const bg=st.id==="mistake"?"#fdecea":(st.shade||STITCH_SHADES[st.id]||"#e8e0d8");
                      const tc=st.id==="mistake"?C.red:(STITCH_TEXT[st.id]||"#3a2a1a");
                      return (
                        <button key={st.id} onClick={()=>{setSelectedStitch(st.id);setSelMode(false);setMarkerMode(false);}}
                          onDoubleClick={()=>{if(st.group!=="marker"&&st.id!=="empty")openModal("editStitch",{id:st.id,label:s.label,abbr:s.abbr,currentSymbol:s.symbol,currentDesc:s.desc||""});}}
                          title={`${s.label} (${s.abbr})${s.desc?` — ${s.desc}`:""}\nDouble-click to edit`}
                          style={{width:34,height:34,borderRadius:4,background:bg,border:selectedStitch===st.id&&!selMode&&!markerMode?`2px solid ${C.text}`:`1px solid ${C.border}`,cursor:"pointer",fontSize:12,color:tc,fontWeight:"bold",boxShadow:selectedStitch===st.id&&!selMode&&!markerMode?"0 2px 6px rgba(0,0,0,0.15)":"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.1s",position:"relative"}}>
                          {s.symbol||<span style={{fontSize:8,color:"#bbb"}}>–</span>}
                          {stitchOverrides[st.id]&&<span style={{position:"absolute",top:1,right:2,fontSize:6,color:C.accent}}>✎</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ── Toolbar ── */}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,marginBottom:10,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:12,color:C.muted}}>
                {selMode?<>Mode: <strong style={{color:C.text}}>Select</strong></>:markerMode?<>Mode: <strong style={{color:C.text}}>Stitch Markers</strong></>:<>Stitch: <strong style={{color:C.text}}>{getStitch(selectedStitch).label}</strong></>}
              </span>
              <div style={{marginLeft:"auto",display:"flex",gap:5,flexWrap:"wrap"}}>
                {/* Select button always visible */}
                <button onClick={()=>{setSelMode(v=>{const next=!v;if(next){setMarkerMode(false);}else{setSelection(null);setSelAction(null);}return next;})}}
                  style={{...btnSecondary,background:selMode?C.accent:"transparent",color:selMode?contrastText(C.accent):C.text,border:`1px solid ${selMode?C.accent:C.border}`,fontWeight:selMode?"bold":"normal"}}>
                  ⬚ Select
                </button>
                {/* Selection transform actions — shown when a selection is active */}
                {selAction&&(
                  <>
                    <button onClick={()=>applySelectionTransform(rotateCW)}  style={{...btnSecondary,fontSize:11,padding:"5px 10px"}}>↻ Rotate</button>
                    <button onClick={()=>applySelectionTransform(flipH)}     style={{...btnSecondary,fontSize:11,padding:"5px 10px"}}>↔ Flip H</button>
                    <button onClick={()=>applySelectionTransform(flipV)}     style={{...btnSecondary,fontSize:11,padding:"5px 10px"}}>↕ Flip V</button>
                    <button onClick={()=>copySelection(false)} style={{...btnSecondary,fontSize:11,padding:"5px 10px"}}>📋 Copy</button>
                    <button onClick={()=>copySelection(true)}  style={{...btnDanger,fontSize:11,padding:"5px 10px"}}>✂ Cut</button>
                    <button onClick={()=>{setSelection(null);setSelAction(null);setSelMode(false);}} style={{...btnSecondary,fontSize:11,padding:"5px 10px",color:C.muted}}>✕ Deselect</button>
                  </>
                )}
                {/* Normal tools — always visible */}
                <button onClick={()=>{setSelMode(false);setMarkerMode(v=>!v);}}
                  style={{...btnSecondary,background:markerMode?C.accent:"transparent",color:markerMode?contrastText(C.accent):C.text,border:`1px solid ${markerMode?C.accent:C.border}`}}>
                  🔴 Markers
                </button>
                <button onClick={()=>openModal("clipboard")} style={{...btnSecondary,position:"relative"}}>
                  📎 Paste{clipboard.length>0&&<span style={{position:"absolute",top:-4,right:-4,background:C.accent,color:contrastText(C.accent),borderRadius:"50%",width:14,height:14,fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold"}}>{clipboard.length}</span>}
                </button>
                <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",alignItems:"center"}}>
                  <button onClick={()=>setZoom(z=>Math.max(0.5,+(z-0.25).toFixed(2)))} style={{padding:"5px 9px",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:C.text,fontFamily:"inherit"}}>−</button>
                  <span style={{padding:"4px 7px",fontSize:11,color:C.muted,borderLeft:`1px solid ${C.border}`,borderRight:`1px solid ${C.border}`}}>{Math.round(zoom*100)}%</span>
                  <button onClick={()=>setZoom(z=>Math.min(3,+(z+0.25).toFixed(2)))} style={{padding:"5px 9px",border:"none",background:"transparent",cursor:"pointer",fontSize:14,color:C.text,fontFamily:"inherit"}}>+</button>
                </div>
                <button onClick={()=>{setNewRows(gridRows);setNewCols(gridCols);openModal("resize");}} style={btnSecondary}>⊞ Resize</button>
                <button onClick={()=>openModal("repeat")} style={btnSecondary}>⌷ Repeat</button>
                <button onClick={()=>{setImportText("");setImportImage(null);setImportError("");openModal("import");}} style={btnPrimary}>🪄 Import</button>
                <button onClick={()=>openModal("export",{exportContext:"knitting-project"})} style={btnSecondary}>⬇ Export</button>
                <button onClick={()=>setShowSymbolKey(v=>!v)} style={btnSecondary}>{showSymbolKey?"Hide":"Show"} Key</button>
                <button onClick={clearGrid} style={{...btnSecondary,color:C.muted}}>Clear</button>
              </div>
            </div>

            {/* ── Stitch key ── */}
            {showSymbolKey&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:10}}>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>STITCH KEY — double-click any palette button to edit symbol</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {[...BUILTIN_STITCHES,...customStitches].filter(s=>s.id!=="empty"&&s.id!=="mistake").map(st=>{
                    const s=getStitch(st.id);
                    return (
                      <div key={st.id} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:20,height:20,borderRadius:3,background:st.shade||STITCH_SHADES[st.id]||"#e8e0d8",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:STITCH_TEXT[st.id]||"#333",fontWeight:"bold"}}>{s.symbol}</div>
                        <span style={{fontSize:11,color:C.muted}}>{s.abbr} — {s.label}</span>
                        {st.group==="custom"&&<button onClick={()=>setCustomStitches(p=>p.filter(x=>x.id!==st.id))} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:10,padding:0}}>✕</button>}
                      </div>
                    );
                  })}
                </div>
                {yarnPalette.length>0&&(
                  <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:10}}>
                    {yarnPalette.map(y=>(
                      <div key={y.id} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:20,height:20,borderRadius:3,background:y.color,border:`1px solid ${C.border}`}}/>
                        <span style={{fontSize:11,color:C.muted}}>{y.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {repeatMarkers.length>0&&(
                  <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`,display:"flex",flexWrap:"wrap",gap:8}}>
                    {repeatMarkers.map(m=>(
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.muted,background:C.surface2,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.border}`}}>
                        ⌷ {m.label}
                        <button onClick={()=>setRepeatMarkers(p=>p.filter(x=>x.id!==m.id))} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Grid ── */}
            <div style={{overflowX:"auto",overflowY:"auto",maxHeight:"55vh"}}>
              {(()=>{
                const ColRuler=({mt=0,mb=0})=>(
                  <div style={{display:"flex",marginTop:mt,marginBottom:mb}}>
                    <div style={{flexShrink:0,width:96}}/>
                    <div style={{display:"flex",flexDirection:"column"}}>
                      <div style={{display:"flex"}}>
                        {Array.from({length:gridCols},(_,ci)=>{const n=ci+1,isTen=n%10===0,isFive=n%5===0;return <div key={ci} style={{width:cellSize,flexShrink:0,textAlign:"center",fontSize:8,lineHeight:"12px",color:isTen?C.accent:C.muted,fontWeight:isTen?"bold":"normal"}}>{isTen?n:isFive?"·":""}</div>;})}
                      </div>
                      <div style={{display:"flex"}}>
                        {Array.from({length:gridCols},(_,ci)=>{const n=ci+1,isTen=n%10===0,isFive=n%5===0;return <div key={ci} style={{width:cellSize,flexShrink:0,display:"flex",justifyContent:"center",alignItems:"flex-start"}}>{(isFive||isTen)&&<div style={{width:isTen?2:1,height:isTen?7:4,background:isTen?C.accent:C.border}}/>}</div>;})}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <>
                    <ColRuler mb={2}/>
                    {grid.map((row,ri)=>{
                      const displayRow=gridRows-ri;
                      const done=completedRows.has(ri),isCurrent=ri===currentRow,hasNote=!!rowNotes[ri];
                      const rw=getRowWidth(ri),isCustomWidth=rowWidths[ri]!=null;
                      const isFiveRow=displayRow%5===0,isTenRow=displayRow%10===0;
                      return (
                        <div key={ri} style={{display:"flex",alignItems:"center",background:isCurrent?accentRgba(0.07):"transparent",opacity:done?0.45:1,borderBottom:isTenRow?`2.5px solid ${C.accent}`:isFiveRow?`1.5px solid ${C.border}`:"none"}}>
                          <div style={{width:96,flexShrink:0,display:"flex",alignItems:"center",gap:3,paddingRight:4,borderLeft:isCurrent?`3px solid ${C.accent}`:"3px solid transparent"}}>
                            <button onClick={()=>toggleRowComplete(ri)} style={{width:13,height:13,borderRadius:"50%",flexShrink:0,border:done?"none":`1px solid ${C.border}`,background:done?C.accent:"transparent",cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              {done&&<span style={{color:contrastText(C.accent),fontSize:7,fontWeight:"bold"}}>✓</span>}
                            </button>
                            <span style={{fontSize:9,color:isCurrent?C.accent:isTenRow?C.accent:C.muted,fontWeight:(isCurrent||isTenRow)?"bold":"normal",minWidth:18,textAlign:"right",flexShrink:0}}>{displayRow}</span>
                            <button onClick={()=>setCurrentRow(ri)} style={{width:5,height:5,borderRadius:"50%",padding:0,border:"none",background:isCurrent?C.accent:"transparent",cursor:"pointer",flexShrink:0}}/>
                            <button onClick={()=>openModal("rowNote",{ri,text:rowNotes[ri]||""})} title="Row note" style={{width:13,height:13,borderRadius:2,padding:0,border:`1px solid ${hasNote?C.accent:C.border}`,background:hasNote?C.surface2:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:hasNote?C.accent:C.muted,flexShrink:0}}>✎</button>
                            <button onClick={()=>setRowWidth(ri,rw-1)} title="−1 stitch" style={{width:11,height:11,borderRadius:2,padding:0,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:8,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                            <span style={{fontSize:7,color:isCustomWidth?C.accent:"transparent",minWidth:10,textAlign:"center",flexShrink:0,cursor:isCustomWidth?"pointer":"default"}} onClick={()=>isCustomWidth&&resetRowWidth(ri)}>{isCustomWidth?rw:"·"}</span>
                            <button onClick={()=>setRowWidth(ri,rw+1)} title="+1 stitch" style={{width:11,height:11,borderRadius:2,padding:0,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",fontSize:8,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                          </div>
                          {row.map((cell,ci)=>{
                            const s=getStitch(cell.stitch);
                            const mistake=hasMistake(ri,ci);
                            const bg=mistake?"#fdecea":getCellBg(cell);
                            const tc=mistake?C.red:getCellText(cell);
                            const rep=getRepeat(ri,ci);
                            const isFiveCol=(ci+1)%5===0,isTenCol=(ci+1)%10===0;
                            const inSel=inSelection(ri,ci);
                            const isMarked=stitchMarkers.has(`${ri}_${ci}`);
                            return (
                              <div key={ci}
                                onMouseDown={()=>handleCellDown(ri,ci)}
                                onMouseEnter={()=>handleCellEnter(ri,ci)}
                                onDoubleClick={()=>{if(mistake)openModal("mistakeNote",{ri,ci,note:mistakeNote(ri,ci)});}}
                                onClick={()=>{if(pastePreview)commitPaste(ri,ci);}}
                                title={pastePreview?"Click to paste here":selMode?"Click and drag to select":markerMode?"Toggle marker":mistake?(mistakeNote(ri,ci)?`⚠ ${mistakeNote(ri,ci)}`:"⚠ double-click to note"):`${s.label}${yarnPalette.find(y=>y.id===cell.yarn)?` · ${yarnPalette.find(y=>y.id===cell.yarn).name}`:""}`}
                                style={{
                                  width:cellSize,height:cellSize,flexShrink:0,
                                  background:inSel?accentRgba(0.18):bg,
                                  border:`0.5px solid rgba(184,165,149,0.3)`,
                                  borderRight:isTenCol?`2.5px solid ${C.accent}`:isFiveCol?`1.5px solid ${C.border}`:`0.5px solid rgba(184,165,149,0.3)`,
                                  outline:inSel?`2px solid ${C.accent}`:mistake?`1.5px solid ${C.red}`:rep?`1.5px solid ${C.accent}`:undefined,
                                  outlineOffset:"-1px",
                                  display:"flex",alignItems:"center",justifyContent:"center",
                                  fontSize:Math.max(8,cellSize*0.44),color:tc,fontWeight:"bold",
                                  cursor:selMode?"crosshair":markerMode?"cell":pastePreview?"copy":"crosshair",
                                  position:"relative",boxSizing:"border-box",
                                }}>
                                {mistake?"!":s.symbol}
                                {isMarked&&<div style={{position:"absolute",inset:1,borderRadius:"50%",border:`2px solid #e04040`,pointerEvents:"none",zIndex:2}}/>}
                              </div>
                            );
                          })}
                          {hasNote&&<span style={{fontSize:9,color:C.muted,fontStyle:"italic",paddingLeft:8,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:160}}>{rowNotes[ri]}</span>}
                        </div>
                      );
                    })}
                    {/* Row 0 */}
                    <div style={{display:"flex",alignItems:"center",borderTop:`2px solid ${C.accent}`,marginTop:1}}>
                      <div style={{width:96,flexShrink:0,display:"flex",alignItems:"center",gap:4,paddingLeft:3}}>
                        <span style={{fontSize:9,color:C.accent,fontWeight:"bold"}}>0</span>
                        <span style={{fontSize:8,color:C.muted,fontStyle:"italic"}}>Cast On</span>
                      </div>
                      {Array.from({length:gridCols},(_,ci)=>{
                        const isFiveCol=(ci+1)%5===0,isTenCol=(ci+1)%10===0;
                        return <div key={ci} style={{width:cellSize,height:cellSize,flexShrink:0,background:STITCH_SHADES["co"],border:`0.5px solid rgba(100,80,60,0.3)`,borderRight:isTenCol?`2.5px solid ${C.accent}`:isFiveCol?`1.5px solid ${C.border}`:`0.5px solid rgba(100,80,60,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(8,cellSize*0.44),color:STITCH_TEXT["co"],fontWeight:"bold",cursor:"default"}}>{getStitch("co").symbol}</div>;
                      })}
                    </div>
                    <ColRuler mt={2}/>
                  </>
                );
              })()}
            </div>

            {/* Progress bar */}
            <div style={{marginTop:10,padding:"10px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <span style={{fontSize:13}}>📍 Row <strong style={{color:C.accent}}>{gridRows-currentRow}</strong> / {gridRows}</span>
              <span style={{fontSize:13,color:C.muted}}>✅ {completedCount}/{gridRows}</span>
              <span style={{fontSize:11,color:C.muted}}>{gridRows}×{gridCols}</span>
              {mistakeCount>0&&<span style={{fontSize:11,color:C.red,cursor:"pointer"}} onClick={()=>setMistakeMarkers({})}>⚠ {mistakeCount} mistake{mistakeCount!==1?"s":""} — <u>clear all</u></span>}
              <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                <button onClick={()=>setCurrentRow(r=>Math.max(0,r-1))} disabled={currentRow===0} style={{...btnSecondary,opacity:currentRow===0?0.4:1}}>↑ Prev</button>
                <button onClick={()=>{toggleRowComplete(currentRow);setCurrentRow(r=>Math.max(0,r-1));}} style={btnPrimary}>✓ Done → Next</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROJECTS VIEW ═══════════════════════════════════════════ */}
        {appMode==="knitting"&&view==="projects"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{fontSize:16,fontWeight:"bold"}}>Projects</div>
              <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <input placeholder="🔍 Search…" value={projectSearch} onChange={e=>setProjectSearch(e.target.value)} style={{...inp,width:160,cursor:"text"}}/>
                <select value={projectFilterStatus} onChange={e=>setProjectFilterStatus(e.target.value)} style={{...inp,width:"auto",cursor:"pointer"}}><option value="All">All statuses</option>{PROJECT_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
                <select value={projectFilterType}   onChange={e=>setProjectFilterType(e.target.value)}   style={{...inp,width:"auto",cursor:"pointer"}}><option value="All">All types</option>{PROJECT_TYPES.map(t=><option key={t}>{t}</option>)}</select>
                {projects.length>0&&<button onClick={()=>openModal("export",{exportContext:"knitting-all"})} style={{...btnSecondary,fontSize:11}}>⬇ Export All</button>}
                <button onClick={()=>{setEditingProject(null);openModal("newProject",{pStatus:"Active",pType:"Accessory"});}} style={btnPrimary}>+ New</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filteredProjects.map(p=>(
                <div key={p.id} style={{background:C.surface,border:`1px solid ${activeProjectId===p.id?C.accent:C.border}`,borderRadius:10,padding:"14px 18px",display:"flex",gap:14,alignItems:"flex-start",boxShadow:activeProjectId===p.id?`0 2px 12px ${C.accent}30`:"none"}}>
                  <span style={{fontSize:26,flexShrink:0}}>🧶</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                      <div style={{fontWeight:"bold",fontSize:14}}>{p.name}</div>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:8,background:p.status==="Complete"?C.green:p.status==="Paused"?"#c09050":C.accent,color:contrastText(p.status==="Complete"?C.green:p.status==="Paused"?"#c09050":C.accent)}}>{p.status}</span>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:8,background:C.surface2,color:C.muted,border:`1px solid ${C.border}`}}>{p.type}</span>
                    </div>
                    <div style={{fontSize:12,color:C.muted}}>{p.yarn}{p.needles?` · ${p.needles}`:""}</div>
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.muted}}>{p.sections?.length||1} section{(p.sections?.length||1)!==1?"s":""}</span>
                      {p.sections?.map(s=><span key={s.id} style={{fontSize:10,padding:"1px 8px",borderRadius:10,background:C.surface2,border:`1px solid ${C.border}`,color:C.muted}}>{s.name}</span>)}
                    </div>
                    {p.yarnPalette?.length>0&&<div style={{display:"flex",gap:3,marginTop:6}}>{p.yarnPalette.map(y=><div key={y.id} title={y.name} style={{width:12,height:12,borderRadius:"50%",background:y.color,border:`1px solid ${C.border}`}}/>)}</div>}
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <button onClick={()=>{setActiveProjectId(p.id);setView("pattern");}} style={{...btnPrimary,fontSize:11}}>Open</button>
                    <button onClick={()=>{setEditingProject(p.id);openModal("newProject",{pName:p.name,pYarn:p.yarn,pNeedles:p.needles,pStatus:p.status,pType:p.type,pNotes:p.notes});}} style={{...btnSecondary,fontSize:11}}>Edit</button>
                    <button onClick={()=>setProjects(prev=>prev.filter(x=>x.id!==p.id))} style={{...btnDanger,fontSize:11}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ WORK LOG ════════════════════════════════════════════════ */}
        {appMode==="knitting"&&view==="log"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:"bold"}}>Work Log — {activeProject.name}</div>
              <button onClick={()=>openModal("log")} style={{...btnPrimary,marginLeft:"auto"}}>+ Log Session</button>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>PHOTOS</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                {(activeProject.photos||[]).map(ph=>(
                  <div key={ph.id} style={{position:"relative"}}>
                    <img src={ph.src} alt="project" style={{width:110,height:80,objectFit:"cover",borderRadius:6,border:`1px solid ${C.border}`}}/>
                    <button onClick={()=>updateProject(activeProjectId,{photos:(activeProject.photos||[]).filter(x=>x.id!==ph.id)})} style={{position:"absolute",top:3,right:3,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                ))}
                <button onClick={()=>photoInputRef.current?.click()} style={{width:110,height:80,border:`2px dashed ${C.border}`,borderRadius:6,background:C.surface,cursor:"pointer",fontSize:12,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4}}>
                  <span style={{fontSize:18}}>📷</span>Add photo
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={addPhoto}/>
              </div>
            </div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>SESSIONS</div>
            {(!activeProject.log||activeProject.log.length===0)&&<div style={{fontSize:13,color:C.muted,padding:"16px 0"}}>No sessions yet.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...(activeProject.log||[])].reverse().map(entry=>(
                <div key={entry.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"11px 15px",display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{minWidth:80,fontWeight:"bold",fontSize:13}}>{entry.date}</div>
                  <div style={{flex:1,display:"flex",gap:14,flexWrap:"wrap"}}>
                    {entry.hours&&<div style={{fontSize:12,color:C.muted}}>⏱ <strong style={{color:C.text}}>{entry.hours}h</strong></div>}
                    {(entry.rowsFrom||entry.rowsTo)&&<div style={{fontSize:12,color:C.muted}}>📍 Rows <strong style={{color:C.text}}>{entry.rowsFrom||"?"}–{entry.rowsTo||"?"}</strong></div>}
                    {entry.note&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>{entry.note}</div>}
                  </div>
                  <button onClick={()=>updateProject(activeProjectId,{log:(activeProject.log||[]).filter(x=>x.id!==entry.id)})} style={{...btnDanger,fontSize:11,flexShrink:0}}>Delete</button>
                </div>
              ))}
            </div>
            {activeProject.log?.length>0&&(
              <div style={{marginTop:14,padding:"11px 15px",background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,display:"flex",gap:20,flexWrap:"wrap"}}>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Sessions: </span><strong>{activeProject.log.length}</strong></div>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Total hours: </span><strong>{activeProject.log.reduce((a,e)=>a+(parseFloat(e.hours)||0),0).toFixed(1)}</strong></div>
                <div style={{fontSize:12}}><span style={{color:C.muted}}>Last worked: </span><strong>{[...activeProject.log].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date}</strong></div>
              </div>
            )}
          </div>
        )}

        {/* ═══ NOTES ═══════════════════════════════════════════════════ */}
        {appMode==="knitting"&&view==="notes"&&(
          <div>
            <div style={{fontSize:16,fontWeight:"bold",marginBottom:16}}>Notes — {activeProject.name}</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:260}}>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>PATTERN NOTES</div>
                <textarea value={activeProject.notes} onChange={e=>updateProject(activeProjectId,{notes:e.target.value})} style={{...inp,minHeight:260,resize:"vertical",lineHeight:1.8}}/>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>PROJECT</div>
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:14,marginBottom:14}}>
                  {[["Project",activeProject.name],["Yarn",activeProject.yarn||"—"],["Needles",activeProject.needles||"—"],["Status",activeProject.status],["Sections",(activeProject.sections||[]).length],["Active section",activeSection?.name||"—"],["Grid",`${gridRows}×${gridCols}`],["Rows done",`${completedCount}/${gridRows}`],["Mistakes",mistakeCount>0?`${mistakeCount} marked`:"None"]].map(([l,v])=>(
                    <div key={l} style={{marginBottom:8}}><div style={{fontSize:9,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:13,marginTop:1}}>{v}</div></div>
                  ))}
                </div>
                <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>ROW NOTES — {activeSection?.name}</div>
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:14,maxHeight:200,overflowY:"auto"}}>
                  {Object.entries(rowNotes).length===0&&<div style={{fontSize:11,color:C.muted}}>No row notes yet.</div>}
                  {Object.entries(rowNotes).sort((a,b)=>+a[0]-+b[0]).map(([ri,note])=>(
                    <div key={ri} style={{marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
                      <div style={{fontSize:9,color:C.accent,letterSpacing:1,marginBottom:2}}>ROW {gridRows-+ri}</div>
                      <div style={{fontSize:12}}>{note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SPINNING ════════════════════════════════════════════════ */}
        {appMode==="spinning"&&(
        <div>

          {/* ── Projects list ───────────────────────────────────────── */}
          {spinView==="projects"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{fontSize:16,fontWeight:"bold"}}>Spinning Projects</div>
              <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <input placeholder="🔍 Search…" value={spinSearch} onChange={e=>setSpinSearch(e.target.value)} style={{...inp,width:160,cursor:"text"}}/>
                <select value={spinFilterStatus} onChange={e=>setSpinFilterStatus(e.target.value)} style={{...inp,width:"auto",cursor:"pointer"}}>
                  <option value="All">All statuses</option>{SPIN_STATUSES.map(s=><option key={s}>{s}</option>)}
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
                      <div style={{fontSize:12,color:C.muted}}>{[sp.fiberType,sp.colorway,sp.fiberWeight?`${sp.fiberWeight}g`:null].filter(Boolean).join(" · ")}</div>
                      <div style={{fontSize:12,color:C.muted}}>{[sp.tool,sp.ratio,sp.plies>1?`${sp.plies}-ply`:null].filter(Boolean).join(" · ")}</div>
                      {sp.fiberWeight>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><div style={{width:120,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:C.accent}}/></div><span style={{fontSize:10,color:C.muted}}>{pct}% spun</span></div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      <button onClick={()=>{setActiveSpinId(sp.id);setSpinView("detail");}} style={{...btnPrimary,fontSize:11}}>Open</button>
                      <button onClick={()=>{setEditingSpinProject(sp.id);openModal("newSpinProject",{spName:sp.name,spFiberType:sp.fiberType,spFiberWeight:sp.fiberWeight||"",spSource:sp.source,spColorway:sp.colorway,spPurchasePlace:sp.purchasePlace,spTool:sp.tool||"Wheel",spToolDetails:sp.toolDetails,spRatio:sp.ratio,spPlies:sp.plies||2,spTargetYardage:sp.targetYardage||"",spStatus:sp.status});}} style={{...btnSecondary,fontSize:11}}>Edit</button>
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
                {[["Type",activeSpinProject.fiberType],["Purchased",activeSpinProject.fiberWeight?`${activeSpinProject.fiberWeight}g`:null],["Source",activeSpinProject.source],["Colorway",activeSpinProject.colorway],["Purchased at",activeSpinProject.purchasePlace]].map(([l,v])=>v?<div key={l} style={{marginBottom:9}}><div style={{fontSize:9,color:C.muted,letterSpacing:1}}>{l.toUpperCase()}</div><div style={{fontSize:13}}>{v}</div></div>:null)}
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
        )}

      </div>
    </div>
  );
}
