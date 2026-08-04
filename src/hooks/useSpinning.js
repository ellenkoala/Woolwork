import { useState, useRef } from "react";
import { newId, today, fiberDisplay, compressImage } from "../utils.js";

export function useSpinning(modalData, closeModal) {
  const [spinProjects,      setSpinProjects]      = useState(()=>{
    try{const s=localStorage.getItem("ww_spin_projects");return s?JSON.parse(s).map(sp=>({photos:[],log:[],...sp})):[];}catch{return [];}
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
  const spinPhotoInputRef = useRef();

  // ── Derived ───────────────────────────────────────────────────────────
  const activeSpinProject = spinProjects.find(p=>p.id===activeSpinId)||null;

  const filteredSpinProjects = spinProjects.filter(p=>{
    const fd=fiberDisplay(p).toLowerCase();
    const ms=p.name.toLowerCase().includes(spinSearch.toLowerCase())||fd.includes(spinSearch.toLowerCase())||(p.colorway||"").toLowerCase().includes(spinSearch.toLowerCase());
    return ms&&(spinFilterStatus==="All"||p.status===spinFilterStatus);
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const updateSpinProject=(id,changes)=>setSpinProjects(prev=>prev.map(p=>p.id===id?{...p,...changes}:p));

  const saveSpinProject=()=>{
    const{spName,spDesc,spFibers,spFiberWeight,spSource,spColorway,spPurchasePlace,spTool,spToolDetails,spRatio,spPlies,spTargetYardage,spStatus}=modalData;
    if(!spName?.trim())return;
    const fibers=(spFibers||[{type:"",pct:100}]).filter(f=>f.type.trim());
    if(editingSpinProject){
      updateSpinProject(editingSpinProject,{name:spName,description:spDesc||"",fibers,fiberWeight:+spFiberWeight||0,source:spSource||"",colorway:spColorway||"",purchasePlace:spPurchasePlace||"",tool:spTool||"Wheel",toolDetails:spToolDetails||"",ratio:spRatio||"",plies:+spPlies||2,targetYardage:+spTargetYardage||0,status:spStatus||"Active"});
    }else{
      const np={id:newId(),name:spName,description:spDesc||"",fibers,fiberWeight:+spFiberWeight||0,source:spSource||"",colorway:spColorway||"",purchasePlace:spPurchasePlace||"",tool:spTool||"Wheel",toolDetails:spToolDetails||"",ratio:spRatio||"",plies:+spPlies||2,targetYardage:+spTargetYardage||0,status:spStatus||"Active",notes:"",log:[],photos:[],created:today(),gSpun:0,gPlied:0,finishedYardage:0,wpi:0,washedWeight:0,preparedWeight:0};
      setSpinProjects(prev=>[np,...prev]);
      setActiveSpinId(np.id);
    }
    closeModal();setEditingSpinProject(null);
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
    compressImage(file)
      .then(src=>updateSpinProject(activeSpinId,{photos:[...(activeSpinProject.photos||[]),{id:newId(),src,date:today()}]}))
      .catch(err=>alert(`Photo error: ${err.message}`));
  };

  return {
    spinProjects, setSpinProjects,
    activeSpinId, setActiveSpinId,
    spinView, setSpinView,
    editingSpinProject, setEditingSpinProject,
    spinSearch, setSpinSearch,
    spinFilterStatus, setSpinFilterStatus,
    spinLogDate, setSpinLogDate,
    spinLogHours, setSpinLogHours,
    spinLogGSpun, setSpinLogGSpun,
    spinLogNote, setSpinLogNote,
    spinPhotoInputRef,
    activeSpinProject, filteredSpinProjects,
    updateSpinProject, saveSpinProject, addSpinLogEntry, addSpinPhoto,
  };
}
