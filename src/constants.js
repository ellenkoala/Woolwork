import { makeSection } from "./utils.js";

// ── Theme ──────────────────────────────────────────────────────────────────
export const DEFAULT_THEME = {
  bg:"#f5f0eb", surface:"#ffffff", surface2:"#ede5da", border:"#d4c5b0",
  text:"#3a2a1a", muted:"#9a8a7a", accent:"#b8834a", green:"#6a9a6a", red:"#c0504a",
};
export const THEME_FIELDS = [
  {key:"bg",label:"Page background"},{key:"surface",label:"Card / panel"},
  {key:"surface2",label:"Secondary panel"},{key:"border",label:"Borders"},
  {key:"text",label:"Primary text"},{key:"muted",label:"Muted text"},
  {key:"accent",label:"Accent (buttons, highlights)"},{key:"green",label:"Success / Complete"},
  {key:"red",label:"Error / Mistake"},
];

// ── Stitches ───────────────────────────────────────────────────────────────
export const BUILTIN_STITCHES = [
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
export const GROUPS = ["cast","basic","decrease","increase","cable","brioche","texture","marker","custom"];
export const GROUP_LABELS = {cast:"Cast On/Off",basic:"Basic",decrease:"Decrease",increase:"Increase",cable:"Cable",brioche:"Brioche",texture:"Texture",marker:"Markers",custom:"Custom"};
export const STITCH_SHADES = {co:"#444",bo:"#666",empty:"#f5f0eb",knit:"#e8e0d8",purl:"#d0c4b8",yo:"#f0e8e0",sl:"#dcd4cc",k2tog:"#c8beb4",ssk:"#c8beb4",m1l:"#e4dcd4",m1r:"#dcd4cc",c4f:"#ccc4b8",c4b:"#ccc4b8",brk:"#b8b0a8",brp:"#c8c0b8",mb:"#e8e0d8",mistake:"#fdecea"};
export const STITCH_TEXT  = {co:"#fff",bo:"#fff",empty:"#ccc",knit:"#5a4a3a",purl:"#4a3a2a",yo:"#7a6a5a",sl:"#6a5a4a",k2tog:"#3a2a1a",ssk:"#3a2a1a",m1l:"#5a4a3a",m1r:"#5a4a3a",c4f:"#3a2a1a",c4b:"#3a2a1a",brk:"#fff",brp:"#3a2a1a",mb:"#5a4a3a",mistake:"#c0504a"};

export const PROJECT_STATUSES  = ["Active","Paused","On Hold","Complete"];
export const BUILTIN_PROJECT_TYPES = ["Garment","Accessory","Home","Other"];

// ── Spinning constants ─────────────────────────────────────────────────────
export const SPIN_STATUSES = ["Active","Plying","Finished"];
export const FIBER_TYPES   = ["Merino","BFL","Corriedale","Corriedale Cross","Alpaca","Silk","Cashmere","Mohair","Linen","Cotton","Other"];
export const SPIN_TOOLS    = ["Wheel","Drop Spindle","Supported Spindle"];

// ── Needle constants ────────────────────────────────────────────────────────
export const NEEDLE_TYPES = ["Circular","DPN","Straight","Interchangeable Tips"];
export const NEEDLE_BRANDS = ["Addi","ChiaoGoo","HiyaHiya","KnitPro","Lykke","Clover","Pony","Drops","Signature Needle Arts","Lantern Moon","Brittany","Tulip","Other"];
export const MM_TO_US = {"2.0":"0","2.25":"1","2.75":"2","3.25":"3","3.5":"4","3.75":"5","4.0":"6","4.5":"7","5.0":"8","5.5":"9","6.0":"10","6.5":"10½","7.0":"10¾","8.0":"11","9.0":"13","10.0":"15","12.0":"17","15.0":"19","19.0":"35","25.0":"50"};
export const EQUIP_TYPES   = ["Wheel","Drop Spindle","Supported Spindle","Lazy Kate","Niddy Noddy","Swift","Ball Winder","Other"];
export const YARN_WEIGHTS  = ["Lace","Fingering","Sport","DK","Worsted","Aran","Bulky","Super Bulky"];
export const YARN_BRANDS   = ["Malabrigo","Madelinetosh","Hedgehog Fibres","Quince & Co","Cascade","Drops","Paintbox","West Yorkshire Spinners","Rowan","Lang Yarns","Noro","Schoppel","The Fibre Co","Woolfolk","Brooklyn Tweed","Knit Picks","Other"];
export const FIBRE_PREPS   = ["Raw fleece","Washed fleece","Combed top","Carded batt","Roving","Pencil roving","Other"];
export const REPEAT_COLORS = ["#4a90d9","#6ab04c","#d4a017","#9b59b6","#e74c3c","#1abc9c","#e67e22","#34495e"];

export const INIT_PROJECTS = [
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

export const SYSTEM_PROMPT = `You are a knitting pattern interpreter. Convert the knitting pattern into a stitch grid.
Available stitch IDs: empty, knit, purl, yo, k2tog, ssk, sl, co, bo, c4f, c4b, m1l, m1r, brk, brp, mb
Respond ONLY with valid JSON, no markdown: {"rows":[["knit","purl",...],...],"notes":"Brief summary"}
Rules: Each array = one row left to right. All rows same length. Expand repeats. Max 40 cols, 30 rows. Row 1 = bottom. Only return JSON.`;

// ── Persistence version ─────────────────────────────────────────────────
export const SAVE_VERSION = 1;
