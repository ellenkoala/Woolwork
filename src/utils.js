// ── Pure helper functions, shared across the app ────────────────────────────
// No React state or hooks here — safe to import from anywhere, and easy to test.

export function createGrid(rows,cols){return Array.from({length:rows},()=>Array.from({length:cols},()=>({stitch:"empty",yarn:null})));}
export function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
export function today(){return new Date().toISOString().slice(0,10);}
export function contrastText(hex){if(!hex)return"#000";const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(r*299+g*587+b*114)/1000>128?"#222":"#fff";}
export function hexToRgba(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}

export const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
export function formatFlexDate(d){if(!d)return"";const[y,m,day]=d.split("-");if(!m)return y;if(!day)return`${MONTH_NAMES[parseInt(m)-1]} ${y}`;return`${parseInt(day)} ${MONTH_NAMES[parseInt(m)-1]} ${y}`;}
export function parsePurchaseDate(d){if(!d)return{y:"",m:"",day:""};const[y="",m="",day=""]= d.split("-");return{y,m,day};};

export function makeSection(name="Section 1",rows=20,cols=30){
  return {id:newId(),name,rows,cols,grid:createGrid(rows,cols),completedRows:[],currentRow:rows-1,currentCol:null,rowNotes:{},rowWidths:{},rowRepeats:{},mistakeMarkers:{},stitchMarkers:[],repeatMarkers:[],patternRepeats:[],rowRangeTrackers:[]};
}

// ── Selection helpers ────────────────────────────────────────────────────
export function extractSelection(grid,sel){
  const r1=Math.min(sel.r1,sel.r2),r2=Math.max(sel.r1,sel.r2);
  const c1=Math.min(sel.c1,sel.c2),c2=Math.max(sel.c1,sel.c2);
  return {r1,r2,c1,c2,cells:grid.slice(r1,r2+1).map(row=>row.slice(c1,c2+1).map(c=>({...c})))};
}
export function rotateCW(cells){
  const rows=cells.length,cols=cells[0].length;
  return Array.from({length:cols},(_,ci)=>Array.from({length:rows},(_,ri)=>({...cells[rows-1-ri][ci]})));
}
export function flipH(cells){return cells.map(row=>[...row].reverse().map(c=>({...c})));}
export function flipV(cells){return [...cells].reverse().map(row=>row.map(c=>({...c})));}

// ── Persistence version & migration ───────────────────────────────────────
export function migrateSection(s) {
  return {
    rowRangeTrackers:[],patternRepeats:[],repeatMarkers:[],
    stitchMarkers:[],mistakeMarkers:{},rowRepeats:{},
    rowWidths:{},rowNotes:{},completedRows:[],currentCol:null,
    ...s,
  };
}
export function migrateProject(p) {
  return {yarnPalette:[],photos:[],log:[],notes:"",...p,sections:(p.sections||[]).map(migrateSection)};
}
