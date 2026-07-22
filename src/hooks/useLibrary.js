import { useState } from "react";
import { newId } from "../utils.js";

export function useLibrary(modalData, closeModal) {
  const [libraryView, setLibraryView] = useState("needles"); // "needles" | "tools" | "yarn" | "fibre"

  const [needleLibrary,  setNeedleLibrary]  = useState(()=>{ try{const s=localStorage.getItem("ww_needles");   return s?JSON.parse(s):[];}catch{return [];} });
  const [equipLibrary,   setEquipLibrary]   = useState(()=>{ try{const s=localStorage.getItem("ww_equip");    return s?JSON.parse(s):[];}catch{return [];} });
  const [yarnLibrary,    setYarnLibrary]    = useState(()=>{ try{const s=localStorage.getItem("ww_yarn_lib"); return s?JSON.parse(s):[];}catch{return [];} });
  const [fibreLibrary,   setFibreLibrary]   = useState(()=>{ try{const s=localStorage.getItem("ww_fibre");    return s?JSON.parse(s):[];}catch{return [];} });

  function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  function importJSON(setter, typeLabel) {
    return () => {
      const f = document.createElement("input");
      f.type = "file";
      f.accept = ".json";
      f.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = ev => {
          try {
            const d = JSON.parse(ev.target.result);
            if (Array.isArray(d)) setter(d);
            else alert(`Import failed — the file doesn't look like a valid ${typeLabel} backup.`);
          } catch {
            alert(`Import failed — the file doesn't look like a valid ${typeLabel} backup.`);
          }
        };
        r.readAsText(file);
      };
      f.click();
    };
  }

  // ── Needles ────────────────────────────────────────────────────────────
  function saveNeedle() {
    if (!modalData.nMm) return;
    const brand = modalData.nBrand === "Other" ? (modalData.nBrandCustom || "Other") : modalData.nBrand || "";
    const pdParts = [modalData.nPdY, modalData.nPdM && modalData.nPdM.padStart(2,"0"), modalData.nPdD && String(parseInt(modalData.nPdD)).padStart(2,"0")].filter(Boolean);
    const purchaseDate = modalData.nPdY ? pdParts.join("-") : "";
    const n = { id: modalData.editing||newId(), type: modalData.nType||"Circular", sizeMm: modalData.nMm, sizeUS: modalData.nUS||"", length: modalData.nLength||"", material: modalData.nMaterial||"", brand, series: modalData.nSeries||"", purchaseDate, notes: modalData.nNotes||"", cords: (modalData.nType||"Circular")==="Interchangeable Tips"?(modalData.nCords||[]).filter(c=>c.length):[] };
    if (modalData.editing) setNeedleLibrary(prev => prev.map(x => x.id===modalData.editing ? n : x));
    else setNeedleLibrary(prev => [...prev, n]);
    closeModal();
  }
  function deleteNeedle(id) { setNeedleLibrary(prev => prev.filter(x => x.id !== id)); }
  function exportNeedles() { exportJSON(needleLibrary, "needle-library.json"); }
  const importNeedles = importJSON(setNeedleLibrary, "needle library");

  // ── Tools ──────────────────────────────────────────────────────────────
  function saveTool() {
    if (!modalData.eBrand?.trim() && !modalData.eModel?.trim()) return;
    const pdParts = [modalData.ePdY, modalData.ePdM && modalData.ePdM.padStart(2,"0"), modalData.ePdD && String(parseInt(modalData.ePdD)).padStart(2,"0")].filter(Boolean);
    const purchaseDate = modalData.ePdY ? pdParts.join("-") : "";
    const item = { id: modalData.editing||newId(), type: modalData.eType||"Wheel", brand: modalData.eBrand||"", model: modalData.eModel||"", ratios: modalData.eRatios||"", hookSizes: modalData.eHookSizes||"", weightG: modalData.eWeightG||"", purchaseDate, notes: modalData.eNotes||"" };
    if (modalData.editing) setEquipLibrary(prev => prev.map(x => x.id===modalData.editing ? item : x));
    else setEquipLibrary(prev => [...prev, item]);
    closeModal();
  }
  function deleteTool(id) { setEquipLibrary(prev => prev.filter(x => x.id !== id)); }
  function exportTools() { exportJSON(equipLibrary, "tools-library.json"); }
  const importTools = importJSON(setEquipLibrary, "tool library");

  // ── Yarn ───────────────────────────────────────────────────────────────
  function saveYarn() {
    if (!modalData.yBrand && !modalData.yColourway) return;
    const brand = modalData.yBrand === "Other" ? (modalData.yBrandCustom || "Other") : modalData.yBrand || "";
    const pdParts = [modalData.yPdY, modalData.yPdM && modalData.yPdM.padStart(2,"0"), modalData.yPdD && String(parseInt(modalData.yPdD)).padStart(2,"0")].filter(Boolean);
    const purchaseDate = modalData.yPdY ? pdParts.join("-") : "";
    const item = { id: modalData.editing||newId(), brand, colourway: modalData.yColourway||"", weight: modalData.yWeight||"", fibre: modalData.yFibre||"", yardage: modalData.yYardage||"", skeinWeight: modalData.ySkeinWeight||"", skeins: modalData.ySkeins||"", color: modalData.yColor||"#d4c5b0", purchaseDate, shop: modalData.yShop||"", price: modalData.yPrice||"", notes: modalData.yNotes||"" };
    if (modalData.editing) setYarnLibrary(prev => prev.map(x => x.id===modalData.editing ? item : x));
    else setYarnLibrary(prev => [...prev, item]);
    closeModal();
  }
  function deleteYarn(id) { setYarnLibrary(prev => prev.filter(x => x.id !== id)); }
  function exportYarn() { exportJSON(yarnLibrary, "yarn-stash.json"); }
  const importYarn = importJSON(setYarnLibrary, "yarn stash");

  // ── Fibre ──────────────────────────────────────────────────────────────
  function saveFibre() {
    if (!modalData.fName && !modalData.fType && !modalData.fColourway) return;
    const pdParts = [modalData.fPdY, modalData.fPdM && modalData.fPdM.padStart(2,"0"), modalData.fPdD && String(parseInt(modalData.fPdD)).padStart(2,"0")].filter(Boolean);
    const purchaseDate = modalData.fPdY ? pdParts.join("-") : "";
    const item = { id: modalData.editing||newId(), name: modalData.fName||"", type: modalData.fType||"", breed: modalData.fBreed||"", dyer: modalData.fDyer||"", colourway: modalData.fColourway||"", weightG: modalData.fWeightG||"", prep: modalData.fPrep||"", color: modalData.fColor||"#d4c5b0", purchaseDate, shop: modalData.fShop||"", notes: modalData.fNotes||"" };
    if (modalData.editing) setFibreLibrary(prev => prev.map(x => x.id===modalData.editing ? item : x));
    else setFibreLibrary(prev => [...prev, item]);
    closeModal();
  }
  function deleteFibre(id) { setFibreLibrary(prev => prev.filter(x => x.id !== id)); }
  function exportFibre() { exportJSON(fibreLibrary, "fibre-stash.json"); }
  const importFibre = importJSON(setFibreLibrary, "fibre stash");

  return {
    libraryView, setLibraryView,
    needleLibrary, setNeedleLibrary, saveNeedle, deleteNeedle, exportNeedles, importNeedles,
    equipLibrary,  setEquipLibrary,  saveTool,   deleteTool,   exportTools,  importTools,
    yarnLibrary,   setYarnLibrary,   saveYarn,   deleteYarn,   exportYarn,   importYarn,
    fibreLibrary,  setFibreLibrary,  saveFibre,  deleteFibre,  exportFibre,  importFibre,
  };
}
