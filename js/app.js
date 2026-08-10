/* =========================================================
   RMT Attendance — app.js (berbilang sekolah)
   Mod Firebase (bila config diisi) ATAU Mod Demo (localStorage)
   ========================================================= */
'use strict';

/* MULTI-SEKOLAH: ID sekolah ditetapkan oleh loader dalam index.html (?s=namasekolah).
   Setiap sekolah -> projek Firebase BERASINGAN (data terasing sepenuhnya).
   Kunci storan tempatan dinamakan ikut sekolah supaya sesi/tema tidak bercampur
   jika satu peranti digunakan untuk lebih dari satu sekolah. */
const TENANT = window.__SCHOOL_ID__ || 'default';
const SESS_KEY = 'rmt_current_' + TENANT;
const THEME_KEY = 'rmt_themecolor_' + TENANT;
const NAME_KEY  = 'rmt_schoolname_' + TENANT;

/* Nama sekolah untuk skrin login, topbar, tajuk & nama app PWA.
   Keutamaan: (1) fail config sekolah  (2) nama yang di-cache selepas log masuk
   sebelum ini  (3) lalai generik. Skrin login belum boleh baca Firestore
   (pengguna belum sah), sebab itu nama diambil dari config/cache. */
function schoolNames(){
  let cached={};
  try{ cached=JSON.parse(localStorage.getItem(NAME_KEY)||'{}'); }catch(e){}
  const penuh = window.__SCHOOL_NAME__  || cached.penuh || '';
  const pendek= window.__SCHOOL_SHORT__ || cached.pendek || '';
  return {penuh, pendek: pendek || penuh || 'e-RMT'};
}
function simpanNamaSekolah(nama){
  if(!nama)return;
  const pendek=nama.replace(/^SEKOLAH KEBANGSAAN\s+/i,'SK ').trim();
  try{ localStorage.setItem(NAME_KEY,JSON.stringify({penuh:nama,pendek})); }catch(e){}
}
// Tajuk tab + nama app semasa install PWA mengikut sekolah
function terapkanIdentiti(){
  const n=schoolNames();
  const tajuk = n.penuh ? ('e-RMT · '+n.pendek) : 'e-RMT';
  document.title = tajuk;
  const am=document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if(am) am.setAttribute('content', n.pendek);
  try{
    const link=document.querySelector('link[rel="manifest"]');
    if(!link)return;
    fetch(link.getAttribute('href')).then(r=>r.json()).then(m=>{
      m.name = n.penuh ? ('e-RMT · '+n.penuh) : m.name;
      m.short_name = n.pendek.slice(0,12);
      const url=URL.createObjectURL(new Blob([JSON.stringify(m)],{type:'application/manifest+json'}));
      link.setAttribute('href',url);
    }).catch(()=>{});
  }catch(e){}
}

/* ---------------------------------------------------------
   0. Ikon (SVG inline, Material-style)
--------------------------------------------------------- */
const IC = {
  dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/><path d="M8 2v4M16 2v4"/></svg>',
  student:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>',
  teacher:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
  cls:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v12H3z"/><path d="M3 21h18"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L3.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2h5l.3-2a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  qr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1M17 17h4v4h-4z"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
  empty:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/></svg>'
};

/* Data takwim dimuat dari js/takwim.js (fail berasingan supaya
   kemas kini tahunan tidak menyentuh app.js). */
const KPM_KALENDAR = window.KPM_KALENDAR || {};

function julatTarikh(mula,akhir,nama){
  const out=[]; const d=new Date(mula+'T00:00:00'), hujung=new Date(akhir+'T00:00:00');
  while(d<=hujung){
    out.push({date:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,nama});
    d.setDate(d.getDate()+1);
  }
  return out;
}
function binaCutiKPM(tahun,kump,termasukUmum){
  const k=KPM_KALENDAR[tahun]; if(!k)return [];
  let out=[];
  (k[kump]||[]).forEach(([a,b,n])=>{out=out.concat(julatTarikh(a,b,n));});
  if(termasukUmum) (k.umum||[]).forEach(([t,n])=>out.push({date:t,nama:n}));
  return out;
}

const MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const DAYNAMES = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const ROLES = ['Administrator','Guru Besar','PK HEM','Guru RMT','Guru Kelas','Pembantu Tadbir'];

/* ---------------------------------------------------------
   1. Utiliti UI
--------------------------------------------------------- */
// Senarai tahun sesi: dari 2025 (mula guna sistem) hingga tahun hadapan.
// Bertambah automatik setiap tahun; rekod lama sentiasa boleh dibuka semula.
// ---- Tema warna dinamik (warna sekolah) ----
function shadeHex(hex,p){ // p: -1..1 (negatif = gelap)
  try{
    const n=parseInt(hex.slice(1),16);
    let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    const f=v=>Math.max(0,Math.min(255,Math.round(p<0?v*(1+p):v+(255-v)*p)));
    return '#'+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }catch(e){return hex;}
}
function applyTheme(hex){
  if(!hex||!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  const r=document.documentElement.style;
  r.setProperty('--green',hex);
  r.setProperty('--green-dark',shadeHex(hex,-0.28));
  const dark=document.documentElement.getAttribute('data-theme')==='dark';
  r.setProperty('--green-soft',dark?shadeHex(hex,-0.72):shadeHex(hex,0.88));
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',hex);
  try{localStorage.setItem(THEME_KEY,hex);}catch(e){}
}
// terap serta-merta dari cache (elak kelipan warna lama)
(function(){try{const t=localStorage.getItem(THEME_KEY);applyTheme(t||'#7FB89A');}catch(e){}})();

function yearRange(){ const y=new Date().getFullYear(); const out=[];
  for(let i=2025;i<=y+1;i++) out.push(i); return out; }
const clsLabel=c=>c?((c.tahun?`Tahun ${c.tahun} `:'')+c.nama):'—';
const sortCls=arr=>[...arr].sort((a,b)=>((a.tahun||99)-(b.tahun||99))||a.nama.localeCompare(b.nama));
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---- Utiliti gerakan ----
// Riak bermula dari titik sentuhan sebenar, bukan dari tengah
function rippleAt(el,ev){
  if(kurangGerak())return;
  try{
    const r=el.getBoundingClientRect();
    const x=(ev&&ev.clientX)?ev.clientX-r.left:r.width/2;
    const y=(ev&&ev.clientY)?ev.clientY-r.top:r.height/2;
    const size=Math.max(r.width,r.height)*2.2;
    const s2=document.createElement('span');
    s2.className='ripple';
    s2.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
    el.appendChild(s2);
    setTimeout(()=>s2.remove(),600);
  }catch(e){}
}
// Getaran sangat halus — pengesahan sentuhan, bukan gangguan
function tapHaptic(){ try{ if(!kurangGerak()&&navigator.vibrate)navigator.vibrate(8); }catch(e){} }

const kurangGerak=()=>{ try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;} };

// Nombor "berlari" ke nilai akhir — momen tanda tangan Dashboard.
function countUp(el,to,dur=900,suffix=''){
  if(!el)return;
  if(kurangGerak()||typeof requestAnimationFrame!=='function'){el.textContent=to+suffix;return;}
  const t0=performance.now();
  const step=now=>{
    const p=Math.min(1,(now-t0)/dur);
    const eased=1-Math.pow(1-p,3);              // nyahpecut kubik
    el.textContent=Math.round(to*eased)+suffix;
    if(p<1)requestAnimationFrame(step); else el.textContent=to+suffix;
  };
  requestAnimationFrame(step);
}

// Rangka pemuatan — memberi bentuk kandungan yang akan tiba
const skeleton=(n=5)=>'<div class="skel">'+'<i></i>'.repeat(n)+'</div>';

function toast(msg,type='info'){
  const w=$('#toasts'); const t=document.createElement('div');
  t.className='toast '+type; t.textContent=msg; w.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),250);},2600);
}

// Pengawal ralat global: mana-mana operasi simpan/padam yang gagal (cth ditolak
// oleh Firestore Rules) akan papar sebab sebenar — tiada lagi kegagalan senyap.
window.addEventListener('unhandledrejection',e=>{
  const r=e.reason||{};
  console.error('Operasi gagal:',r);
  toast(typeof authErr==='function'?authErr(r):(r.message||'Operasi gagal.'),'err');
  e.preventDefault();
});
function confirmDialog(msg){
  return new Promise(res=>{
    openModal(`
      <div class="modal-head"><h3>Sahkan</h3></div>
      <div class="modal-body"><p style="margin:0">${esc(msg)}</p></div>
      <div class="modal-foot">
        <button class="btn btn-ghost" id="cf-no">Batal</button>
        <button class="btn btn-danger" id="cf-yes">Ya, teruskan</button>
      </div>`);
    $('#cf-no').onclick=()=>{closeModal();res(false);};
    $('#cf-yes').onclick=()=>{closeModal();res(true);};
  });
}
function openModal(html){const b=$('#modal-back');b.querySelector('.modal').innerHTML=html;b.classList.add('show');}
function closeModal(){$('#modal-back').classList.remove('show');}

/* ---------------------------------------------------------
   2. Lapisan data (DB) — abstraksi Firebase / Demo
--------------------------------------------------------- */
const USE_FIREBASE = !!window.__FIREBASE_READY__ && typeof firebase !== 'undefined';
let fbAuth=null, fbDB=null;

if (USE_FIREBASE){
  firebase.initializeApp(window.__FIREBASE_CONFIG__);
  fbAuth = firebase.auth();
  fbDB   = firebase.firestore();
}

/* --- Seed data untuk Mod Demo --- */
const SEED = {
  school:{ nama:'SEKOLAH KEBANGSAAN BELUKAR', kod:'TBA1234', daerah:'Kemaman',
           negeri:'Terengganu', alamat:'24000 Kemaman, Terengganu', gb:'—', pkhem:'—',
           penyelaras:'—', tel:'09-000 0000', email:'skbelukar@moe.edu.my', restDays:[5,6] },
  users:[
    {id:'u1',nama:'Administrator',jawatan:'Administrator',username:'admin',password:'admin123',
     email:'admin@skb.my',tel:'0100000000',role:'Administrator',aktif:true,kelasId:null},
    {id:'u2',nama:'Cikgu Aiman',jawatan:'Guru Kelas',username:'cikgu',password:'cikgu123',
     email:'aiman@skb.my',tel:'0111111111',role:'Guru Kelas',aktif:true,kelasId:'k1'}
  ],
  classes:[
    {id:'k1',tahun:1,nama:'Amanah',guruId:'u2'},
    {id:'k2',tahun:1,nama:'Bestari',guruId:null},
    {id:'k3',tahun:2,nama:'Amanah',guruId:null}
  ],
  students:[
    {id:'s1',nama:'Ahmad Danish Bin Roslan',mykid:'180101015511',jantina:'L',tahun:1,kelasId:'k1',statusRMT:'Aktif'},
    {id:'s2',nama:'Nur Aisyah Binti Kamal',mykid:'180203105522',jantina:'P',tahun:1,kelasId:'k1',statusRMT:'Aktif'},
    {id:'s3',nama:'Muhammad Haikal Bin Azman',mykid:'180305045533',jantina:'L',tahun:1,kelasId:'k1',statusRMT:'Aktif'},
    {id:'s4',nama:'Siti Khadijah Binti Nazri',mykid:'180412065544',jantina:'P',tahun:1,kelasId:'k1',statusRMT:'Aktif'},
    {id:'s5',nama:'Iman Hakimi Bin Faizal',mykid:'180520115555',jantina:'L',tahun:1,kelasId:'k2',statusRMT:'Aktif'},
    {id:'s6',nama:'Aliya Sofea Binti Rahim',mykid:'170601035566',jantina:'P',tahun:2,kelasId:'k3',statusRMT:'Aktif'}
  ],
  attendance:{}, // key: kelasId_year_month -> { records:{ studentId:{day:'H'|'X'} } }
  holidays:[]
};

const LS_KEY='rmt_demo_'+TENANT;
function loadDemo(){
  try{const raw=localStorage.getItem(LS_KEY);if(raw)return JSON.parse(raw);}catch(e){}
  const copy=JSON.parse(JSON.stringify(SEED)); saveDemo(copy); return copy;
}
function saveDemo(d){try{localStorage.setItem(LS_KEY,JSON.stringify(d));}catch(e){}}
let DEMO = USE_FIREBASE ? null : loadDemo();
const uid=()=> 'id'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* --- API bersatu --- */
const DB = {
  /* SEKOLAH */
  async getSchool(){
    if(USE_FIREBASE){const d=await fbDB.collection('settings').doc('school').get();return d.exists?d.data():SEED.school;}
    return DEMO.school;
  },
  async saveSchool(o){
    if(USE_FIREBASE){await fbDB.collection('settings').doc('school').set(o,{merge:true});return;}
    DEMO.school={...DEMO.school,...o}; saveDemo(DEMO);
  },
  /* KELAS */
  async getClasses(){
    if(USE_FIREBASE){const q=await fbDB.collection('classes').get();return q.docs.map(d=>({id:d.id,...d.data()}));}
    return [...DEMO.classes];
  },
  async saveClass(o){
    if(USE_FIREBASE){ if(o.id){const {id,...r}=o;await fbDB.collection('classes').doc(id).set(r,{merge:true});}
      else await fbDB.collection('classes').add(o); return; }
    if(o.id){const i=DEMO.classes.findIndex(c=>c.id===o.id);DEMO.classes[i]=o;}
    else DEMO.classes.push({...o,id:uid()}); saveDemo(DEMO);
  },
  async delClass(id){
    if(USE_FIREBASE){await fbDB.collection('classes').doc(id).delete();return;}
    DEMO.classes=DEMO.classes.filter(c=>c.id!==id); saveDemo(DEMO);
  },
  /* GURU / PENGGUNA */
  async getUsers(){
    if(USE_FIREBASE){const q=await fbDB.collection('users').get();return q.docs.map(d=>({id:d.id,...d.data()}));}
    return [...DEMO.users];
  },
  async saveUser(o){
    if(USE_FIREBASE){
      // emel = ID dokumen (padanan log masuk Google/emel + serasi Security Rules)
      const {id,...r}=o;
      await fbDB.collection('users').doc(o.email).set(r,{merge:true});
      // rekod lama berkunci ID lain (UID/auto-ID) → padam supaya tiada duplikat
      if(id && id!==o.email){ try{ await fbDB.collection('users').doc(id).delete(); }catch(e){} }
      return;
    }
    if(o.id){const i=DEMO.users.findIndex(u=>u.id===o.id);DEMO.users[i]=o;}
    else DEMO.users.push({...o,id:uid()}); saveDemo(DEMO);
  },
  async delUser(id){
    if(USE_FIREBASE){await fbDB.collection('users').doc(id).delete();return;}
    DEMO.users=DEMO.users.filter(u=>u.id!==id); saveDemo(DEMO);
  },
  /* MURID */
  async getStudents(){
    if(USE_FIREBASE){const q=await fbDB.collection('students').get();return q.docs.map(d=>({id:d.id,...d.data()}));}
    return [...DEMO.students];
  },
  async saveStudent(o){
    if(USE_FIREBASE){ if(o.id){const {id,...r}=o;await fbDB.collection('students').doc(id).set(r,{merge:true});}
      else await fbDB.collection('students').add(o); return; }
    if(o.id){const i=DEMO.students.findIndex(s=>s.id===o.id);DEMO.students[i]=o;}
    else DEMO.students.push({...o,id:uid()}); saveDemo(DEMO);
  },
  async delStudent(id){
    if(USE_FIREBASE){await fbDB.collection('students').doc(id).delete();return;}
    DEMO.students=DEMO.students.filter(s=>s.id!==id); saveDemo(DEMO);
  },
  async getAttDoc(kelasId,year,month){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){const d=await fbDB.collection('attendance').doc(key).get();
      return d.exists?{records:d.data().records||{},sah:d.data().sah||null}:{records:{},sah:null};}
    const dd=DEMO.attendance[key]; return dd?{records:dd.records||{},sah:dd.sah||null}:{records:{},sah:null};
  },
  /* LOG AKTIVITI */
  async addLog(aksi,detail){
    try{
      const rec={t:new Date().toISOString(),oleh:CURRENT?CURRENT.nama:'?',aksi,detail:detail||''};
      if(USE_FIREBASE){await fbDB.collection('activity_logs').add(rec);return;}
      DEMO.logs=DEMO.logs||[]; DEMO.logs.unshift(rec);
      if(DEMO.logs.length>500)DEMO.logs.length=500; saveDemo(DEMO);
    }catch(e){/* log tidak menghalang operasi */}
  },
  async listLogs(n=100){
    if(USE_FIREBASE){
      const q=await fbDB.collection('activity_logs').orderBy('t','desc').limit(n).get();
      return q.docs.map(d=>d.data());
    }
    return (DEMO.logs||[]).slice(0,n);
  },
  /* Tulis banyak sel sekali gus — SATU penulisan, bukan satu per sel */
  async saveAttendanceMany(kelasId,year,month,patch){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){
      await fbDB.collection('attendance').doc(key).set({records:patch},{merge:true});
      return;
    }
    DEMO.attendance[key]=DEMO.attendance[key]||{records:{}};
    const r=DEMO.attendance[key].records;
    Object.entries(patch).forEach(([sid,hari])=>{
      r[sid]=r[sid]||{}; Object.assign(r[sid],hari);
    });
    saveDemo(DEMO);
  },
  /* Kosongkan semua tanda bulan tersebut (pengesahan dikekalkan) */
  async clearAttendance(kelasId,year,month){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){
      const ref=fbDB.collection('attendance').doc(key);
      try{ await ref.update({records:{}}); }catch(e){ await ref.set({records:{}},{merge:true}); }
      return;
    }
    if(DEMO.attendance[key]) DEMO.attendance[key].records={};
    saveDemo(DEMO);
  },
  async getSah(kelasId,year,month){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){const d=await fbDB.collection('attendance').doc(key).get();
      return d.exists?(d.data().sah||null):null;}
    return (DEMO.attendance[key]&&DEMO.attendance[key].sah)||null;
  },
  async setSah(kelasId,year,month,obj){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){await fbDB.collection('attendance').doc(key).set({sah:obj},{merge:true});return;}
    DEMO.attendance[key]=DEMO.attendance[key]||{records:{}};
    DEMO.attendance[key].sah=obj; saveDemo(DEMO);
  },
  /* ROSTER SNAPSHOT — senarai murid dibekukan per sesi (untuk rujukan sejarah) */
  async getRoster(year){
    if(USE_FIREBASE){const d=await fbDB.collection('rosters').doc(String(year)).get();return d.exists?d.data():null;}
    return (DEMO.rosters&&DEMO.rosters[year])||null;
  },
  async saveRoster(year,data){
    if(USE_FIREBASE){await fbDB.collection('rosters').doc(String(year)).set(data);return;}
    DEMO.rosters=DEMO.rosters||{}; DEMO.rosters[year]=data; saveDemo(DEMO);
  },
  /* BACKUP penuh & pulihkan */
  async dumpAll(){
    if(USE_FIREBASE){
      const colls=['settings','users','classes','students','attendance','fizikal','akademik','holidays','rosters'];
      const out={__format:'rmt-skb-backup',__version:2,__tarikh:new Date().toISOString(),data:{}};
      for(const c of colls){
        const q=await fbDB.collection(c).get();
        out.data[c]={}; q.docs.forEach(d=>{out.data[c][d.id]=d.data();});
      }
      return out;
    }
    return {__format:'rmt-skb-backup',__version:2,__tarikh:new Date().toISOString(),demo:DEMO};
  },
  async restoreAll(bk){
    if(bk.__format!=='rmt-skb-backup') throw new Error('Fail bukan backup RMT yang sah.');
    if(USE_FIREBASE){
      if(!bk.data) throw new Error('Backup ini daripada Mod Demo — tidak sepadan dengan Mod Firebase.');
      for(const [coll,docs] of Object.entries(bk.data)){
        const ids=Object.keys(docs);
        for(let i=0;i<ids.length;i+=400){
          const batch=fbDB.batch();
          ids.slice(i,i+400).forEach(id=>batch.set(fbDB.collection(coll).doc(id),docs[id]));
          await batch.commit();
        }
      }
      return;
    }
    if(!bk.demo) throw new Error('Backup ini daripada Mod Firebase — tidak sepadan dengan Mod Demo.');
    DEMO=bk.demo; saveDemo(DEMO);
  },
  /* BORANG C1/C2 — satu dokumen per (jenis,kelas,tahun) */
  async getForm(coll,kelasId,year){
    const key=`${kelasId}_${year}`;
    if(USE_FIREBASE){const d=await fbDB.collection(coll).doc(key).get();return d.exists?(d.data().records||{}):{};}
    DEMO.forms=DEMO.forms||{};
    return (DEMO.forms[coll+'_'+key]?.records)||{};
  },
  async saveFormCell(coll,kelasId,year,sid,field,val){
    const key=`${kelasId}_${year}`;
    if(USE_FIREBASE){
      await fbDB.collection(coll).doc(key).set({records:{[sid]:{[field]:val}}},{merge:true});
      return;
    }
    DEMO.forms=DEMO.forms||{};
    const k=coll+'_'+key;
    DEMO.forms[k]=DEMO.forms[k]||{records:{}};
    const r=DEMO.forms[k].records; r[sid]=r[sid]||{}; r[sid][field]=val;
    saveDemo(DEMO);
  },
  /* KEHADIRAN — satu dokumen per (kelas,tahun,bulan) */
  async getAttendance(kelasId,year,month){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){const d=await fbDB.collection('attendance').doc(key).get();return d.exists?d.data().records:{};}
    return (DEMO.attendance[key]?.records)||{};
  },
  async saveAttendanceCell(kelasId,year,month,studentId,day,val){
    const key=`${kelasId}_${year}_${month}`;
    if(USE_FIREBASE){
      const ref=fbDB.collection('attendance').doc(key);
      const path=`records.${studentId}.${day}`;
      if(val===null) await ref.set({records:{[studentId]:{[day]:firebase.firestore.FieldValue.delete()}}},{merge:true});
      else await ref.set({records:{[studentId]:{[day]:val}}},{merge:true});
      return;
    }
    DEMO.attendance[key]=DEMO.attendance[key]||{records:{}};
    const r=DEMO.attendance[key].records;
    r[studentId]=r[studentId]||{};
    if(val===null) delete r[studentId][day]; else r[studentId][day]=val;
    saveDemo(DEMO);
  },
  /* CUTI / KELEPASAN AM */
  async listHolidays(){
    if(USE_FIREBASE){const q=await fbDB.collection('holidays').get();return q.docs.map(d=>({id:d.id,...d.data()}));}
    return [...(DEMO.holidays||[])];
  },
  async addHolidaysBulk(list){
    if(!list.length)return 0;
    if(USE_FIREBASE){
      for(let i=0;i<list.length;i+=400){
        const batch=fbDB.batch();
        list.slice(i,i+400).forEach(o=>batch.set(fbDB.collection('holidays').doc(),o));
        await batch.commit();
      }
      return list.length;
    }
    DEMO.holidays=DEMO.holidays||[];
    list.forEach(o=>DEMO.holidays.push({...o,id:uid()}));
    saveDemo(DEMO); return list.length;
  },
  async addHoliday(o){
    if(USE_FIREBASE){await fbDB.collection('holidays').add(o);return;}
    DEMO.holidays=DEMO.holidays||[]; DEMO.holidays.push({...o,id:uid()}); saveDemo(DEMO);
  },
  async delHoliday(id){
    if(USE_FIREBASE){await fbDB.collection('holidays').doc(id).delete();return;}
    DEMO.holidays=(DEMO.holidays||[]).filter(h=>h.id!==id); saveDemo(DEMO);
  }
};

/* ---------------------------------------------------------
   3. Sesi pengguna
--------------------------------------------------------- */
let CURRENT=null; // {id,nama,role,kelasId,...}
const isAdmin = ()=> CURRENT && ['Administrator','Guru Besar','PK HEM'].includes(CURRENT.role);
// Guru RMT menguruskan program RMT seluruh sekolah — akses semua kelas utk kehadiran/borang
const seesAllClasses = ()=> isAdmin() || (CURRENT && CURRENT.role==='Guru RMT');
// Guru kelas boleh urus murid KELAS SENDIRI; admin & Guru RMT boleh urus semua.
const bolehTambahMurid = ()=> !!(seesAllClasses() || (CURRENT && CURRENT.kelasId));
const bolehUrusMurid = st => !!(seesAllClasses() || (CURRENT && st && st.kelasId===CURRENT.kelasId));

// Konfigurasi kalendar global (hari cuti mingguan + cuti/kelepasan am)
// restDays: nombor hari (0=Ahad,1=Isnin,...,6=Sabtu) yang BUKAN hari persekolahan.
// Lalai [0,6] = Sabtu & Ahad (Kumpulan B). Kumpulan A = [5,6] (Jumaat & Sabtu).
let APP_CFG={restDays:[0,6],holidays:[]};
async function loadConfig(){
  try{
    const s=await DB.getSchool();
    APP_CFG.restDays = Array.isArray(s.restDays)&&s.restDays.length? s.restDays : [0,6];
    APP_CFG.sesi = s.sesi || new Date().getFullYear();
    if(s.nama){ simpanNamaSekolah(s.nama); terapkanIdentiti(); }
    applyTheme(s.themeColor||'#7FB89A');
    APP_CFG.holidays = await DB.listHolidays();
  }catch(e){ /* biar lalai */ }
}

// Padankan pengguna Firebase dengan profil `users`. Jika belum wujud, AUTO-CIPTA
// (cth log masuk Google kali pertama). Pendaftar pertama menjadi Administrator.
async function resolveProfile(user){
  const ref=fbDB.collection('users').doc(user.email);
  const doc=await ref.get();
  if(doc.exists){
    const data=doc.data();
    if(data.aktif===false){ await fbAuth.signOut(); throw new Error('Akaun anda dinyahaktifkan. Sila hubungi Administrator.'); }
    CURRENT={id:doc.id,...data};
  }else{
    let first=true; try{ first=(await fbDB.collection('users').limit(1).get()).empty; }catch(e){ first=true; }
    const role=first?'Administrator':'Guru Kelas';
    const data={nama:user.displayName||user.email,email:user.email,role,aktif:true,kelasId:null,jawatan:role};
    await ref.set(data);
    CURRENT={id:user.email,...data};
  }
  // Penyembuhan: jika sistem langsung TIADA admin (peranan terpadam/tersilap),
  // naikkan pengguna ini supaya sistem tidak terkunci tanpa admin.
  if(!['Administrator','Guru Besar','PK HEM'].includes(CURRENT.role)){
    try{
      const admins=await fbDB.collection('users')
        .where('role','in',['Administrator','Guru Besar','PK HEM']).limit(1).get();
      if(admins.empty){
        await ref.set({role:'Administrator',jawatan:'Administrator'},{merge:true});
        CURRENT.role='Administrator'; CURRENT.jawatan='Administrator';
        toast('Tiada admin dikesan — akaun anda dinaikkan ke Administrator.','info');
      }
    }catch(e){}
  }
  sessionStorage.setItem(SESS_KEY,JSON.stringify(CURRENT));
}

async function doGoogleLogin(){
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  try{
    const cred=await fbAuth.signInWithPopup(provider);
    await resolveProfile(cred.user);
  }catch(e){
    // Kalau popup disekat (biasa pada mod PWA), guna redirect. Hasil dikendali di init().
    if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/cancelled-popup-request'].includes(e.code)){
      await fbAuth.signInWithRedirect(provider); return;
    }
    throw e;
  }
}

async function doLogin(username,password){
  if(USE_FIREBASE){
    // Firebase: username dilayan sebagai emel
    const cred=await fbAuth.signInWithEmailAndPassword(username,password);
    await resolveProfile(cred.user);
  }else{
    const u=DEMO.users.find(x=>x.username===username && x.password===password && x.aktif);
    if(!u) throw new Error('ID pengguna atau kata laluan salah.');
    CURRENT={...u};
    sessionStorage.setItem(SESS_KEY,JSON.stringify(CURRENT));
  }
}
function restoreSession(){
  try{const c=sessionStorage.getItem(SESS_KEY);if(c){CURRENT=JSON.parse(c);return true;}}catch(e){}
  return false;
}
async function doLogout(){
  if(USE_FIREBASE) await fbAuth.signOut();
  CURRENT=null; sessionStorage.removeItem(SESS_KEY);
  location.hash=''; renderAuth();
}

// Terjemah kod ralat Firebase ke Bahasa Malaysia (bantu diagnosis)
function authErr(e){
  const m={
    'auth/email-already-in-use':'Emel ini sudah didaftarkan. Sila Log Masuk.',
    'auth/invalid-email':'Format emel tidak sah.',
    'auth/weak-password':'Kata laluan terlalu lemah (minimum 6 aksara).',
    'auth/wrong-password':'Kata laluan salah.',
    'auth/user-not-found':'Akaun tidak dijumpai. Sila Daftar dahulu.',
    'auth/invalid-credential':'Emel atau kata laluan salah.',
    'auth/invalid-login-credentials':'Emel atau kata laluan salah.',
    'auth/operation-not-allowed':'Kaedah Emel/Kata Laluan belum diaktifkan di Firebase Console (Authentication → Sign-in method).',
    'auth/unauthorized-domain':'Domain ini belum dibenarkan (Authentication → Settings → Authorized domains).',
    'auth/network-request-failed':'Masalah rangkaian. Semak sambungan internet.',
    'permission-denied':'Akses ditolak. Pastikan firestore.rules sudah di-Publish.'
  };
  return (e&&(m[e.code]||e.message))||'Ralat tidak diketahui.';
}

// Daftar akaun baharu. Pendaftar PERTAMA automatik jadi Administrator.
async function doRegister(nama,email,pass){
  if(USE_FIREBASE){
    const cred=await fbAuth.createUserWithEmailAndPassword(email,pass); // auto log masuk
    let first=true;
    try{ first=(await fbDB.collection('users').limit(1).get()).empty; }catch(e){ first=true; }
    const role=first?'Administrator':'Guru Kelas';
    const data={nama,email,role,aktif:true,kelasId:null,jawatan:role};
    await fbDB.collection('users').doc(email).set(data);
    CURRENT={id:email,...data};
  }else{
    if(DEMO.users.find(u=>u.email===email||u.username===email)) throw new Error('Emel sudah didaftarkan.');
    // Mod Demo = kotak pasir tempatan; pendaftar diberi akses penuh (Administrator)
    const u={id:uid(),nama,username:email,email,password:pass,role:'Administrator',jawatan:'Administrator',aktif:true,kelasId:null};
    DEMO.users.push(u); saveDemo(DEMO); CURRENT={...u};
  }
  sessionStorage.setItem(SESS_KEY,JSON.stringify(CURRENT));
}

/* ---------------------------------------------------------
   4. Skrin LOG MASUK / DAFTAR
--------------------------------------------------------- */
function renderAuth(mode){
  mode=mode||'login';
  $('#app').classList.remove('active');
  const root=$('#auth'); root.style.display='grid';
  let modeTag;
  if(USE_FIREBASE){
    modeTag='<p style="color:var(--blue);font-size:12px">Mod Firebase aktif'+(window.__SCHOOL_ID__?' · '+esc(window.__SCHOOL_ID__):'')+'</p>';
  }else if(window.__SCHOOL_ID__){
    modeTag='<p style="color:var(--danger);font-size:12px;font-weight:700">⚠ Config sekolah "'+esc(window.__SCHOOL_ID__)+'" tidak dijumpai atau belum diisi. Hubungi penyedia sistem.</p>';
  }else{
    modeTag='<p style="color:var(--warn);font-size:12px">Mod Demo — data dalam pelayar ini sahaja</p>';
  }
  const brand=`<div class="auth-brand">
        <img class="auth-logo" src="./assets/logo.png" alt="e-RMT">
        <h1>${esc(schoolNames().pendek)}</h1>
        <p>E-Rekod RMT System</p>${modeTag}</div>`;

  /* ----- DAFTAR ----- */
  if(mode==='register'){
    root.innerHTML=`<div class="auth-card card">${brand}
      <div class="field"><label>Nama penuh</label><input id="rg-nama" placeholder="Nama anda"></div>
      <div class="field"><label>Emel</label><input id="rg-email" type="email" placeholder="nama@contoh.com"></div>
      <div class="field"><label>Kata laluan</label><input id="rg-pass" type="password" placeholder="minimum 6 aksara"></div>
      <div class="field"><label>Sahkan kata laluan</label><input id="rg-pass2" type="password"></div>
      <button class="btn btn-primary" id="rg-btn" style="width:100%">Daftar Akaun</button>
      <p style="color:var(--muted);font-size:12px;text-align:center;margin:12px 0 0">
        Pendaftar pertama akan menjadi <b>Administrator</b>.</p>
      <div class="or-sep"><span>sudah ada akaun?</span></div>
      <button class="btn btn-ghost" id="to-login" style="width:100%">Log Masuk</button>
    </div>`;
    $('#to-login').onclick=()=>renderAuth('login');
    const reg=async()=>{
      const btn=$('#rg-btn');
      const nama=$('#rg-nama').value.trim();
      const email=$('#rg-email').value.trim().toLowerCase();
      const p1=$('#rg-pass').value, p2=$('#rg-pass2').value;
      if(!nama||!email||!p1){toast('Sila isi semua ruang.','err');return;}
      if(p1.length<6){toast('Kata laluan minimum 6 aksara.','err');return;}
      if(p1!==p2){toast('Kata laluan tidak sepadan.','err');return;}
      btn.disabled=true; btn.innerHTML='<span class="spinner"></span>';
      try{ await doRegister(nama,email,p1); DB.addLog('Daftar akaun',email); toast('Akaun berjaya didaftar!','ok'); enterApp(); }
      catch(e){ toast(authErr(e),'err'); btn.disabled=false; btn.textContent='Daftar Akaun'; }
    };
    $('#rg-btn').onclick=reg;
    $('#rg-pass2').addEventListener('keydown',e=>{if(e.key==='Enter')reg();});
    return;
  }

  /* ----- LOG MASUK ----- */
  const googleG = '<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.1z"/><path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.6 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.3-5.7z"/><path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14.2l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1z"/></svg>';
  const googleBlock = USE_FIREBASE ? `
      <button class="btn btn-google" id="lg-google">${googleG} Log masuk dengan Google</button>
      <div class="or-sep"><span>atau guna emel &amp; kata laluan</span></div>` : '';
  root.innerHTML=`<div class="auth-card card">${brand}
      ${googleBlock}
      <div class="field"><label>${USE_FIREBASE?'Emel':'ID Pengguna'}</label>
        <input id="lg-user" autocomplete="username" placeholder="${USE_FIREBASE?'nama@contoh.com':'admin'}"></div>
      <div class="field"><label>Kata Laluan</label>
        <input id="lg-pass" type="password" autocomplete="current-password" placeholder="••••••••"></div>
      <button class="btn btn-primary" id="lg-btn" style="width:100%">Log Masuk</button>
      <div class="or-sep"><span>belum ada akaun?</span></div>
      <button class="btn btn-ghost" id="to-register" style="width:100%">Daftar Akaun Baharu</button>
    </div>`;
  $('#to-register').onclick=()=>renderAuth('register');
  if(USE_FIREBASE){
    $('#lg-google').onclick=async()=>{
      const gb=$('#lg-google'); gb.disabled=true; gb.innerHTML='<span class="spinner dark"></span>';
      try{ await doGoogleLogin(); if(CURRENT){DB.addLog('Log masuk (Google)','');enterApp();} }
      catch(e){ toast(authErr(e),'err'); gb.disabled=false; gb.innerHTML=`${googleG} Log masuk dengan Google`; }
    };
  }
  const submit=async()=>{
    const btn=$('#lg-btn'); const u=$('#lg-user').value.trim(); const p=$('#lg-pass').value;
    if(!u||!p){toast('Isi emel dan kata laluan.','err');return;}
    btn.disabled=true; btn.innerHTML='<span class="spinner"></span>';
    try{ await doLogin(u,p); DB.addLog('Log masuk',''); enterApp(); }
    catch(e){ toast(authErr(e),'err'); btn.disabled=false; btn.textContent='Log Masuk'; }
  };
  $('#lg-btn').onclick=submit;
  $('#lg-pass').addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
}

/* ---------------------------------------------------------
   5. Rangka aplikasi + navigasi
--------------------------------------------------------- */
const NAV=[
  {id:'dashboard',label:'Dashboard',short:'Utama',icon:'dash',all:true,p:1},
  {id:'kehadiran',label:'Kehadiran',short:'Kehadiran',icon:'check',all:true,p:1},
  {id:'imbas',label:'Imbas QR',short:'Imbas',icon:'qr',all:true,p:1},
  {id:'murid',label:'Maklumat Murid',short:'Murid',icon:'student',all:true,p:1},
  {id:'borang',label:'Borang C1/C2',short:'Borang',icon:'file',all:true,p:1},
  {id:'rumusan',label:'Rumusan Kehadiran',short:'Rumusan',icon:'chart',all:true,p:1},
  {id:'kelas',label:'Maklumat Kelas',short:'Kelas',icon:'cls',admin:true},
  {id:'guru',label:'Guru & Pengguna',short:'Guru',icon:'teacher',admin:true},
  {id:'kalendar',label:'Hari & Cuti',short:'Cuti',icon:'cal',admin:true},
  {id:'tetapan',label:'Tetapan Sekolah',short:'Tetapan',icon:'gear',admin:true},
];

async function enterApp(){
  $('#auth').style.display='none';
  $('#app').classList.add('active');
  buildShell();
  await loadConfig();
  if(!location.hash) location.hash='#dashboard';
  route();
}

function buildShell(){
  const navList=NAV.filter(n=>n.all||(n.admin&&isAdmin()));
  const items=navList.map(n=>
    `<div class="nav-item" data-nav="${n.id}">${IC[n.icon]}<span>${n.label}</span></div>`).join('');
  // Susunan telefon: 2 tab · BUTANG IMBAS terangkat di tengah · 1 tab · Lagi
  const tabKiri=['dashboard','kehadiran'], tabKanan=['murid'];
  const cari=id=>navList.find(n=>n.id===id);
  const tab=n=>n?`<div class="bnav-item" data-nav="${n.id}" title="${esc(n.label)}">${IC[n.icon]}<span>${n.short||n.label}</span></div>`:'';
  const adaImbas=!!cari('imbas');
  const dalamBar=new Set([...tabKiri,...tabKanan,'imbas']);
  const extra=navList.filter(n=>!dalamBar.has(n.id));
  let bitems=tabKiri.map(id=>tab(cari(id))).join('');
  if(adaImbas) bitems+=`<div class="bnav-item" data-nav="imbas" title="Imbas QR">${IC.qr}<span>Imbas</span></div>`;
  bitems+=tabKanan.map(id=>tab(cari(id))).join('');
  if(extra.length) bitems+=`<div class="bnav-item" id="bnavMore" title="Menu lain">${IC.gear}<span>Lagi</span></div>`;
  $('#app').innerHTML=`
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <img class="logo" src="./assets/logo.png" alt="" style="width:34px;height:34px;border-radius:9px;flex:none">
        <div class="brand"><span>e-RMT</span><span class="bsub hide-sm">${esc(schoolNames().pendek)}</span></div>
      </div>
      <div class="spacer"></div>
      <button class="icon-btn" id="darkBtn" title="Mod gelap">${IC.moon}</button>
      <div class="user-chip"><span>${esc(CURRENT.nama)}</span><span class="role">· ${esc(CURRENT.role)}</span></div>
      <button class="icon-btn" id="logoutBtn" title="Log keluar">${IC.logout}</button>
    </div>
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <span class="nav-pill" id="navPill" aria-hidden="true"></span>
        ${items}
        <div class="nav-sep"></div>
        <div class="nav-item" id="nav-logout">${IC.logout}<span>Log Keluar</span></div>
      </aside>
      <main class="content" id="view"></main>
    </div>
    <nav class="bottom-nav" id="bnav"><span class="bnav-pill" id="bnavPill" aria-hidden="true"></span>${bitems}</nav>`;
  $('#logoutBtn').onclick=$('#nav-logout').onclick=doLogout;
  $('#darkBtn').onclick=toggleDark;
  const moreBtn=$('#bnavMore');
  if(moreBtn) moreBtn.onclick=e=>{
    rippleAt(moreBtn,e); tapHaptic();
    openModal(`
      <div class="modal-head"><h3>Menu Lain</h3><div style="flex:1"></div>
        <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
      <div class="modal-body" style="padding:10px 12px 16px">
        ${extra.map(n=>`<div class="nav-item" data-more="${n.id}" style="margin-bottom:4px">${IC[n.icon]}<span>${n.label}</span></div>`).join('')}
        <div class="nav-sep"></div>
        <div class="nav-item" id="more-logout">${IC.logout}<span>Log Keluar</span></div>
      </div>`);
    $$('[data-more]').forEach(x=>x.onclick=()=>{closeModal();location.hash='#'+x.dataset.more;});
    $('#more-logout').onclick=()=>{closeModal();doLogout();};
  };
  $$('.nav-item[data-nav], .bnav-item[data-nav]').forEach(el=>{
    el.setAttribute('tabindex','0');
    el.onclick=e=>{ rippleAt(el,e); tapHaptic(); location.hash='#'+el.dataset.nav; };
    el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();} };
  });
}

// Pengawal navigasi: halaman async yang lambat siap TIDAK boleh menindih
// halaman yang sedang dibuka pengguna (punca "tiba-tiba kembali ke Dashboard").
function onPage(id){
  const cur=(location.hash||'#dashboard').slice(1)||'dashboard';
  return cur===id;
}

function setActiveNav(id){
  $$('.nav-item[data-nav], .bnav-item[data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav===id));
  moveLiquid(id);
}

/* --- Navigasi cecair ---------------------------------------------------
   Pil tidak melompat. Ia meregang sehingga meliputi kedudukan lama DAN baru,
   kemudian mengecut ke sasaran — memberi rasa cecair yang mengalir. */
function moveLiquid(id){
  requestAnimationFrame(()=>{
    const bp=$('#bnavPill');
    if(bp&&!kurangGerak()){ bp.classList.remove('pop'); void bp.offsetWidth;
      setTimeout(()=>bp.classList.add('pop'),190); }
    liquidTo($('#bnavPill'), $(`.bnav-item[data-nav="${id}"]`), 'x');
    liquidTo($('#navPill'),  $(`.nav-item[data-nav="${id}"]`),  'y');
    const btn=$(`.bnav-item[data-nav="${id}"]`);
    if(btn&&btn.scrollIntoView) try{btn.scrollIntoView({inline:'center',block:'nearest',
      behavior:kurangGerak()?'auto':'smooth'});}catch(e){}
  });
}
function liquidTo(pill,target,axis){
  if(!pill)return;
  // Butang bulat terangkat tidak menggunakan pil
  if(!target||target.classList.contains('fabwrap')){pill.classList.remove('on');return;}
  const host=pill.parentElement;
  const pad=axis==='x'?3:0, padY=axis==='x'?0:2;
  const to = axis==='x'
    ? {a:target.offsetLeft-pad, b:target.offsetWidth+pad*2}
    : {a:target.offsetTop-padY, b:target.offsetHeight+padY*2};
  const shown=pill.classList.contains('on');
  const from = shown
    ? (axis==='x' ? {a:parseFloat(pill.style.left)||0,b:parseFloat(pill.style.width)||0}
                  : {a:parseFloat(pill.style.top)||0, b:parseFloat(pill.style.height)||0})
    : to;
  pill.classList.add('on');

  const apply=(a,b)=>{
    if(axis==='x'){pill.style.left=a+'px';pill.style.width=b+'px';
      pill.style.top='';pill.style.height='';}
    else{pill.style.top=a+'px';pill.style.height=b+'px';}
  };

  if(!shown||kurangGerak()||from.a===to.a){ apply(to.a,to.b); return; }

  // Fasa 1: regang meliputi kedua-dua kedudukan
  const start=Math.min(from.a,to.a);
  const end=Math.max(from.a+from.b,to.a+to.b);
  apply(start,end-start);
  // Fasa 2: mengecut ke sasaran (pemasa berasingan bagi setiap pil)
  clearTimeout(pill.__liq);
  pill.__liq=setTimeout(()=>apply(to.a,to.b),170);
}
window.addEventListener('resize',()=>{
  const id=(location.hash||'#dashboard').slice(1)||'dashboard';
  const p1=$('#bnavPill'),p2=$('#navPill');
  if(p1)p1.classList.remove('on'); if(p2)p2.classList.remove('on'); // letak semula tanpa animasi
  moveLiquid(id);
});

function route(){
  if(typeof stopScan==='function') stopScan(); // matikan kamera bila tukar halaman
  if(!CURRENT){renderAuth();return;}
  const page=(location.hash||'#dashboard').slice(1);
  setActiveNav(page);
  const v=$('#view'); if(!v)return;
  v.innerHTML=skeleton(5);
  ({dashboard:pageDashboard,kehadiran:pageKehadiran,murid:pageMurid,
    kelas:pageKelas,guru:pageGuru,kalendar:pageKalendar,borang:pageBorang,rumusan:pageRumusan,imbas:pageImbas,tetapan:pageTetapan}[page]||pageDashboard)(v);
}
window.addEventListener('hashchange',route);

/* Dark mode */
function toggleDark(){
  const d=document.documentElement.getAttribute('data-theme')==='dark'?'':'dark';
  document.documentElement.setAttribute('data-theme',d);
  localStorage.setItem('rmt_theme',d);
  try{const t=localStorage.getItem(THEME_KEY);if(t)applyTheme(t);}catch(e){}
}
(function initTheme(){const t=localStorage.getItem('rmt_theme');if(t)document.documentElement.setAttribute('data-theme',t);})();

/* ---------------------------------------------------------
   6. HALAMAN: Papan Pemuka
--------------------------------------------------------- */
async function pageDashboard(v){
  const [students,classes,users,school]=await Promise.all([DB.getStudents(),DB.getClasses(),DB.getUsers(),DB.getSchool()]);
  const rmtAktif=students.filter(aktifHariIni);
  const today=new Date(); const y=today.getFullYear(),m=today.getMonth(),d=today.getDate();
  // hadir hari ini merentas semua kelas
  let hadir=0,tidak=0;
  const todayRecs=await Promise.all(classes.map(c=>DB.getAttendance(c.id,y,m)));
  classes.forEach((c,ci)=>{
    const rec=todayRecs[ci];
    for(const s of rmtAktif.filter(x=>x.kelasId===c.id)){
      const mark=rec[s.id]?.[d];
      if(mark==='H')hadir++; else if(mark==='X')tidak++;
    }
  });
  const teachers=users.filter(u=>u.role.startsWith('Guru'));
  const monthly=await buildMonthlyChart(classes,rmtAktif,y);

  if(!onPage('dashboard'))return; // halaman lain sudah dibuka — jangan tindih

  // Hero: peratus kehadiran bulan semasa merentas semua kelas
  let mH=0,mX=0;
  todayRecs.forEach(rec=>{ Object.values(rec).forEach(r=>{
    Object.values(r).forEach(k=>{ if(k==='H')mH++; else if(k==='X')mX++; }); }); });
  const mTot=mH+mX, mPct=mTot?Math.round(mH/mTot*100):null;

  const hariNama=['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'][today.getDay()];

  // Kelas terkini + status pengesahan (penegasan maklumat penting)
  // SEMUA kelas — dibaca serentak, dipapar sebagai jalur boleh skrol
  const senaraiKelas=sortCls(classes);
  const docs=await Promise.all(senaraiKelas.map(c=>DB.getAttDoc(c.id,y,m)));
  const kelasBaris=[];
  senaraiKelas.forEach((c,ci)=>{
    const doc=docs[ci];
    let h=0,x=0;
    Object.values(doc.records||{}).forEach(r=>Object.values(r).forEach(k=>{if(k==='H')h++;else if(k==='X')x++;}));
    const tot=h+x, pct=tot?Math.round(h/tot*100):null;
    const bil=rmtAktif.filter(st=>st.kelasId===c.id).length;
    kelasBaris.push(`<div class="rcard ${doc.sah?'ok':(tot?'warn':'')}" data-kelas="${c.id}">
      <div class="rtitle">${esc(clsLabel(c))}</div>
      <div class="rtags">
        <span class="rbadge ${doc.sah?'ok':(tot?'warn':'off')}">${doc.sah?'Disahkan':(tot?'Belum disahkan':'Tiada rekod')}</span>
        <span class="rmeta">${pct==null?'—':pct+'% kehadiran'}</span>
      </div>
      <div class="rmeta">${bil} murid RMT${tot?` · ${h} hadir, ${x} tidak hadir`:''}</div>
    </div>`);
  });

  v.innerHTML=`
    <div class="page-head">
      <div class="htxt"><h2>Dashboard</h2>
        <div class="sub">${hariNama}, ${d} ${MONTHS[m]} ${y}</div></div>
      <div class="spacer"></div>
      <button class="fab-add" id="go-imbas" title="Imbas QR kehadiran">${IC.qr}</button>
    </div>

    <h3 class="sect">Tindakan Pantas</h3>
    <div class="qa-grid">
      <button class="qa" data-goto="kehadiran">${IC.check}<span>Tanda Kehadiran</span></button>
      <button class="qa" data-goto="imbas">${IC.qr}<span>Imbas QR</span></button>
      <button class="qa" data-goto="rumusan">${IC.chart}<span>Rumusan</span></button>
    </div>

    <h3 class="sect">Statistik</h3>
    <div class="sgrid">
      <div class="scard wide">
        <div class="sh">${IC.chart}<div><div class="st">Kehadiran Bulan Ini</div>
          <div class="ss">${MONTHS[m]} ${y}${mTot?` · ${mH}/${mTot} rekod`:''}</div></div></div>
        <div class="sv"><b id="hv-pct">${mPct==null?'—':'0'}</b><span>%</span></div>
        <div class="track"><i style="width:${mPct==null?0:mPct}%"></i></div>
      </div>
      <div class="scard">
        <div class="sh">${IC.check}<div><div class="st">Hadir Hari Ini</div>
          <div class="ss">${d} ${MONTHS[m]}</div></div></div>
        <div class="sv"><b id="hv-h">0</b><span>murid</span></div>
      </div>
      <div class="scard r">
        <div class="sh">${IC.check}<div><div class="st">Tidak Hadir</div>
          <div class="ss">${d} ${MONTHS[m]}</div></div></div>
        <div class="sv"><b id="hv-x">0</b><span>murid</span></div>
      </div>
      <div class="scard">
        <div class="sh">${IC.student}<div><div class="st">Murid RMT</div>
          <div class="ss">Status aktif</div></div></div>
        <div class="sv"><b id="hv-m">0</b><span>murid</span></div>
      </div>
      <div class="scard">
        <div class="sh">${IC.cls}<div><div class="st">Kelas</div>
          <div class="ss">${teachers.length} guru · ${users.length} pengguna</div></div></div>
        <div class="sv"><b>${classes.length}</b><span>kelas</span></div>
      </div>
    </div>

    <h3 class="sect">Status Kelas <span class="sect-note">${senaraiKelas.length} kelas · leret ke tepi</span></h3>
    ${kelasBaris.length
      ? `<div class="rstrip">${kelasBaris.join('')}</div>`
      : emptyRich('Belum ada kelas','Tambah kelas dahulu sebelum merekod kehadiran.','')}

    <h3 class="sect">Kehadiran Bulanan ${y}</h3>
    <div class="card">${monthly}</div>`;

  $('#go-imbas').onclick=()=>{location.hash='#imbas';};
  $$('.qa[data-goto]').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.goto;});
  $$('.rcard[data-kelas]').forEach(el=>el.onclick=()=>{
    C8_STATE.kelasId=el.dataset.kelas; location.hash='#kehadiran';});


  // Nombor berlari naik — hanya di Dashboard, sekali setiap kunjungan
  if(mPct!=null) countUp($('#hv-pct'),mPct,900);
  countUp($('#hv-h'),hadir,700);
  countUp($('#hv-x'),tidak,700);
  countUp($('#hv-m'),rmtAktif.length,700);
}
function stat(cls,ico,val,lbl){
  return `<div class="stat ${cls}"><div class="ico">${ico}</div>
    <div class="txt"><div class="val">${val}</div><div class="lbl">${lbl}</div></div></div>`;
}
async function buildMonthlyChart(classes,students,year){
  // baca semua (kelas × bulan) SERENTAK — jauh lebih laju
  const jobs=[];
  for(let m=0;m<12;m++) for(const c of classes)
    jobs.push(DB.getAttendance(c.id,year,m).then(rec=>({m,c,rec})));
  const all=await Promise.all(jobs);
  const tally=Array.from({length:12},()=>({h:0,t:0}));
  for(const {m,c,rec} of all){
    const cs=students.filter(s=>s.kelasId===c.id);
    for(const s of cs){ const r=rec[s.id]||{};
      Object.values(r).forEach(mk=>{ tally[m].t++; if(mk==='H')tally[m].h++; }); }
  }
  const pcts=tally.map(x=>x.t?Math.round(x.h/x.t*100):0);
  const W=680,H=200,pad=28,bw=W/12;
  const bars=pcts.map((p,i)=>{
    const h=(H-pad*2)*(p/100); const x=i*bw+bw*0.2; const y=H-pad-h;
    return `<rect x="${x}" y="${y}" width="${bw*0.6}" height="${h||1}" rx="3" fill="var(--green)"/>
      <text x="${x+bw*0.3}" y="${y-4}" text-anchor="middle" font-size="10" fill="var(--muted)">${p?p+'%':''}</text>
      <text x="${x+bw*0.3}" y="${H-pad+14}" text-anchor="middle" font-size="10" fill="var(--muted)">${MONTHS[i].slice(0,3)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;max-height:230px">
    <line x1="${pad}" y1="${H-pad}" x2="${W}" y2="${H-pad}" stroke="var(--line)"/>${bars}</svg>`;
}

/* ---------------------------------------------------------
   7. Fungsi kalendar (hari sekolah / hujung minggu / cuti)
--------------------------------------------------------- */
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function isWeekend(y,m,day){ return APP_CFG.restDays.includes(new Date(y,m,day).getDay()); } // hari cuti mingguan ikut tetapan
function isHoliday(y,m,day){
  const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  return (APP_CFG.holidays||[]).some(h=>h.date===ds);
}
function holidayName(y,m,day){
  const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const h=(APP_CFG.holidays||[]).find(x=>x.date===ds); return h?h.nama:'';
}
function schoolDays(y,m){ // senarai hari persekolahan (bukan cuti mingguan/kelepasan)
  const out=[]; for(let d=1;d<=daysInMonth(y,m);d++){ if(!isWeekend(y,m,d)&&!isHoliday(y,m,d))out.push(d);} return out;
}

/* ---------------------------------------------------------
   8. HALAMAN: Kehadiran (Borang C8)
--------------------------------------------------------- */
const C8_STATE={kelasId:null,year:new Date().getFullYear(),month:new Date().getMonth()};

async function pageKehadiran(v){
  const classes=await DB.getClasses();
  let allowed = sortCls(seesAllClasses() ? classes : classes.filter(c=>c.id===CURRENT.kelasId||c.guruId===CURRENT.id));
  if(!allowed.length){
    v.innerHTML=emptyState('Tiada kelas diperuntukkan kepada anda. Sila hubungi Administrator.'); return;
  }
  if(!C8_STATE.kelasId||!allowed.find(c=>c.id===C8_STATE.kelasId)) C8_STATE.kelasId=allowed[0].id;

  const clsOpts=allowed.map(c=>`<option value="${c.id}" ${c.id===C8_STATE.kelasId?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  const moOpts=MONTHS.map((mm,i)=>`<option value="${i}" ${i===C8_STATE.month?'selected':''}>${mm}</option>`).join('');
  const yNow=new Date().getFullYear();
  const yOpts=yearRange().map(yy=>`<option value="${yy}" ${yy===C8_STATE.year?'selected':''}>${yy}</option>`).join('');

  if(!onPage('kehadiran'))return; // halaman lain sudah dibuka — jangan tindih

  v.innerHTML=`
    <div class="page-head">
      <div class="htxt"><h2>Kehadiran</h2>
        <div class="sub" id="c8-sub"></div></div>
      <div class="spacer"></div>
      <span class="savepill" id="c8-save"></span>
      <button class="btn btn-blue" id="printC8">${IC.print} Cetak</button></div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Kelas</label><select id="c8-kelas">${clsOpts}</select></div>
      <div class="field"><label>Bulan</label><select id="c8-bulan">${moOpts}</select></div>
      <div class="field"><label>Tahun</label><select id="c8-tahun">${yOpts}</select></div>
    </div>
    <div id="c8-holder"></div>
    <div class="chips no-print" style="margin-top:14px">
      <span class="chip"><i></i> Hadir</span>
      <span class="chip r"><i></i> Tidak hadir</span>
      <span class="chip a"><i></i> Cuti mingguan</span>
      <span class="chip b"><i></i> Cuti umum</span>
    </div>
    <p class="no-print" style="color:var(--muted);font-size:12.5px;margin-top:10px">
      Ketik sel untuk kitar kosong → ✓ → ✕. Auto simpan.</p>`;

  $('#c8-kelas').onchange=e=>{C8_STATE.kelasId=e.target.value;renderC8();};
  $('#c8-bulan').onchange=e=>{C8_STATE.month=+e.target.value;renderC8();};
  $('#c8-tahun').onchange=e=>{C8_STATE.year=+e.target.value;renderC8();};
  // Data kehadiran sama; hanya tajuk borang cetakan berbeza (RMT / PSS)
  $('#printC8').onclick=()=>{
    openModal(`
      <div class="modal-head"><h3>Cetak Borang C8</h3><div style="flex:1"></div>
        <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
      <div class="modal-body">
        <p style="margin:0 0 14px;color:var(--muted);font-size:13px">
          Pilih program. Rekod kehadiran adalah sama — hanya tajuk borang berbeza.</p>
        <div class="field"><label>Program</label>
          <select id="pc-prog">
            <option value="RMT">RMT — Rancangan Makanan Tambahan</option>
            <option value="PSS">PSS — Program Susu Sekolah</option>
          </select></div>
        <div class="field"><label>Skop</label>
          <select id="pc-skop">
            <option value="satu">Kelas ini sahaja</option>
            ${isAdmin()?'<option value="semua">Semua kelas (satu kelas satu halaman)</option>':''}
          </select></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" id="pc-go">${IC.print} Cetak</button></div>`);
    $('#pc-go').onclick=()=>{
      const prog=$('#pc-prog').value, skop=$('#pc-skop').value;
      closeModal();
      if(skop==='semua') printC8All(prog); else printC8(prog);
    };
  };
  renderC8();
}

async function renderC8(){
  const holder=$('#c8-holder'); if(!holder)return;
  holder.innerHTML=skeleton(6);
  const {kelasId,year,month}=C8_STATE;
  const [students,classes,school]=await Promise.all([DB.getStudents(),DB.getClasses(),DB.getSchool()]);
  const cls=classes.find(c=>c.id===kelasId);
  const roster=await rosterStudents(kelasId,year,month);
  const rec=await DB.getAttendance(kelasId,year,month);
  const sahInfo=await DB.getSah(kelasId,year,month);
  C8_STATE.locked=!!sahInfo;
  // rekod bulan lepas (untuk kolum "BULAN LEPAS")
  const pm = month===0?11:month-1, py = month===0?year-1:year;
  const recPrev=await DB.getAttendance(kelasId,py,pm);

  const nDays=daysInMonth(year,month);
  const kini=new Date(); const hariIni=(kini.getFullYear()===year&&kini.getMonth()===month)?kini.getDate():0;
  const dayCells=[];
  for(let d=1;d<=nDays;d++) dayCells.push({d,we:isWeekend(year,month,d),hol:isHoliday(year,month,d)});

  // ---- header ----
  const dayTh=dayCells.map(c=>`<th class="col-day ${c.we?'we':''} ${c.hol?'hol':''} ${c.d===hariIni?'today':''}">${c.d}</th>`).join('');
  const bulanLabel=`${MONTHS[month]} ${year}`;
  const sub=$('#c8-sub'); if(sub)sub.textContent=`${clsLabel(cls)} · ${bulanLabel}`;

  // ---- baris murid ----
  let bodyRows='';
  roster.forEach((s,i)=>{
    const sr=rec[s.id]||{};
    let hadir=0,absSemasa=0;
    const cells=dayCells.map(c=>{
      const mk=sr[c.d]; if(mk==='H')hadir++; if(mk==='X')absSemasa++;
      const cls=[c.we?'we':'',c.hol?'hol':'',mk==='H'?'present':'',mk==='X'?'absent':'',c.d===hariIni?'today':''].join(' ');
      const sym=mk==='H'?'✓':mk==='X'?'✕':'';
      const clickable=(!c.we&&!c.hol);
      return `<td class="day ${cls}" data-sid="${s.id}" data-day="${c.d}" ${clickable?'':'data-lock="1"'}>${sym}</td>`;
    }).join('');
    // bulan lepas: bilangan X
    const prev=recPrev[s.id]||{}; let absLepas=0; Object.values(prev).forEach(x=>{if(x==='X')absLepas++;});
    const jumlahSemua=absSemasa+absLepas;
    bodyRows+=`<tr>
      <td class="col-bil">${i+1}</td>
      <td class="name col-nama">${esc(s.nama)}<span class="nsub">${hadir} hari hadir</span></td>
      <td class="col-thn">${s.tahun}</td>
      <td class="col-jan">${s.jantina}</td>
      ${cells}
      <td class="calc col-tot" data-role="hadir" data-sid="${s.id}">${hadir}</td>
      <td class="col-abs" data-role="absS" data-sid="${s.id}">${absSemasa}</td>
      <td class="col-abs">${absLepas}</td>
      <td class="col-abs" data-role="absAll" data-sid="${s.id}">${jumlahSemua}</td>
    </tr>`;
  });
  if(!roster.length) bodyRows=`<tr><td colspan="${5+nDays+3}" style="padding:20px;color:var(--muted)">Tiada murid RMT aktif dalam kelas ini.</td></tr>`;

  // ---- footer (jumlah per hari) ----
  const footTidak=dayCells.map(c=>`<td class="col-day ${c.we?'we':''} ${c.hol?'hol':''}" data-foot="tidak" data-day="${c.d}"></td>`).join('');
  const footHadir=dayCells.map(c=>`<td class="col-day ${c.we?'we':''} ${c.hol?'hol':''}" data-foot="hadir" data-day="${c.d}"></td>`).join('');
  const footShould=dayCells.map(c=>`<td class="col-day ${c.we?'we':''} ${c.hol?'hol':''}" data-foot="should" data-day="${c.d}"></td>`).join('');

  const bolehSah = isAdmin() || CURRENT.kelasId===kelasId || cls.guruId===CURRENT.id;
  let sahZone='';
  if(sahInfo){
    const tkh=new Date(sahInfo.tarikh);
    sahZone=`<div class="callout ok no-print"><span class="ci">✓</span>
      <span><b>Telah disahkan</b> oleh ${esc(sahInfo.olehNama)} pada ${tkh.toLocaleDateString('ms-MY')} —
      kehadiran bulan ini tidak boleh diubah lagi.</span>
      ${isAdmin()?'<button class="btn btn-sm btn-ghost" id="c8-unsah">Buka Semula</button>':''}</div>`;
  }else if(bolehSah){
    sahZone=`<div class="callout warn no-print"><span class="ci">!</span>
      <span>${MONTHS[month]} belum lengkap — sahkan selepas semua hari ditanda.</span>
      <button class="btn btn-sm" id="c8-fill">⚡ Isi Pantas</button>
      <button class="btn btn-sm btn-primary" id="c8-sah">Sahkan</button></div>`;
  }
  holder.innerHTML=`
    ${sahZone}
    <div class="c8-scroll">
      <table class="c8">
        <thead>
          <tr><td class="c8-title" colspan="${5+nDays+3}">
            ${school.logo?`<img src="${school.logo}" style="height:32px;vertical-align:middle;margin-right:10px">`:''}
            ${esc(school.nama)} &nbsp;·&nbsp; REKOD KEHADIRAN MURID RMT &nbsp;·&nbsp; ${bulanLabel}
            &nbsp;·&nbsp; ${esc(clsLabel(cls))}
            <span style="float:right;font-size:11px">BORANG C8</span>
          </td></tr>
          <tr>
            <th class="col-bil" rowspan="2">BIL</th>
            <th class="col-nama" rowspan="2">NAMA PENUH MURID</th>
            <th class="col-thn" rowspan="2"><span class="vert">TAHUN</span></th>
            <th class="col-jan" rowspan="2"><span class="vert">JANTINA</span></th>
            <th colspan="${nDays}">BULAN : ${MONTHS[month].toUpperCase()}</th>
            <th class="col-tot" rowspan="2"><span class="vert">JUMLAH HARI</span></th>
            <th colspan="3">TIDAK HADIR</th>
          </tr>
          <tr>
            ${dayTh}
            <th class="col-abs">BULAN<br>SEMASA</th>
            <th class="col-abs">BULAN<br>LEPAS</th>
            <th class="col-abs">JUMLAH<br>SEMUA</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
        <tfoot>
          <tr><td colspan="2">JUMLAH MURID TIDAK HADIR</td><td colspan="2"></td>${footTidak}<td colspan="4"></td></tr>
          <tr><td colspan="2">JUMLAH MURID HADIR</td><td colspan="2"></td>${footHadir}<td colspan="4"></td></tr>
          <tr><td colspan="2">JUMLAH KEHADIRAN SEPATUTNYA</td><td colspan="2"></td>${footShould}<td colspan="4"></td></tr>
        </tfoot>
      </table>
    </div>`;

  recalcFooter();
  // klik sel — hanya jika BELUM disahkan
  if(!C8_STATE.locked){
    $$('.c8 td.day').forEach(td=>{
      if(td.dataset.lock)return;
      td.onclick=()=>cycleCell(td);
    });
  }
  const fillBtn=$('#c8-fill');
  if(fillBtn) fillBtn.onclick=()=>{
    const kini=new Date();
    const bulanLepas=(year<kini.getFullYear())||(year===kini.getFullYear()&&month<kini.getMonth());
    const hadSekolah=schoolDays(year,month)
      .filter(dd=>bulanLepas || year<kini.getFullYear() ||
        (year===kini.getFullYear()&&month<kini.getMonth()) ||
        (year===kini.getFullYear()&&month===kini.getMonth()&&dd<=kini.getDate()));
    const hariOpts=hadSekolah.map(dd=>`<option value="${dd}">${dd} ${MONTHS[month]}</option>`).join('');
    openModal(`
      <div class="modal-head"><h3>Isi Pantas Kehadiran</h3><div style="flex:1"></div>
        <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
      <div class="modal-body">
        <p style="margin:0 0 14px;color:var(--muted);font-size:13px">
          Tanda <b>HADIR</b> untuk semua murid sekaligus — memudahkan pengisian rekod bulan lepas.
          Hujung minggu, cuti umum dan hari hadapan dilangkau automatik.</p>
        <div class="field"><label>Skop</label>
          <select id="fl-skop">
            <option value="bulan">Seluruh ${MONTHS[month]} (${hadSekolah.length} hari persekolahan)</option>
            <option value="hari">Satu hari sahaja…</option>
          </select></div>
        <div class="field" id="fl-harifield" style="display:none"><label>Pilih hari</label>
          <select id="fl-hari">${hariOpts}</select></div>
        <label style="display:flex;align-items:center;gap:9px;font-size:13.5px;cursor:pointer">
          <input type="checkbox" id="fl-kosong" checked style="width:auto">
          <span>Isi <b>sel kosong sahaja</b> — jangan ganti tanda sedia ada</span></label>
        <p style="color:var(--muted);font-size:12px;margin:10px 0 0;line-height:1.5">
          Cadangan: tanda murid yang <b>tidak hadir</b> (✕) dahulu, kemudian guna fungsi ini
          untuk mengisi bakinya sebagai hadir.</p>
        ${isAdmin()?`<div style="border-top:1px solid var(--line);margin-top:16px;padding-top:14px">
          <button class="btn btn-sm btn-danger" id="fl-clear">Kosongkan semua tanda bulan ini</button></div>`:''}
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" id="fl-go">Tanda Hadir</button></div>`);

    $('#fl-skop').onchange=e=>{ $('#fl-harifield').style.display=e.target.value==='hari'?'':'none'; };

    $('#fl-go').onclick=async()=>{
      const skop=$('#fl-skop').value, kosongSahaja=$('#fl-kosong').checked;
      const hari = skop==='hari' ? [+$('#fl-hari').value] : hadSekolah;
      if(!hari.length){toast('Tiada hari persekolahan untuk diisi.','err');return;}
      // Baca semula rekod terkini — guru mungkin menanda sel selepas halaman dimuat
      const recNow=await DB.getAttendance(kelasId,year,month);
      const patch={}; let bil=0;
      roster.forEach(st=>{
        const sedia=recNow[st.id]||{};
        hari.forEach(dd=>{
          if(kosongSahaja && sedia[dd]) return;
          if(sedia[dd]==='H') return;
          patch[st.id]=patch[st.id]||{}; patch[st.id][dd]='H'; bil++;
        });
      });
      if(!bil){toast('Tiada sel untuk diisi — semua sudah ditanda.','info');closeModal();return;}
      // confirmDialog menggantikan kandungan modal — jadi jangan rujuk butang lama selepas ini
      const ok=await confirmDialog(`Tanda HADIR untuk ${bil} sel (${roster.length} murid × ${hari.length} hari)?`);
      if(!ok)return;
      toast('Menyimpan…','info');
      try{
        await DB.saveAttendanceMany(kelasId,year,month,patch);
        DB.addLog('Isi pantas kehadiran',`${clsLabel(cls)} · ${MONTHS[month]} ${year} · ${bil} sel`);
        toast(`${bil} sel ditanda hadir.`,'ok'); renderC8();
      }catch(e){ toast(authErr(e),'err'); }
    };

    if($('#fl-clear')) $('#fl-clear').onclick=async()=>{
      const ok=await confirmDialog(`Kosongkan SEMUA tanda kehadiran ${MONTHS[month]} ${year} untuk ${clsLabel(cls)}? Tindakan ini tidak boleh dibatalkan.`);
      if(!ok)return;
      await DB.clearAttendance(kelasId,year,month);
      DB.addLog('Kosongkan kehadiran',`${clsLabel(cls)} · ${MONTHS[month]} ${year}`);
      closeModal(); toast('Semua tanda bulan ini dikosongkan.','info'); renderC8();
    };
  };

  const sahBtn=$('#c8-sah');
  if(sahBtn) sahBtn.onclick=async()=>{
    const ok=await confirmDialog(`Sahkan kehadiran ${MONTHS[month]} ${year} untuk kelas ini? Selepas disahkan, data TIDAK BOLEH diubah lagi (hanya Admin boleh membukanya semula). Pastikan semua hari telah ditanda dengan betul.`);
    if(!ok) return;
    await DB.setSah(kelasId,year,month,{oleh:CURRENT.id,olehNama:CURRENT.nama,tarikh:new Date().toISOString()});
    DB.addLog('Sahkan kehadiran',`${MONTHS[month]} ${year}`); toast('Kehadiran bulan ini telah disahkan & dikunci.','ok');
    renderC8();
  };
  const unsahBtn=$('#c8-unsah');
  if(unsahBtn) unsahBtn.onclick=async()=>{
    const ok=await confirmDialog('Buka semula pengesahan? Guru akan dapat mengubah kehadiran bulan ini semula.');
    if(!ok) return;
    await DB.setSah(kelasId,year,month,null);
    DB.addLog('Buka pengesahan',`${MONTHS[month]} ${year}`); toast('Pengesahan dibuka semula.','info');
    renderC8();
  };
}

async function cycleCell(td){
  if(C8_STATE.locked){toast('Bulan ini telah disahkan — tidak boleh diubah.','err');return;}
  const sid=td.dataset.sid, day=+td.dataset.day;
  const cur=td.classList.contains('present')?'H':td.classList.contains('absent')?'X':'';
  const next={'':'H','H':'X','X':''}[cur];
  // kemas kini paparan segera (optimistik)
  td.classList.remove('present','absent'); td.textContent='';
  if(next==='H'){td.classList.add('present');td.textContent='✓';}
  if(next==='X'){td.classList.add('absent');td.textContent='✕';}
  td.classList.remove('just-marked'); void td.offsetWidth; td.classList.add('just-marked');
  updateRowTotals(sid); recalcFooter();
  showSaving();
  try{
    await DB.saveAttendanceCell(C8_STATE.kelasId,C8_STATE.year,C8_STATE.month,sid,day,next||null);
    showSaved();
  }catch(e){ toast('Gagal simpan: '+e.message,'err'); }
}

/* ---------------------------------------------------------
   HALAMAN: Borang C1 (Fizikal) & C2 (Akademik)
--------------------------------------------------------- */
const BORANG_STATE={jenis:'C1',kelasId:null,year:new Date().getFullYear()};

function bmiVal(b,t){ b=+b; t=+t; if(!b||!t) return null; return +(b/(t*t)).toFixed(1); }
function bmiKlas(v){ if(v==null)return''; if(v<18.5)return'Kurang Berat'; if(v<25)return'Normal'; if(v<30)return'Berlebihan'; return'Obesiti'; }

async function pageBorang(v){
  const classes=await DB.getClasses();
  let allowed = sortCls(seesAllClasses() ? classes : classes.filter(c=>c.id===CURRENT.kelasId||c.guruId===CURRENT.id));
  if(!allowed.length){ v.innerHTML=emptyState('Tiada kelas diperuntukkan kepada anda.'); return; }
  if(!BORANG_STATE.kelasId||!allowed.find(c=>c.id===BORANG_STATE.kelasId)) BORANG_STATE.kelasId=allowed[0].id;

  const clsOpts=allowed.map(c=>`<option value="${c.id}" ${c.id===BORANG_STATE.kelasId?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  const yNow=new Date().getFullYear();
  const yOpts=yearRange().map(y=>`<option ${y===BORANG_STATE.year?'selected':''}>${y}</option>`).join('');

  if(!onPage('borang'))return; // halaman lain sudah dibuka — jangan tindih

  v.innerHTML=`
    <div class="page-head"><h2>Borang C1 / C2</h2><div class="spacer"></div>
      <button class="btn btn-blue" id="printBorang">${IC.print} Cetak / PDF</button></div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Borang</label><select id="b-jenis">
        <option value="C1" ${BORANG_STATE.jenis==='C1'?'selected':''}>C1 — Rekod Fizikal Murid</option>
        <option value="C2" ${BORANG_STATE.jenis==='C2'?'selected':''}>C2 — Rekod Akademik Murid</option></select></div>
      <div class="field"><label>Kelas</label><select id="b-kelas">${clsOpts}</select></div>
      <div class="field"><label>Tahun</label><select id="b-tahun">${yOpts}</select></div>
      <span class="c8-save-tag" id="b-save"></span>
    </div>
    <div id="b-holder"></div>
    <p class="no-print" style="color:var(--muted);font-size:12px;margin-top:10px" id="b-nota"></p>`;

  $('#b-jenis').onchange=e=>{BORANG_STATE.jenis=e.target.value;renderBorang();};
  $('#b-kelas').onchange=e=>{BORANG_STATE.kelasId=e.target.value;renderBorang();};
  $('#b-tahun').onchange=e=>{BORANG_STATE.year=+e.target.value;renderBorang();};
  $('#printBorang').onclick=printBorang;
  renderBorang();
}

async function renderBorang(){
  const holder=$('#b-holder'); if(!holder)return;
  holder.innerHTML=skeleton(6);
  const {jenis,kelasId,year}=BORANG_STATE;
  const students=await rosterStudents(kelasId,year);
  const coll=jenis==='C1'?'fizikal':'akademik';
  const rec=await DB.getForm(coll,kelasId,year);

  if(jenis==='C1'){
    const rows=students.map((s,i)=>{
      const r=rec[s.id]||{};
      const bmiJ=bmiVal(r.jan_b,r.jan_t), bmiN=bmiVal(r.nov_b,r.nov_t);
      const inp=(f,vv,step)=>`<input class="mini" type="number" step="${step}" min="0" value="${vv??''}" data-sid="${s.id}" data-f="${f}">`;
      return `<tr>
        <td class="col-bil">${i+1}</td>
        <td class="name col-nama">${esc(s.nama)}</td>
        <td>${s.tahun}</td>
        <td>${inp('jan_b',r.jan_b,'0.1')}</td><td>${inp('jan_t',r.jan_t,'0.01')}</td>
        <td data-bmi="jan-${s.id}">${bmiJ??''}</td><td class="b-klas" data-klas="jan-${s.id}">${bmiKlas(bmiJ)}</td>
        <td>${inp('nov_b',r.nov_b,'0.1')}</td><td>${inp('nov_t',r.nov_t,'0.01')}</td>
        <td data-bmi="nov-${s.id}">${bmiN??''}</td><td class="b-klas" data-klas="nov-${s.id}">${bmiKlas(bmiN)}</td>
      </tr>`;
    }).join('')||`<tr><td colspan="11" style="padding:18px;color:var(--muted)">Tiada murid RMT aktif.</td></tr>`;
    holder.innerHTML=`
      <div class="c8-scroll"><table class="c8" id="b-table">
        <thead>
          <tr><th class="col-bil" rowspan="2">BIL</th><th class="col-nama" rowspan="2">NAMA MURID</th>
            <th rowspan="2"><span class="vert">TAHUN</span></th>
            <th colspan="4">JANUARI</th><th colspan="4">NOVEMBER</th></tr>
          <tr><th>BERAT<br>(kg)</th><th>TINGGI<br>(m)</th><th>BMI</th><th>KLASIFIKASI</th>
              <th>BERAT<br>(kg)</th><th>TINGGI<br>(m)</th><th>BMI</th><th>KLASIFIKASI</th></tr>
        </thead><tbody>${rows}</tbody></table></div>`;
    $('#b-nota').textContent='BMI dan klasifikasi dikira automatik (berat ÷ tinggi²). Tinggi dalam meter (cth 1.32). Auto simpan.';
  }else{
    const rows=students.map((s,i)=>{
      const r=rec[s.id]||{};
      const tov=r.tov??'', ar=r.ar??'';
      const pres = (tov!==''&&ar!=='') ? (+ar>+tov?'MENINGKAT':(+ar<+tov?'MENURUN':'KEKAL')) : '';
      return `<tr>
        <td class="col-bil">${i+1}</td>
        <td class="name col-nama">${esc(s.nama)}</td>
        <td style="white-space:nowrap">T${s.tahun}</td>
        <td><input class="mini" type="number" step="0.1" min="0" max="100" value="${tov}" data-sid="${s.id}" data-f="tov"></td>
        <td><input class="mini" type="number" step="0.1" min="0" max="100" value="${ar}" data-sid="${s.id}" data-f="ar"></td>
        <td class="b-klas" data-pres="${s.id}">${pres}</td>
      </tr>`;
    }).join('')||`<tr><td colspan="6" style="padding:18px;color:var(--muted)">Tiada murid RMT aktif.</td></tr>`;
    holder.innerHTML=`
      <div style="margin-bottom:10px" class="no-print">
        <button class="btn btn-sm" id="b-auto">⚡ Auto-kira % dari rekod kehadiran (November)</button></div>
      <div class="c8-scroll"><table class="c8" id="b-table">
        <thead>
          <tr><th class="col-bil" rowspan="2">BIL</th><th class="col-nama" rowspan="2">NAMA MURID</th>
            <th rowspan="2">KELAS</th><th colspan="2">PERATUS KEHADIRAN</th>
            <th rowspan="2">PRESTASI<br>(MENINGKAT/MENURUN)</th></tr>
          <tr><th>TOV<br>NOV ${year-1}</th><th>AR<br>NOV ${year}</th></tr>
        </thead><tbody>${rows}</tbody></table></div>`;
    $('#b-nota').textContent='TOV = November tahun sebelum · AR = November tahun semasa. Boleh isi manual atau auto-kira. Auto simpan.';
    $('#b-auto').onclick=async()=>{
      const btn=$('#b-auto'); btn.disabled=true; btn.textContent='Mengira…';
      const [recPrev,recNow]=await Promise.all([
        DB.getAttendance(kelasId,year-1,10), DB.getAttendance(kelasId,year,10)]);
      const pct=(rr,sid)=>{const r=rr[sid]||{};let h=0,x=0;
        Object.values(r).forEach(m=>{if(m==='H')h++;else if(m==='X')x++;});
        return (h+x)? +(h/(h+x)*100).toFixed(1) : null;};
      let n=0;
      for(const st of students){
        const a=pct(recPrev,st.id), b=pct(recNow,st.id);
        if(a!=null){await DB.saveFormCell('akademik',kelasId,year,st.id,'tov',a);n++;}
        if(b!=null){await DB.saveFormCell('akademik',kelasId,year,st.id,'ar',b);n++;}
      }
      toast(n?`${n} nilai dikira & disimpan`:'Tiada rekod kehadiran November dijumpai','info');
      renderBorang();
    };
  }

  // Auto-save setiap input + kemaskini kiraan
  $$('#b-table input.mini').forEach(inp=>{
    inp.onchange=async()=>{
      const sid=inp.dataset.sid, f=inp.dataset.f;
      const val=inp.value===''?null:+inp.value;
      const st=$('#b-save'); if(st)st.textContent='Menyimpan…';
      await DB.saveFormCell(coll,kelasId,year,sid,f,val);
      if(st){st.textContent='✓ Tersimpan'; setTimeout(()=>{if(st)st.textContent='';},1500);}
      if(jenis==='C1'){
        const row=inp.closest('tr');
        const g=p=>{const el=row.querySelector(`input[data-f="${p}"]`);return el?el.value:'';};
        const bj=bmiVal(g('jan_b'),g('jan_t')), bn=bmiVal(g('nov_b'),g('nov_t'));
        row.querySelector(`[data-bmi="jan-${sid}"]`).textContent=bj??'';
        row.querySelector(`[data-klas="jan-${sid}"]`).textContent=bmiKlas(bj);
        row.querySelector(`[data-bmi="nov-${sid}"]`).textContent=bn??'';
        row.querySelector(`[data-klas="nov-${sid}"]`).textContent=bmiKlas(bn);
      }else{
        const row=inp.closest('tr');
        const tov=row.querySelector('input[data-f="tov"]').value;
        const ar=row.querySelector('input[data-f="ar"]').value;
        row.querySelector(`[data-pres="${sid}"]`).textContent=
          (tov!==''&&ar!=='')?(+ar>+tov?'MENINGKAT':(+ar<+tov?'MENURUN':'KEKAL')):'';
      }
    };
  });
}



/* ---------------------------------------------------------
   ROSTER SEJARAH & NAIK KELAS
--------------------------------------------------------- */
// Senarai murid sesebuah kelas untuk tahun tertentu.
// Tahun lepas (sudah diproses naik kelas) → guna snapshot beku; jika tiada → senarai semasa.
/* Keahlian program mengikut tempoh:
   - `mula`  : tarikh murid mula menyertai (kosong = sejak awal)
   - `tamat` : tarikh murid berhenti/berpindah (kosong = masih dalam program)
   Murid hanya muncul dalam borang bulan yang dia benar-benar dalam program. */
function aktifDalamTempoh(st,year,month){
  if(st.statusRMT!=='Aktif') return false;
  const awal = month==null ? new Date(year,0,1)  : new Date(year,month,1);
  const akhir= month==null ? new Date(year,11,31): new Date(year,month+1,0);
  if(st.mula){ const m=new Date(st.mula+'T00:00:00'); if(!isNaN(m)&&m>akhir) return false; }
  if(st.tamat){ const t=new Date(st.tamat+'T00:00:00'); if(!isNaN(t)&&t<awal) return false; }
  return true;
}
function aktifHariIni(st){ const n=new Date(); return aktifDalamTempoh(st,n.getFullYear(),n.getMonth()); }

async function rosterStudents(kelasId,year,month){
  const sesi=APP_CFG.sesi||new Date().getFullYear();
  if(year<sesi){
    const snap=await DB.getRoster(year);
    if(snap&&snap.students){
      return Object.entries(snap.students)
        .map(([id,st])=>({id,...st}))
        .filter(st=>st.kelasId===kelasId&&aktifDalamTempoh(st,year,month))
        .sort((a,b)=>a.nama.localeCompare(b.nama));
    }
  }
  return (await DB.getStudents())
    .filter(s=>s.kelasId===kelasId&&aktifDalamTempoh(s,year,month))
    .sort((a,b)=>a.nama.localeCompare(b.nama));
}

// Proses naik kelas: snapshot sesi semasa → T1-5 naik, T6 tamat → sesi+1
async function prosesNaikKelas(){
  const sesi=APP_CFG.sesi||new Date().getFullYear();
  const [students,classes]=await Promise.all([DB.getStudents(),DB.getClasses()]);

  // 1. Bekukan roster sesi semasa
  const snapStudents={};
  students.forEach(s=>{snapStudents[s.id]={nama:s.nama,mykid:s.mykid||'',jantina:s.jantina,
    tahun:s.tahun,kelasId:s.kelasId||null,statusRMT:s.statusRMT,
    mula:s.mula||'',tamat:s.tamat||''};});
  await DB.saveRoster(sesi,{sesi,tarikh:new Date().toISOString(),
    students:snapStudents,
    classes:sortCls(classes).map(c=>({id:c.id,tahun:c.tahun,nama:c.nama}))});

  // 2. Proses setiap murid
  let naik=0,tamat=0,tiadaKelas=0;
  for(const st of students){
    if(st.statusRMT!=='Aktif') continue;
    if(st.tahun>=6){
      await DB.saveStudent({...st,statusRMT:'Tamat'});
      tamat++;
    }else{
      const curCls=classes.find(c=>c.id===st.kelasId);
      let newKelasId=null;
      if(curCls){
        if(!curCls.tahun){ newKelasId=curCls.id; } // kelas tanpa tahun (Prasekolah/PPKI): kekal
        else{
          const target=classes.find(c=>c.tahun===st.tahun+1&&c.nama===curCls.nama);
          if(target) newKelasId=target.id;
        }
      }
      if(!newKelasId) tiadaKelas++;
      await DB.saveStudent({...st,tahun:st.tahun+1,kelasId:newKelasId});
      naik++;
    }
  }

  // 3. Sesi baharu
  await DB.saveSchool({sesi:sesi+1});
  APP_CFG.sesi=sesi+1;
  return {sesi,naik,tamat,tiadaKelas};
}

/* ---------------------------------------------------------
   HALAMAN: Rumusan Keseluruhan Kehadiran
--------------------------------------------------------- */
const RUM_STATE={jenis:'kelas',year:new Date().getFullYear(),month:new Date().getMonth(),kelasId:null};

// Konteks tahun: kelas + murid aktif (guna snapshot utk sesi lama)
async function yearContext(year){
  const sesi=APP_CFG.sesi||new Date().getFullYear();
  const snap = year<sesi ? await DB.getRoster(year) : null;
  if(snap&&snap.students){
    return {classes:snap.classes||[],
      act:Object.entries(snap.students).map(([id,st])=>({id,...st})).filter(s=>s.statusRMT==='Aktif')};
  }
  const [cls,students]=await Promise.all([DB.getClasses(),DB.getStudents()]);
  return {classes:cls, act:students.filter(s=>s.statusRMT==='Aktif')};
}

async function pageRumusan(v){
  const classes=sortCls(await DB.getClasses());
  if(!RUM_STATE.kelasId&&classes.length)RUM_STATE.kelasId=classes[0].id;
  const moOpts=`<option value="-1" ${RUM_STATE.month===-1?'selected':''}>Setahun (Jan–Dis)</option>`+
    MONTHS.map((m,i)=>`<option value="${i}" ${i===RUM_STATE.month?'selected':''}>${m}</option>`).join('');
  const yOpts=yearRange().map(y=>`<option ${y===RUM_STATE.year?'selected':''}>${y}</option>`).join('');
  const kOpts=classes.map(c=>`<option value="${c.id}" ${c.id===RUM_STATE.kelasId?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  if(!onPage('rumusan'))return; // halaman lain sudah dibuka — jangan tindih
  v.innerHTML=`
    <div class="page-head"><h2>Rumusan &amp; Laporan</h2><div class="spacer"></div>
      <button class="btn btn-blue" id="printRum">${IC.print} Cetak / PDF</button></div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Jenis laporan</label><select id="r-jenis">
        <option value="kelas" ${RUM_STATE.jenis==='kelas'?'selected':''}>Rumusan ikut Kelas</option>
        <option value="murid" ${RUM_STATE.jenis==='murid'?'selected':''}>Laporan Tahunan per Murid</option>
        <option value="jantina" ${RUM_STATE.jenis==='jantina'?'selected':''}>Statistik Jantina &amp; Darjah</option>
        <option value="status" ${RUM_STATE.jenis==='status'?'selected':''}>Status Pengesahan Bulanan</option>
      </select></div>
      <div class="field" id="rf-bulan"><label>Tempoh</label><select id="r-bulan">${moOpts}</select></div>
      <div class="field" id="rf-kelas"><label>Kelas</label><select id="r-kelas">${kOpts}</select></div>
      <div class="field"><label>Tahun</label><select id="r-tahun">${yOpts}</select></div>
    </div>
    <div id="r-holder"></div>
    <p class="no-print" style="color:var(--muted);font-size:12px;margin-top:10px" id="r-nota"></p>`;
  const sync=()=>{
    $('#rf-bulan').style.display=(RUM_STATE.jenis==='kelas'||RUM_STATE.jenis==='jantina')?'':'none';
    $('#rf-kelas').style.display=RUM_STATE.jenis==='murid'?'':'none';
  };
  $('#r-jenis').onchange=e=>{RUM_STATE.jenis=e.target.value;sync();renderRumusan();};
  $('#r-bulan').onchange=e=>{RUM_STATE.month=+e.target.value;renderRumusan();};
  $('#r-kelas').onchange=e=>{RUM_STATE.kelasId=e.target.value;renderRumusan();};
  $('#r-tahun').onchange=e=>{RUM_STATE.year=+e.target.value;renderRumusan();};
  $('#printRum').onclick=printRumusan;
  sync(); renderRumusan();
}

/* ---- Jenis 1: Rumusan ikut kelas ---- */
async function computeRumusan(){
  const {year,month}=RUM_STATE;
  const ctx=await yearContext(year);
  const list=sortCls(ctx.classes);
  const monthsToScan = month===-1 ? [...Array(12).keys()] : [month];
  const rows=[]; let T={murid:0,h:0,x:0};
  for(const c of list){
    const cs=ctx.act.filter(s=>s.kelasId===c.id);
    let h=0,x=0;
    const recs=await Promise.all(monthsToScan.map(m=>DB.getAttendance(c.id,year,m)));
    for(const rec of recs){
      for(const st of cs){ const r=rec[st.id]||{};
        Object.values(r).forEach(mk=>{ if(mk==='H')h++; else if(mk==='X')x++; }); }
    }
    const tot=h+x;
    rows.push({label:clsLabel(c),murid:cs.length,h,x,pct:tot?+(h/tot*100).toFixed(1):null});
    T.murid+=cs.length; T.h+=h; T.x+=x;
  }
  const tA=T.h+T.x;
  return {rows,total:{...T,pct:tA?+(T.h/tA*100).toFixed(1):null},
    label: month===-1?`TAHUN ${year} (JAN–DIS)`:`${MONTHS[month].toUpperCase()} ${year}`};
}
function rumTableHTML(data){
  const tr=data.rows.map((r,i)=>`<tr><td>${i+1}</td>
    <td style="text-align:left;padding-left:8px">${esc(r.label)}</td>
    <td>${r.murid}</td><td>${r.h}</td><td>${r.x}</td>
    <td><b>${r.pct==null?'—':r.pct+'%'}</b></td></tr>`).join('')
    ||'<tr><td colspan="6" style="padding:16px">Tiada data.</td></tr>';
  const t=data.total;
  return `<table class="c8" id="r-table"><thead><tr>
    <th>BIL</th><th>KELAS</th><th>BIL.<br>MURID</th><th>JUMLAH<br>HADIR</th>
    <th>JUMLAH<br>TIDAK HADIR</th><th>%<br>KEHADIRAN</th></tr></thead>
    <tbody>${tr}</tbody>
    <tfoot><tr><td colspan="2">JUMLAH KESELURUHAN</td>
      <td style="text-align:center">${t.murid}</td><td style="text-align:center">${t.h}</td>
      <td style="text-align:center">${t.x}</td><td style="text-align:center">${t.pct==null?'—':t.pct+'%'}</td></tr></tfoot></table>`;
}

/* ---- Jenis 2: Laporan tahunan per murid ---- */
async function computeMurid(){
  const {kelasId,year}=RUM_STATE;
  const roster=await rosterStudents(kelasId,year);
  const perMonth=[];
  for(let m=0;m<12;m++) perMonth.push(await DB.getAttendance(kelasId,year,m));
  const rows=roster.map(st=>{
    const mh=[],mx=[]; let H=0,X=0;
    for(let m=0;m<12;m++){
      const r=perMonth[m][st.id]||{}; let h=0,x=0;
      Object.values(r).forEach(k=>{if(k==='H')h++;else if(k==='X')x++;});
      mh.push(h); mx.push(x); H+=h; X+=x;
    }
    return {nama:st.nama,mh,mx,H,X,pct:(H+X)?+(H/(H+X)*100).toFixed(1):null};
  });
  return rows;
}
function muridTableHTML(rows){
  const head=MONTHS.map(m=>`<th>${m.slice(0,3).toUpperCase()}</th>`).join('');
  const tr=rows.map((r,i)=>`<tr><td class="col-bil">${i+1}</td>
    <td class="name col-nama">${esc(r.nama)}</td>
    ${r.mh.map((h,m)=>`<td>${(h||r.mx[m])?h:''}</td>`).join('')}
    <td><b>${r.H}</b></td><td>${r.X}</td>
    <td><b>${r.pct==null?'—':r.pct+'%'}</b></td></tr>`).join('')
    ||'<tr><td colspan="16" style="padding:16px">Tiada murid.</td></tr>';
  return `<table class="c8" id="r-table"><thead><tr>
    <th class="col-bil">BIL</th><th class="col-nama">NAMA MURID</th>${head}
    <th>JUM<br>HADIR</th><th>JUM<br>T.HADIR</th><th>%</th></tr></thead>
    <tbody>${tr}</tbody></table>`;
}

/* ---- Jenis 3: Statistik jantina & darjah ---- */
async function computeJantina(){
  const {year,month}=RUM_STATE;
  const ctx=await yearContext(year);
  const monthsToScan = month===-1 ? [...Array(12).keys()] : [month];
  const tally={}; // sid -> {h,x}
  for(const c of ctx.classes){
    for(const m of monthsToScan){
      const rec=await DB.getAttendance(c.id,year,m);
      Object.entries(rec).forEach(([sid,r])=>{
        tally[sid]=tally[sid]||{h:0,x:0};
        Object.values(r).forEach(k=>{if(k==='H')tally[sid].h++;else if(k==='X')tally[sid].x++;});
      });
    }
  }
  const rows=[]; const T={bl:0,bp:0,hl:0,xl:0,hp:0,xp:0};
  for(let thn=1;thn<=6;thn++){
    const g={bl:0,bp:0,hl:0,xl:0,hp:0,xp:0};
    ctx.act.filter(st=>st.tahun===thn).forEach(st=>{
      const t=tally[st.id]||{h:0,x:0};
      if(st.jantina==='P'){g.bp++;g.hp+=t.h;g.xp+=t.x;}
      else{g.bl++;g.hl+=t.h;g.xl+=t.x;}
    });
    Object.keys(T).forEach(k=>T[k]+=g[k]);
    const pct=(h,x)=>(h+x)?+(h/(h+x)*100).toFixed(1):null;
    rows.push({thn,...g,pl:pct(g.hl,g.xl),pp:pct(g.hp,g.xp),pj:pct(g.hl+g.hp,g.xl+g.xp)});
  }
  const pct=(h,x)=>(h+x)?+(h/(h+x)*100).toFixed(1):null;
  return {rows,total:{...T,pl:pct(T.hl,T.xl),pp:pct(T.hp,T.xp),pj:pct(T.hl+T.hp,T.xl+T.xp)},
    label: month===-1?`TAHUN ${year} (JAN–DIS)`:`${MONTHS[month].toUpperCase()} ${year}`};
}
function jantinaTableHTML(d){
  const f=v=>v==null?'—':v+'%';
  const tr=d.rows.map(r=>`<tr><td><b>TAHUN ${r.thn}</b></td>
    <td>${r.bl}</td><td>${r.bp}</td><td>${r.bl+r.bp}</td>
    <td>${f(r.pl)}</td><td>${f(r.pp)}</td><td><b>${f(r.pj)}</b></td></tr>`).join('');
  const t=d.total;
  return `<table class="c8" id="r-table"><thead>
    <tr><th rowspan="2">DARJAH</th><th colspan="3">BILANGAN MURID RMT</th><th colspan="3">% KEHADIRAN</th></tr>
    <tr><th>LELAKI</th><th>PEREMPUAN</th><th>JUMLAH</th><th>LELAKI</th><th>PEREMPUAN</th><th>JUMLAH</th></tr></thead>
    <tbody>${tr}</tbody>
    <tfoot><tr><td>JUMLAH</td><td>${t.bl}</td><td>${t.bp}</td><td>${t.bl+t.bp}</td>
      <td>${f(t.pl)}</td><td>${f(t.pp)}</td><td>${f(t.pj)}</td></tr></tfoot></table>`;
}

/* ---- Jenis 4: Status pengesahan bulanan ---- */
async function computeStatus(){
  const {year}=RUM_STATE;
  const classes=sortCls(await DB.getClasses());
  const rows=[];
  for(const c of classes){
    const docs=await Promise.all([...Array(12).keys()].map(m=>DB.getAttDoc(c.id,year,m)));
    const cells=docs.map(doc=>{
      const ada=Object.keys(doc.records).length>0;
      return doc.sah?'sah':(ada?'belum':'kosong');});
    rows.push({label:clsLabel(c),cells});
  }
  return rows;
}
function statusTableHTML(rows){
  const head=MONTHS.map(m=>`<th>${m.slice(0,3).toUpperCase()}</th>`).join('');
  const sym={sah:'<span style="color:var(--ok);font-weight:800">✔</span>',
             belum:'<span style="color:var(--warn);font-weight:800">⏳</span>',kosong:''};
  const tr=rows.map((r,i)=>`<tr><td>${i+1}</td>
    <td style="text-align:left;padding-left:8px;white-space:nowrap">${esc(r.label)}</td>
    ${r.cells.map(c=>`<td>${sym[c]}</td>`).join('')}</tr>`).join('')
    ||'<tr><td colspan="14" style="padding:16px">Belum ada kelas.</td></tr>';
  return `<table class="c8" id="r-table"><thead><tr><th>BIL</th><th>KELAS</th>${head}</tr></thead>
    <tbody>${tr}</tbody></table>
    <p style="font-size:12px;color:var(--muted);margin-top:8px">✔ Disahkan guru kelas &nbsp;·&nbsp; ⏳ Ada rekod, belum disahkan &nbsp;·&nbsp; (kosong) Tiada rekod</p>`;
}

async function renderRumusan(){
  const holder=$('#r-holder'); if(!holder)return;
  holder.innerHTML=skeleton(6);
  const j=RUM_STATE.jenis; const nota=$('#r-nota');
  if(j==='kelas'){ holder.innerHTML=`<div class="c8-scroll">${rumTableHTML(await computeRumusan())}</div>`;
    if(nota)nota.textContent='% dikira daripada sel yang ditanda dalam C8 (hadir ÷ (hadir + tidak hadir)).'; }
  else if(j==='murid'){ holder.innerHTML=`<div class="c8-scroll">${muridTableHTML(await computeMurid())}</div>`;
    if(nota)nota.textContent='Nombor dalam setiap bulan = jumlah hari HADIR murid pada bulan itu.'; }
  else if(j==='jantina'){ holder.innerHTML=`<div class="c8-scroll">${jantinaTableHTML(await computeJantina())}</div>`;
    if(nota)nota.textContent='Pecahan bilangan murid RMT dan % kehadiran mengikut jantina dan darjah.'; }
  else{ holder.innerHTML=`<div class="c8-scroll">${statusTableHTML(await computeStatus())}</div>`;
    if(nota)nota.textContent='Semakan pantas PK HEM/Guru Besar: kelas mana yang belum melengkap/mengesahkan kehadiran.'; }
}

/* ---- Cetakan generik laporan rasmi ---- */
async function printReport(tajuk,label,bodyHTML,orient,signL,signR){
  const school=await DB.getSchool();
  const html=`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><title>${tajuk}</title><style>
    @page{size:A4 ${orient};margin:12mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#000}
    .top{display:flex;align-items:center;gap:12px}
    .top img{height:52px}
    .top .t{flex:1;text-align:center}
    .t .t1{font-size:12px;font-weight:bold}.t .t2{font-size:15px;font-weight:bold;letter-spacing:1px;margin-top:2px}
    .t .t3{font-size:11px;margin-top:2px}
    table{border-collapse:collapse;width:100%;font-size:10px;margin-top:12px}
    th,td{border:1px solid #000;text-align:center;padding:4px 3px}
    thead th{background:#d9d9d9}
    td.name{text-align:left;padding-left:6px;white-space:nowrap}
    tfoot td{font-weight:bold;background:#f0f0f0}
    .sign{display:flex;justify-content:space-between;margin-top:30px;font-size:11px;page-break-inside:avoid}
    .sign .s{width:40%;text-align:center}
    .sign .line{border-top:1px dotted #000;margin-top:42px;padding-top:4px;font-weight:bold}
  </style></head><body>
    <div class="top">${school.logo?`<img src="${school.logo}">`:''}
      <div class="t"><div class="t1">${esc((school.nama||'').toUpperCase())}</div>
        <div class="t2">${tajuk}</div><div class="t3">${label}</div></div>
      ${school.logo?'<div style="width:52px"></div>':''}</div>
    ${bodyHTML.replace('class="c8" id="r-table"','')}
    <div class="sign">
      <div class="s">DISEDIAKAN OLEH<div class="line">${esc(signL||'……………………………………')}</div></div>
      <div class="s">DISAHKAN OLEH<div class="line">${esc(signR||'……………………………………')}</div></div>
    </div></body></html>`;
  const fr=document.createElement('iframe');
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr); fr.srcdoc=html;
  fr.onload=()=>{setTimeout(()=>{try{fr.contentWindow.focus();fr.contentWindow.print();}
    catch(e){toast('Gagal cetak: '+e.message,'err');} setTimeout(()=>fr.remove(),3000);},200);};
}

async function printRumusan(){
  const school=await DB.getSchool();
  const peny=school.penyelaras&&school.penyelaras!=='—'?school.penyelaras+'<br>PENYELARAS RMT':'……………………………………<br>PENYELARAS RMT';
  const gb=school.gb&&school.gb!=='—'?school.gb+'<br>GURU BESAR':'……………………………………<br>GURU BESAR';
  const j=RUM_STATE.jenis;
  if(j==='kelas'){ const d=await computeRumusan();
    await printReport('RUMUSAN KEHADIRAN MURID RMT',d.label,rumTableHTML(d),'portrait',peny,gb); }
  else if(j==='murid'){ const classes=await DB.getClasses();
    const c=classes.find(x=>x.id===RUM_STATE.kelasId)||{};
    await printReport('LAPORAN KEHADIRAN TAHUNAN MURID RMT',
      `${esc(clsLabel(c).toUpperCase())} · SESI ${RUM_STATE.year}`,
      muridTableHTML(await computeMurid()),'landscape',peny,gb); }
  else if(j==='jantina'){ const d=await computeJantina();
    await printReport('STATISTIK KEHADIRAN RMT MENGIKUT JANTINA & DARJAH',d.label,jantinaTableHTML(d),'portrait',peny,gb); }
  else{ await printReport('STATUS PENGESAHAN KEHADIRAN BULANAN',
      `SESI ${RUM_STATE.year}`,statusTableHTML(await computeStatus()),'landscape',peny,gb); }
}

/* Cetakan rasmi C1/C2 — A4 potret, gaya borang KPM */
async function printBorang(){
  const src=$('#b-table'); if(!src){toast('Borang belum dipaparkan.','err');return;}
  const {jenis,kelasId,year}=BORANG_STATE;
  const [school,classes]=await Promise.all([DB.getSchool(),DB.getClasses()]);
  const cls=classes.find(c=>c.id===kelasId)||{};
  const clone=src.cloneNode(true);
  // tukar input kepada teks
  clone.querySelectorAll('input').forEach(inp=>{
    const td=inp.parentElement; td.textContent=inp.value||''; });
  const tajuk=jenis==='C1'?'REKOD FIZIKAL MURID':'REKOD AKADEMIK MURID';
  const html=`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><title>Borang ${jenis} — ${year}</title><style>
    @page{size:A4 portrait;margin:10mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#000}
    .top{display:flex;align-items:flex-start}
    .top img{height:52px}
    .top .tag{margin-left:auto;font-size:11px;font-weight:bold;border:1.5px solid #000;padding:3px 10px}
    h1{text-align:center;font-size:16px;border:2px solid #000;display:table;margin:8px auto 12px;padding:5px 18px;letter-spacing:1px}
    .meta{font-size:11px;margin-bottom:10px;line-height:1.7}
    table{border-collapse:collapse;width:100%;font-size:9.5px}
    th,td{border:1px solid #000;text-align:center;padding:3px 2px}
    thead th{background:#F8CBAD;font-weight:bold}
    td.name{text-align:left;padding:3px 5px}
    .vert{writing-mode:vertical-rl;transform:rotate(180deg)}
    .b-klas{font-size:8.5px}
    .sign{display:flex;justify-content:space-between;margin-top:28px;font-size:11px;page-break-inside:avoid}
    .sign .s{width:40%;text-align:center}
    .sign .line{border-top:1px dotted #000;margin-top:42px;padding-top:4px;font-weight:bold}
  </style></head><body>
    <div class="top">${school.logo?`<img src="${school.logo}">`:''}<div class="tag">BORANG ${jenis}</div></div>
    <h1>${tajuk}</h1>
    <div class="meta">
      <b>NAMA SEKOLAH</b> : ${esc(school.nama||'')}<br>
      <b>KOD SEKOLAH</b> &nbsp;&nbsp;: ${esc(school.kod||'')}<br>
      <b>DAERAH</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(school.daerah||'')} &nbsp;&nbsp;&nbsp; <b>NEGERI:</b> ${esc(school.negeri||'')}<br>
      <b>KELAS</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${esc(clsLabel(cls).toUpperCase())} &nbsp;&nbsp;&nbsp; <b>TAHUN:</b> ${year}
    </div>
    ${clone.outerHTML}
    <div class="sign">
      <div class="s">DISEDIAKAN OLEH<div class="line">${esc(school.penyelaras&&school.penyelaras!=='—'?school.penyelaras:'……………………………………')}<br>PENYELARAS RMT</div></div>
      <div class="s">DISAHKAN OLEH<div class="line">${esc(school.pkhem&&school.pkhem!=='—'?school.pkhem:'……………………………………')}<br>GPK HEM</div></div>
    </div>
  </body></html>`;
  const fr=document.createElement('iframe');
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr); fr.srcdoc=html;
  fr.onload=()=>{ setTimeout(()=>{ try{fr.contentWindow.focus();fr.contentWindow.print();}
    catch(e){toast('Gagal cetak: '+e.message,'err');} setTimeout(()=>fr.remove(),3000); },200); };
}



/* ---------------------------------------------------------
   HALAMAN: Imbas QR Kehadiran
--------------------------------------------------------- */
const SCAN={stream:null,raf:0,active:false,count:0,cool:{},students:null,attCache:{},sahCache:{}};

function stopScan(){
  SCAN.active=false; SCAN.wedge=false; clearTimeout(SCAN.wedgeT);
  if(SCAN.raf)cancelAnimationFrame(SCAN.raf);
  if(SCAN.stream){SCAN.stream.getTracks().forEach(t=>t.stop());SCAN.stream=null;}
  const b=$('#sc-start'); if(b){b.textContent='📷 Mula Imbas';b.classList.remove('btn-danger');}
}

function beepOK(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);o.frequency.value=1200;g.gain.value=.15;
    o.start();o.stop(ctx.currentTime+.12);
  }catch(e){}
  try{navigator.vibrate&&navigator.vibrate(80);}catch(e){}
}

async function pageImbas(v){
  const classes=sortCls(await DB.getClasses());
  const kOpts=classes.map(c=>`<option value="${c.id}">${esc(clsLabel(c))}</option>`).join('');
  if(!onPage('imbas'))return;
  v.innerHTML=`
    <div class="page-head"><h2>Imbas QR Kehadiran</h2></div>

    <div class="card" style="max-width:560px">
      <h3 style="margin:0 0 4px">Pengimbas</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Imbas kad QR murid — kehadiran <b>hari ini</b> terus ditanda ✓ dalam Borang C8.
        Murid yang tidak diimbas kekal kosong (guru tanda ✕ dalam C8 seperti biasa).</p>
      <div class="scan-wrap"><video id="sc-video" playsinline muted></video>
        <div class="scan-frame"></div></div>
      <canvas id="sc-canvas" style="display:none"></canvas>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
        <button class="btn btn-primary" id="sc-start">📷 Mula Imbas</button>
        <span style="align-self:center;color:var(--muted);font-size:13px">Sesi ini: <b id="sc-count">0</b> murid</span>
      </div>
      <div id="sc-status" style="margin-top:12px"></div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:16px;
                  padding-top:14px;border-top:1px solid var(--line)">
        <button class="btn btn-sm" id="sc-wedge">🔌 Mod Pengimbas Luaran</button>
        <span style="color:var(--muted);font-size:12px" id="sc-wedge-note">Untuk pengimbas USB/Bluetooth (jenis papan kekunci)</span>
      </div>
      <div class="field" style="margin-top:12px"><label>Cari nama murid, atau imbas dengan pengimbas luaran</label>
        <input id="sc-manual" placeholder="Taip nama murid… (min. 2 huruf)" autocomplete="off">
        <div id="sc-results"></div></div>
      <div id="sc-list" style="margin-top:8px"></div>
    </div>

    <div class="card" style="max-width:560px;margin-top:18px">
      <h3 style="margin:0 0 4px">Cetak Kad QR Murid</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Cetak kad QR untuk setiap murid (8 kad sehalaman A4). Laminasi & edarkan —
        murid tunjuk kad semasa RMT.</p>
      <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
        <div class="field" style="margin:0;min-width:200px"><label>Kelas</label>
          <select id="qc-kelas">${kOpts}</select></div>
        <button class="btn btn-blue" id="qc-print">${IC.print} Cetak Kad QR</button>
      </div>
    </div>`;

  SCAN.count=0; SCAN.cool={}; SCAN.students=null; SCAN.attCache={}; SCAN.sahCache={};
  $('#sc-start').onclick=()=>{ SCAN.active?stopScan():startScan(); };
  // Hantar kandungan kod ke pemproses, kemudian sedia untuk imbasan seterusnya
  const hantarKod=()=>{
    const el=$('#sc-manual'); if(!el)return;
    const v=el.value.trim(); if(!v)return;
    clearTimeout(SCAN.wedgeT);
    $('#sc-results').innerHTML=''; el.value='';
    handleScanText(v);
    if(SCAN.wedge) setTimeout(()=>{try{el.focus();}catch(e){}},60);
  };
  // Pengimbas USB "menaip" laju dan biasanya menghantar Enter di hujung
  $('#sc-manual').addEventListener('keydown',e=>{
    if(e.key==='Enter'){ e.preventDefault(); hantarKod(); }
  });

  $('#sc-manual').oninput=async e=>{
    const q=e.target.value.trim().toLowerCase();
    const box=$('#sc-results'); if(!box)return;
    if(q.length<2){box.innerHTML='';return;}
    // Kod QR: tunggu taipan pengimbas selesai (jeda 140ms) sebelum diproses,
    // supaya "RMT:" tidak dihantar sebelum ID lengkap ditaip.
    if(q.startsWith('rmt:')){
      box.innerHTML='';
      clearTimeout(SCAN.wedgeT);
      if(q.length>4) SCAN.wedgeT=setTimeout(hantarKod,140);
      return;
    }
    if(!SCAN.students) SCAN.students=await DB.getStudents();
    const classes=SCAN.classes||(SCAN.classes=await DB.getClasses());
    const match=SCAN.students
      .filter(st=>aktifHariIni(st)&&st.nama.toLowerCase().includes(q))
      .slice(0,8);
    box.innerHTML=match.length?match.map(st=>{
      const c=classes.find(x=>x.id===st.kelasId);
      return `<div class="sc-hit" data-sid="${st.id}"><b>${esc(st.nama)}</b><span>${esc(clsLabel(c))}</span></div>`;
    }).join(''):'<div class="sc-hit" style="color:var(--muted);cursor:default">Tiada murid padanan.</div>';
    $$('#sc-results .sc-hit[data-sid]').forEach(el=>el.onclick=()=>{
      const st=SCAN.students.find(x=>x.id===el.dataset.sid);
      $('#sc-manual').value=''; box.innerHTML='';
      if(st) markStudent(st);
    });
  };
  // Mod pengimbas luaran: kekalkan fokus pada ruang input supaya setiap
  // imbasan terus masuk tanpa guru perlu ketik ruang itu semula.
  $('#sc-wedge').onclick=()=>{
    SCAN.wedge=!SCAN.wedge;
    const b=$('#sc-wedge'), n=$('#sc-wedge-note');
    if(SCAN.wedge){
      b.classList.add('btn-primary'); b.textContent='🔌 Mod Pengimbas AKTIF — ketik untuk henti';
      n.textContent='Sedia menerima imbasan. Jangan ketik tempat lain.';
      try{$('#sc-manual').focus();}catch(e){}
    }else{
      b.classList.remove('btn-primary'); b.textContent='🔌 Mod Pengimbas Luaran';
      n.textContent='Untuk pengimbas USB/Bluetooth (jenis papan kekunci)';
    }
  };
  $('#qc-print').onclick=()=>printQRCards($('#qc-kelas').value);
}

function scanStatus(html,type){
  const el=$('#sc-status'); if(!el)return;
  el.innerHTML=`<div class="sah-banner ${type==='ok'?'open flash':''}" style="${type==='err'?'background:var(--danger-soft);border-color:var(--danger)':''}">${html}</div>`;
}

async function startScan(){
  const video=$('#sc-video');
  try{
    SCAN.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
  }catch(e){
    scanStatus('Kamera tidak dapat diakses: '+esc(e.message)+'. Guna ruang taip ID di bawah.','err'); return;
  }
  video.srcObject=SCAN.stream; await video.play();
  SCAN.active=true;
  const b=$('#sc-start'); b.textContent='⏹ Henti'; b.classList.add('btn-danger');
  scanStatus('Kamera aktif — halakan ke kad QR murid.','');

  let detector=null;
  if('BarcodeDetector' in window){
    try{ detector=new window.BarcodeDetector({formats:['qr_code']}); }catch(e){}
  }
  const canvas=$('#sc-canvas'), ctx=canvas.getContext('2d');
  const loop=async()=>{
    if(!SCAN.active)return;
    try{
      if(detector){
        const codes=await detector.detect(video);
        if(codes.length) handleScanText(codes[0].rawValue);
      }else if(typeof jsQR!=='undefined' && video.videoWidth){
        canvas.width=video.videoWidth; canvas.height=video.videoHeight;
        ctx.drawImage(video,0,0);
        const img=ctx.getImageData(0,0,canvas.width,canvas.height);
        const code=jsQR(img.data,img.width,img.height,{inversionAttempts:'dontInvert'});
        if(code&&code.data) handleScanText(code.data);
      }
    }catch(e){}
    SCAN.raf=requestAnimationFrame(loop);
  };
  loop();
}

async function handleScanText(raw){
  const now=Date.now();
  if(SCAN.cool[raw] && now-SCAN.cool[raw]<3000) return; // elak imbasan berganda
  SCAN.cool[raw]=now;

  // Buang awalan "RMT" + pemisah. Sesetengah pengimbas menaip ':' sebagai ';' atau
  // aksara lain bergantung susun atur papan kekunci — jadi terima apa-apa pemisah.
  let sid=String(raw).trim().replace(/^RMT[^A-Za-z0-9]?/i,'');
  if(!SCAN.students) SCAN.students=await DB.getStudents();
  const st=SCAN.students.find(x=>x.id===sid);
  if(!st){ scanStatus('❌ QR tidak dikenali sebagai murid.','err'); return; }
  await markStudent(st);
}

async function markStudent(st){
  if(st.statusRMT!=='Aktif'){ scanStatus(`❌ ${esc(st.nama)} — status ${esc(st.statusRMT)}, bukan murid RMT aktif.`,'err'); return; }
  if(!aktifHariIni(st)){
    const sebab = st.mula && new Date(st.mula+'T00:00:00')>new Date()
      ? `belum bermula dalam program (mula ${st.mula})`
      : `sudah tamat/berpindah (tamat ${st.tamat})`;
    scanStatus(`❌ ${esc(st.nama)} — ${esc(sebab)}.`,'err'); return;
  }
  if(!st.kelasId){ scanStatus(`❌ ${esc(st.nama)} tiada kelas. Tetapkan kelas di Maklumat Murid.`,'err'); return; }

  const t=new Date(), y=t.getFullYear(), m=t.getMonth(), d=t.getDate();
  if(isWeekend(y,m,d)||isHoliday(y,m,d)){
    scanStatus('❌ Hari ini bukan hari persekolahan (cuti). Imbasan tidak direkod.','err'); return;
  }
  // kunci pengesahan
  const sahKey=st.kelasId+'_'+y+'_'+m;
  if(!(sahKey in SCAN.sahCache)) SCAN.sahCache[sahKey]=await DB.getSah(st.kelasId,y,m);
  if(SCAN.sahCache[sahKey]){ scanStatus('❌ Kehadiran bulan ini telah DISAHKAN & dikunci untuk kelas '+esc(st.nama)+'.','err'); return; }
  // duplikat hari ini
  if(!(sahKey in SCAN.attCache)) SCAN.attCache[sahKey]=await DB.getAttendance(st.kelasId,y,m);
  const sudah=SCAN.attCache[sahKey][st.id]?.[d];
  if(sudah==='H'){ scanStatus(`ℹ️ ${esc(st.nama)} — sudah direkod hadir hari ini.`,''); return; }

  await DB.saveAttendanceCell(st.kelasId,y,m,st.id,d,'H');
  SCAN.attCache[sahKey][st.id]=SCAN.attCache[sahKey][st.id]||{};
  SCAN.attCache[sahKey][st.id][d]='H';
  SCAN.count++; const c=$('#sc-count'); if(c)c.textContent=SCAN.count;
  const cls=(await DB.getClasses()).find(x=>x.id===st.kelasId);
  beepOK();
  scanStatus(`✅ <b>${esc(st.nama)}</b> — ${esc(clsLabel(cls))} · HADIR ${d} ${MONTHS[m]}`,'ok');
  const list=$('#sc-list');
  if(list) list.insertAdjacentHTML('afterbegin',
    `<div class="holi-row"><span class="dt">${t.toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'})}</span><span class="nm">${esc(st.nama)}</span><span style="color:var(--ok);font-weight:800">✓</span></div>`);
  DB.addLog('Imbas QR hadir',st.nama);
}

/* Cetak kad QR — 8 kad sehalaman A4 */
async function printQRCards(kelasId){
  if(typeof qrcode==='undefined'){ toast('Pustaka QR belum dimuat. Semak sambungan internet & muat semula.','err'); return; }
  const [students,classes,school]=await Promise.all([DB.getStudents(),DB.getClasses(),DB.getSchool()]);
  const cls=classes.find(c=>c.id===kelasId)||{};
  const roster=students.filter(s=>s.kelasId===kelasId&&aktifHariIni(s))
    .sort((a,b)=>a.nama.localeCompare(b.nama));
  if(!roster.length){ toast('Tiada murid RMT aktif dalam kelas ini.','err'); return; }
  const cards=roster.map(st=>{
    const q=qrcode(0,'M'); q.addData('RMT:'+st.id); q.make();
    return `<div class="kad">
      <div class="sek">${esc(school.nama||'')}</div>
      ${q.createSvgTag({cellSize:3,margin:0,scalable:true})}
      <div class="nm">${esc(st.nama)}</div>
      <div class="kl">${esc(clsLabel(cls))} · KAD RMT</div>
    </div>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><title>Kad QR — ${esc(clsLabel(cls))}</title><style>
    @page{size:A4 portrait;margin:8mm}
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;margin:0;display:flex;flex-wrap:wrap;align-content:flex-start}
    .kad{width:50%;height:70mm;border:1px dashed #999;padding:5mm;display:flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center;page-break-inside:avoid}
    .kad svg{width:34mm;height:34mm}
    .sek{font-size:8px;font-weight:bold;margin-bottom:2mm;text-transform:uppercase}
    .nm{font-size:11px;font-weight:bold;margin-top:2mm}
    .kl{font-size:9px;color:#333;margin-top:1mm}
  </style></head><body>${cards}</body></html>`;
  const fr=document.createElement('iframe');
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr); fr.srcdoc=html;
  fr.onload=()=>{setTimeout(()=>{try{fr.contentWindow.focus();fr.contentWindow.print();}
    catch(e){toast('Gagal cetak: '+e.message,'err');} setTimeout(()=>fr.remove(),4000);},250);};
  DB.addLog('Cetak kad QR',clsLabel(cls)+' ('+roster.length+' murid)');
}

/* Cetak pukal: borang C8 SEMUA kelas utk bulan/tahun semasa, satu kelas satu halaman */
async function c8SectionHTML(school,users,cls,year,month,program='RMT'){
  const roster=await rosterStudents(cls.id,year,month);
  const rec=await DB.getAttendance(cls.id,year,month);
  const pm=month===0?11:month-1, py=month===0?year-1:year;
  const recPrev=await DB.getAttendance(cls.id,py,pm);
  const sah=await DB.getSah(cls.id,year,month);
  const guru=users.find(u=>u.id===cls.guruId);
  const nDays=daysInMonth(year,month);
  const kini=new Date(); const hariIni=(kini.getFullYear()===year&&kini.getMonth()===month)?kini.getDate():0;
  const dayCells=[];
  for(let d2=1;d2<=nDays;d2++)dayCells.push({d:d2,off:isWeekend(year,month,d2)||isHoliday(year,month,d2)});
  const dayTh=dayCells.map(c=>`<th class="${c.off?'we':''}">${c.d}</th>`).join('');
  let body=''; const footH={},footX={};
  roster.forEach((st,i)=>{
    const sr=rec[st.id]||{}; let h=0,x=0;
    const cells=dayCells.map(c=>{
      const mk=sr[c.d]; let sym='';
      if(mk==='H'){sym='/';h++;footH[c.d]=(footH[c.d]||0)+1;}
      else if(mk==='X'){sym='X';x++;footX[c.d]=(footX[c.d]||0)+1;}
      return `<td class="${c.off?'we':''}">${sym}</td>`;}).join('');
    const prev=recPrev[st.id]||{}; let xl=0; Object.values(prev).forEach(k=>{if(k==='X')xl++;});
    body+=`<tr><td>${i+1}</td><td class="name">${esc(st.nama)}</td><td>${st.tahun}</td><td>${st.jantina}</td>
      ${cells}<td><b>${h}</b></td><td>${x}</td><td>${xl}</td><td>${x+xl}</td></tr>`;
  });
  if(!roster.length)body=`<tr><td colspan="${8+nDays}" style="padding:12px">Tiada murid RMT aktif.</td></tr>`;
  const foot=(obj,lbl)=>`<tr><td colspan="2" style="text-align:left;font-weight:bold">${lbl}</td><td colspan="2"></td>
    ${dayCells.map(c=>`<td class="${c.off?'we':''}">${obj?(obj[c.d]||''):(c.off?'':roster.length)}</td>`).join('')}
    <td colspan="4"></td></tr>`;
  return `<div class="sec">
    <div class="hd">${school.logo?`<img src="${school.logo}">`:''}
      <div class="mid"><div class="t1">${esc((school.nama||'').toUpperCase())}</div>
        <div class="t2">REKOD KEHADIRAN MURID ${program}</div></div>
      <div class="tag">BORANG C8</div></div>
    <div class="info"><div><b>BULAN:</b> ${MONTHS[month].toUpperCase()} ${year}</div>
      <div><b>KELAS:</b> ${esc(clsLabel(cls).toUpperCase())}</div>
      <div><b>GURU KELAS:</b> ${esc(guru?guru.nama.toUpperCase():'—')}</div>
      ${sah?`<div><b>DISAHKAN:</b> ${esc(sah.olehNama)} · ${new Date(sah.tarikh).toLocaleDateString('ms-MY')}</div>`:''}</div>
    <table><thead>
      <tr><th rowspan="2">BIL</th><th rowspan="2">NAMA PENUH MURID</th>
        <th rowspan="2"><span class="vert">TAHUN</span></th><th rowspan="2"><span class="vert">JANTINA</span></th>
        <th colspan="${nDays}">BULAN : ${MONTHS[month].toUpperCase()}</th>
        <th rowspan="2"><span class="vert">JUMLAH HARI</span></th><th colspan="3">TIDAK HADIR</th></tr>
      <tr>${dayTh}<th>BULAN<br>SEMASA</th><th>BULAN<br>LEPAS</th><th>JUMLAH<br>SEMUA</th></tr></thead>
    <tbody>${body}</tbody>
    <tfoot>${foot(footX,'JUMLAH MURID TIDAK HADIR')}${foot(footH,'JUMLAH MURID HADIR')}${foot(null,'JUMLAH KEHADIRAN SEPATUTNYA')}</tfoot></table>
    <div class="sign"><div class="s">Disediakan oleh:<div class="line">( ${esc(guru?guru.nama:'……………………………………')} )<br>Guru Kelas</div></div>
      <div class="s">Disahkan oleh:<div class="line">( ${esc(school.gb&&school.gb!=='—'?school.gb:'……………………………………')} )<br>Guru Besar</div></div></div>
  </div>`;
}

async function printC8All(program='RMT'){
  const {year,month}=C8_STATE;
  const btn=$('#printC8All'); if(btn){btn.disabled=true;btn.innerHTML='<span class="spinner dark"></span> Menjana…';}
  try{
    const [school,users,classes]=await Promise.all([DB.getSchool(),DB.getUsers(),DB.getClasses()]);
    const list=sortCls(classes);
    let secs='';
    for(const c of list) secs+=await c8SectionHTML(school,users,c,year,month,program);
    const html=`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><title>C8 ${program} Semua Kelas — ${MONTHS[month]} ${year}</title><style>
      @page{size:A4 landscape;margin:9mm}
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#000}
      .sec{page-break-after:always}
      .sec:last-child{page-break-after:auto}
      .hd{display:flex;align-items:center;gap:10px;border:2px solid #000;border-bottom:none;padding:6px 10px}
      .hd img{height:44px}.hd .mid{flex:1;text-align:center}
      .hd .t1{font-size:12px;font-weight:bold}.hd .t2{font-size:15px;font-weight:bold;letter-spacing:1px}
      .hd .tag{font-size:11px;font-weight:bold;border:1.5px solid #000;padding:3px 9px}
      .info{display:flex;border:2px solid #000;border-bottom:none;border-top:1px solid #000;font-size:11px}
      .info div{padding:4px 10px;border-right:1px solid #000}.info div:last-child{border-right:none;flex:1}
      table{border-collapse:collapse;width:100%;font-size:8.5px}
      th,td{border:1px solid #000;text-align:center;padding:2px 1px}
      thead th{background:#d9d9d9;font-weight:bold}
      tbody td{height:15px}
      td.name{text-align:left;padding:2px 4px;white-space:nowrap}
      .vert{writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:1px}
      td.we,th.we{background:#d9d9d9}
      tfoot td{background:#f0f0f0}
      .sign{display:flex;justify-content:space-between;margin-top:18px;font-size:10px;page-break-inside:avoid}
      .sign .s{width:38%}.sign .line{border-top:1px solid #000;margin-top:32px;padding-top:4px}
    </style></head><body>${secs}</body></html>`;
    const fr=document.createElement('iframe');
    fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(fr); fr.srcdoc=html;
    fr.onload=()=>{setTimeout(()=>{try{fr.contentWindow.focus();fr.contentWindow.print();}
      catch(e){toast('Gagal cetak: '+e.message,'err');} setTimeout(()=>fr.remove(),4000);},250);};
    DB.addLog('Cetak pukal C8',`${program} · ${MONTHS[month]} ${year} (${list.length} kelas)`);
  }catch(e){ toast(authErr(e),'err'); }
  if(btn){btn.disabled=false;btn.innerHTML=IC.print+' Cetak Semua Kelas';}
}

/* Cetakan rasmi C8 — dokumen berasingan, A4 landscape, gaya borang KPM */
async function printC8(program='RMT'){
  const src=$('.c8');
  if(!src){toast('Borang belum dipaparkan.','err');return;}
  const {kelasId,year,month}=C8_STATE;
  const [school,classes,users]=await Promise.all([DB.getSchool(),DB.getClasses(),DB.getUsers()]);
  const cls=classes.find(c=>c.id===kelasId)||{};
  const guru=users.find(u=>u.id===cls.guruId);
  const sahP=await DB.getSah(kelasId,year,month);

  const clone=src.cloneNode(true);
  const t=clone.querySelector('.c8-title'); if(t){const tr=t.closest('tr'); if(tr)tr.remove();}
  // simbol rasmi borang: hadir = / , tidak hadir = X
  clone.querySelectorAll('td.day').forEach(td=>{
    if(td.classList.contains('present')) td.textContent='/';
    else if(td.classList.contains('absent')) td.textContent='X';
  });

  const html=`<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8"><title>Borang C8 — ${MONTHS[month]} ${year}</title><style>
    @page{size:A4 landscape;margin:9mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#000;background:#fff}
    .hd{display:flex;align-items:center;gap:10px;border:2px solid #000;border-bottom:none;padding:6px 10px}
    .hd img{height:46px}
    .hd .mid{flex:1;text-align:center}
    .hd .t1{font-size:12px;font-weight:bold}
    .hd .t2{font-size:15px;font-weight:bold;letter-spacing:1px;margin-top:2px}
    .hd .tag{font-size:11px;font-weight:bold;border:1.5px solid #000;padding:3px 9px}
    .info{display:flex;border:2px solid #000;border-bottom:none;border-top:1px solid #000;font-size:11px}
    .info div{padding:4px 10px;border-right:1px solid #000}
    .info div:last-child{border-right:none;flex:1}
    table{border-collapse:collapse;width:100%;font-size:8.5px}
    th,td{border:1px solid #000;text-align:center;padding:2px 1px}
    thead th{background:#d9d9d9;font-weight:bold}
    tbody td{height:16px}
    td.name{text-align:left;padding:2px 4px;white-space:nowrap;font-weight:normal}
    .vert{writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:1px}
    td.we,th.we,td.hol,th.hol{background:#d9d9d9}
    td.calc{font-weight:bold}
    tfoot td{font-weight:bold;text-align:left;padding:2px 4px;background:#f0f0f0}
    tfoot td[data-foot]{text-align:center}
    .sign{display:flex;justify-content:space-between;margin-top:24px;font-size:11px;page-break-inside:avoid}
    .sign .s{width:38%}
    .sign .line{border-top:1px solid #000;margin-top:40px;padding-top:4px}
  </style></head><body>
    <div class="hd">
      ${school.logo?`<img src="${school.logo}" alt="logo">`:''}
      <div class="mid">
        <div class="t1">${esc((school.nama||'').toUpperCase())}</div>
        <div class="t2">REKOD KEHADIRAN MURID ${program}</div>
      </div>
      <div class="tag">BORANG C8</div>
    </div>
    <div class="info">
      <div><b>BULAN:</b> ${MONTHS[month].toUpperCase()} ${year}</div>
      <div><b>KELAS:</b> ${esc(clsLabel(cls).toUpperCase())}</div>
      <div><b>GURU KELAS:</b> ${esc(guru?guru.nama.toUpperCase():'—')}</div>
      ${sahP?`<div><b>DISAHKAN:</b> ${esc(sahP.olehNama)} · ${new Date(sahP.tarikh).toLocaleDateString('ms-MY')}</div>`:''}
    </div>
    ${clone.outerHTML}
    <div class="sign">
      <div class="s">Disediakan oleh:
        <div class="line">( ${esc(guru?guru.nama:'……………………………………')} )<br>Guru Kelas</div></div>
      <div class="s">Disahkan oleh:
        <div class="line">( ${esc(school.gb&&school.gb!=='—'?school.gb:'……………………………………')} )<br>Guru Besar</div></div>
    </div>
  </body></html>`;

  const fr=document.createElement('iframe');
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr);
  fr.srcdoc=html;
  fr.onload=()=>{ setTimeout(()=>{
    try{ fr.contentWindow.focus(); fr.contentWindow.print(); }
    catch(e){ toast('Gagal buka cetakan: '+e.message,'err'); }
    setTimeout(()=>fr.remove(),3000);
  },200); };
}

function showSaving(){const s=$('#c8-save');if(s)s.innerHTML='<span class="spinner dark" style="width:14px;height:14px"></span> Menyimpan…';}
function showSaved(){const s=$('#c8-save');if(s){s.textContent='✓ Tersimpan';setTimeout(()=>{if(s)s.textContent='';},1500);}}

function updateRowTotals(sid){
  const row=$(`.c8 td.name`)&&[...$$('.c8 tbody tr')].find(tr=>tr.querySelector(`td.day[data-sid="${sid}"]`));
  if(!row)return;
  let hadir=0,absS=0;
  row.querySelectorAll(`td.day[data-sid="${sid}"]`).forEach(td=>{
    if(td.classList.contains('present'))hadir++; if(td.classList.contains('absent'))absS++;
  });
  const hCell=row.querySelector('[data-role="hadir"]'); if(hCell)hCell.textContent=hadir;
  const aCell=row.querySelector('[data-role="absS"]'); if(aCell)aCell.textContent=absS;
  const allCell=row.querySelector('[data-role="absAll"]');
  const lepas=+row.children[row.children.length-2].textContent||0;
  if(allCell)allCell.textContent=absS+lepas;
}
function recalcFooter(){
  const dayNums=[...$$('.c8 thead th.col-day')].map(th=>+th.textContent);
  // active roster count utk "sepatutnya"
  const rosterRows=$$('.c8 tbody tr').filter(tr=>tr.querySelector('td.day'));
  $$('.c8 tfoot td[data-foot]').forEach(td=>{
    const day=+td.dataset.day,role=td.dataset.foot; let hadir=0,tidak=0;
    rosterRows.forEach(tr=>{
      const c=tr.querySelector(`td.day[data-day="${day}"]`); if(!c)return;
      if(c.classList.contains('present'))hadir++; if(c.classList.contains('absent'))tidak++;
    });
    const isSchool=!$(`.c8 thead th.col-day:nth-child(${1})`); // fallback
    if(role==='hadir')td.textContent=hadir||'';
    if(role==='tidak')td.textContent=tidak||'';
    if(role==='should'){ const total=rosterRows.length;
      // hanya papar utk hari persekolahan
      const th=[...$$('.c8 thead th.col-day')].find(t=>+t.textContent===day);
      td.textContent=(th&&!th.classList.contains('we')&&!th.classList.contains('hol'))?total:'';
    }
  });
}

/* ---------------------------------------------------------
   9. HALAMAN: Maklumat Murid
--------------------------------------------------------- */
let MURID_FILTER={q:'',kelasId:'',statusRMT:''};
async function pageMurid(v){
  const [students,classes]=await Promise.all([DB.getStudents(),DB.getClasses()]);
  const clsName=id=>{const c=classes.find(x=>x.id===id);return c?clsLabel(c):'—';};
  let list=students;
  if(!seesAllClasses()) list=list.filter(s=>s.kelasId===CURRENT.kelasId);
  if(MURID_FILTER.q) list=list.filter(s=>s.nama.toLowerCase().includes(MURID_FILTER.q.toLowerCase()));
  if(MURID_FILTER.kelasId) list=list.filter(s=>s.kelasId===MURID_FILTER.kelasId);
  if(MURID_FILTER.statusRMT) list=list.filter(s=>s.statusRMT===MURID_FILTER.statusRMT);
  list.sort((a,b)=>a.nama.localeCompare(b.nama));

  const clsOpts=`<option value="">Semua kelas</option>`+sortCls(classes).map(c=>`<option value="${c.id}" ${MURID_FILTER.kelasId===c.id?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  const rows=list.map((s,i)=>`<tr>
      <td>${i+1}</td><td>${esc(s.nama)}</td><td>${esc(s.mykid||'—')}</td>
      <td>${s.jantina==='L'?'Lelaki':'Perempuan'}</td><td>${esc(clsName(s.kelasId))}</td>
      <td><span class="badge ${s.statusRMT==='Aktif'?'ok':(s.statusRMT==='Tamat'?'b':'off')}">${esc(s.statusRMT)}</span></td>
      <td class="no-print" style="white-space:nowrap">
        ${bolehUrusMurid(s)?`<button class="btn btn-sm" data-edit="${s.id}">Edit</button>`:''}
        ${isAdmin()?`<button class="btn btn-sm btn-danger" data-del="${s.id}">Padam</button>`:''}
      </td></tr>`).join('') || `<tr><td colspan="7">${emptyState('Tiada murid dijumpai.')}</td></tr>`;

  if(!onPage('murid'))return; // halaman lain sudah dibuka — jangan tindih

  const kad = isMobile();
  const senaraiKad = list.map(st=>`<div class="pcard">
      <div class="avat ${avatTone(st.nama)}">${esc(initials(st.nama))}</div>
      <div class="pmeta">
        <div class="pn">${esc(st.nama)}</div>
        <div class="ps">${esc(clsName(st.kelasId))} · ${st.jantina==='L'?'Lelaki':'Perempuan'}</div>
        <div class="pid">${esc(st.mykid||'—')}</div>
      </div>
      <span class="badge ${st.statusRMT==='Aktif'?'ok':(st.statusRMT==='Tamat'?'b':'off')}">${esc(st.statusRMT)}</span>
      ${bolehUrusMurid(st)?`<button class="icon-btn" data-edit="${st.id}" title="Edit">${IC.edit}</button>`:''}
    </div>`).join('');

  v.innerHTML=`
    <div class="page-head">
      <div class="htxt"><h2>Maklumat Murid</h2>
        <div class="sub">${list.length} murid RMT ${MURID_FILTER.statusRMT||'aktif'}</div></div>
      <div class="spacer"></div>
      ${bolehTambahMurid()?(kad?`<button class="fab-add" id="addBtn" title="Tambah murid">${IC.plus}</button>`
        :`${isAdmin()?`<button class="btn" id="impBtn">Import CSV</button>`:''}
          <button class="btn btn-primary" id="addBtn">${IC.plus} Tambah Murid</button>`):''}
    </div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Cari nama</label><input id="f-q" value="${esc(MURID_FILTER.q)}" placeholder="Cari nama murid…"></div>
      <div class="field"><label>Kelas</label><select id="f-kelas">${clsOpts}</select></div>
      <div class="field"><label>Status RMT</label><select id="f-status">
        <option value="">Semua</option>
        <option ${MURID_FILTER.statusRMT==='Aktif'?'selected':''}>Aktif</option>
        <option ${MURID_FILTER.statusRMT==='Tidak Aktif'?'selected':''}>Tidak Aktif</option>
        <option ${MURID_FILTER.statusRMT==='Tamat'?'selected':''}>Tamat</option></select></div>
      <span style="align-self:center;color:var(--muted);font-size:13px">${list.length} murid</span>
    </div>
    ${kad
      ? (list.length? `<div class="plist">${senaraiKad}</div>`
         : emptyRich('Belum ada murid dalam kelas ini',
             'Tambah murid satu per satu, atau import senarai melalui fail CSV.',
             (bolehTambahMurid()?`<button class="btn btn-primary" id="addBtn2">Tambah Murid</button>
                ${isAdmin()?`<button class="btn btn-ghost" id="impBtn2">Import CSV</button>`:''}`:'')))
      : `<div class="tbl-wrap"><table class="data">
      <thead><tr><th>Bil</th><th>Nama Penuh</th><th>No. MyKid</th><th>Jantina</th><th>Kelas</th><th>Status RMT</th><th class="no-print">Tindakan</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`}`;
  if($('#addBtn2'))$('#addBtn2').onclick=()=>studentModal(null,classes,v);
  if($('#impBtn2'))$('#impBtn2').onclick=()=>importCSVModal(classes,v);

  $('#f-q').oninput=e=>{MURID_FILTER.q=e.target.value;pageMurid(v);};
  $('#f-kelas').onchange=e=>{MURID_FILTER.kelasId=e.target.value;pageMurid(v);};
  $('#f-status').onchange=e=>{MURID_FILTER.statusRMT=e.target.value;pageMurid(v);};
  if($('#addBtn'))$('#addBtn').onclick=()=>studentModal(null,classes,v);
  if($('#impBtn'))$('#impBtn').onclick=()=>importCSVModal(classes,v);
  $$('[data-edit]').forEach(b=>b.onclick=()=>studentModal(students.find(s=>s.id===b.dataset.edit),classes,v));
  $$('[data-del]').forEach(b=>b.onclick=async()=>{
    if(await confirmDialog('Padam murid ini?')){await DB.delStudent(b.dataset.del);DB.addLog('Padam murid',b.dataset.del);toast('Murid dipadam','ok');pageMurid(v);}});
}

function studentModal(s,classes,v){
  const isEdit=!!s; s=s||{jantina:'L',statusRMT:'Aktif',tahun:1};
  // Guru kelas hanya boleh menempatkan murid dalam kelas sendiri
  const kunciKelas=!seesAllClasses() && !!CURRENT.kelasId;
  if(kunciKelas && !isEdit){ s.kelasId=CURRENT.kelasId;
    const kc=classes.find(c=>c.id===CURRENT.kelasId); if(kc)s.tahun=kc.tahun||s.tahun; }
  const senaraiKelas=kunciKelas?classes.filter(c=>c.id===CURRENT.kelasId):classes;
  const clsOpts=sortCls(senaraiKelas).map(c=>`<option value="${c.id}" ${s.kelasId===c.id?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  openModal(`
    <div class="modal-head"><h3>${isEdit?'Edit':'Tambah'} Murid</h3><div class="spacer" style="flex:1"></div>
      <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
    <div class="modal-body">
      <div class="field"><label>Nama penuh</label><input id="m-nama" value="${esc(s.nama||'')}"></div>
      <div class="grid-2">
        <div class="field"><label>No. MyKid</label><input id="m-kid" value="${esc(s.mykid||'')}"></div>
        <div class="field"><label>Jantina</label><select id="m-jan">
          <option value="L" ${s.jantina==='L'?'selected':''}>Lelaki</option>
          <option value="P" ${s.jantina==='P'?'selected':''}>Perempuan</option></select></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Tahun</label><select id="m-thn">${[1,2,3,4,5,6].map(t=>`<option ${s.tahun===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Kelas</label>
          <select id="m-kelas" ${kunciKelas?'disabled':''}>${clsOpts}</select>
          ${kunciKelas?'<div style="font-size:11.5px;color:var(--muted);margin-top:5px">Ditetapkan kepada kelas anda</div>':''}</div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Tarikh mula dalam program</label>
          <input type="date" id="m-mula" value="${esc(s.mula||'')}"></div>
        <div class="field"><label>Tarikh tamat / berpindah</label>
          <input type="date" id="m-tamat" value="${esc(s.tamat||'')}"></div>
      </div>
      <p style="color:var(--muted);font-size:12px;margin:-6px 0 14px;line-height:1.5">
        Biarkan <b>kosong</b> jika murid dalam program sepanjang tahun.
        Isi <b>tarikh mula</b> untuk murid baharu masuk pertengahan tahun — namanya tidak
        akan muncul dalam borang bulan sebelum itu. Isi <b>tarikh tamat</b> bila murid
        berpindah keluar — rekod lamanya kekal, cuma tidak muncul pada bulan seterusnya.</p>
      <div class="field"><label>Status RMT</label><select id="m-status">
        <option ${s.statusRMT==='Aktif'?'selected':''}>Aktif</option>
        <option ${s.statusRMT==='Tidak Aktif'?'selected':''}>Tidak Aktif</option>
        <option ${s.statusRMT==='Tamat'?'selected':''}>Tamat</option></select></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="m-save">Simpan</button></div>`);
  $('#m-save').onclick=async()=>{
    const nama=$('#m-nama').value.trim(); if(!nama){toast('Nama wajib diisi','err');return;}
    const mula=$('#m-mula').value, tamat=$('#m-tamat').value;
    if(mula&&tamat&&tamat<mula){toast('Tarikh tamat tidak boleh lebih awal daripada tarikh mula.','err');return;}
    const obj={...(isEdit?{id:s.id}:{}),nama,mykid:$('#m-kid').value.trim(),jantina:$('#m-jan').value,
      tahun:+$('#m-thn').value,kelasId:kunciKelas?CURRENT.kelasId:$('#m-kelas').value,
      statusRMT:$('#m-status').value,mula,tamat};
    if(!bolehUrusMurid(obj)){toast('Anda hanya boleh mengurus murid kelas sendiri.','err');return;}
    await DB.saveStudent(obj); DB.addLog(isEdit?'Edit murid':'Tambah murid',obj.nama); closeModal(); toast('Murid disimpan','ok'); pageMurid(v);
  };
}

function importCSVModal(classes,v){
  openModal(`
    <div class="modal-head"><h3>Import Murid (CSV)</h3><div style="flex:1"></div>
      <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
    <div class="modal-body">
      <p style="margin-top:0;color:var(--muted);font-size:13px">
        Format tajuk: <code>nama,mykid,jantina,tahun,kelas,mula,tamat</code><br>
        jantina = L atau P · kelas = padanan "Tahun X Nama" (cth: Tahun 1 Amanah)<br>
        <b>mula/tamat</b> (pilihan, format YYYY-MM-DD) — isi hanya jika murid masuk atau
        berpindah pertengahan tahun. Biarkan kosong untuk murid sepanjang tahun.</p>
      <button class="btn btn-sm" id="csv-dl" style="margin-bottom:14px">⬇ Muat turun template CSV</button>
      <div class="field"><label>Pilih fail CSV</label><input type="file" id="csv-file" accept=".csv"></div>
      <textarea id="csv-text" rows="6" placeholder="Atau tampal teks CSV di sini…"></textarea>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="csv-go">Import</button></div>`);
  $('#csv-dl').onclick=()=>downloadCSV('template_murid.csv',CSV_TEMPLATE);
  $('#csv-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
    r.onload=()=>{$('#csv-text').value=r.result;};r.readAsText(f);};
  $('#csv-go').onclick=async()=>{
    const txt=$('#csv-text').value.trim(); if(!txt){toast('Tiada data CSV','err');return;}
    const lines=txt.split(/\r?\n/).filter(Boolean);
    const head=lines.shift().split(',').map(h=>h.trim().toLowerCase());
    const idx=n=>head.indexOf(n);
    let ok=0;
    for(const ln of lines){
      const p=ln.split(',');
      const nama=(p[idx('nama')]||'').trim(); if(!nama)continue;
      const tahun=+(p[idx('tahun')]||1); const kelasName=(p[idx('kelas')]||'').trim().toLowerCase();
      let cls=classes.find(c=>clsLabel(c).toLowerCase()===kelasName)
            ||classes.find(c=>c.nama.toLowerCase()===kelasName&&c.tahun===tahun)
            ||classes.find(c=>!c.tahun&&c.nama.toLowerCase()===kelasName);
      const cMula=idx('mula')>=0?(p[idx('mula')]||'').trim():'';
      const cTamat=idx('tamat')>=0?(p[idx('tamat')]||'').trim():'';
      await DB.saveStudent({mula:cMula,tamat:cTamat,nama,mykid:(p[idx('mykid')]||'').trim(),
        jantina:((p[idx('jantina')]||'L').trim().toUpperCase().startsWith('P'))?'P':'L',
        tahun,kelasId:cls?cls.id:(classes[0]?.id||''),statusRMT:'Aktif'});
      ok++;
    }
    DB.addLog('Import CSV',ok+' murid'); closeModal(); toast(ok+' murid diimport','ok'); pageMurid(v);
  };
}

/* ---------------------------------------------------------
   10. HALAMAN: Kelas
--------------------------------------------------------- */
async function pageKelas(v){
  const [classes,users,students]=await Promise.all([DB.getClasses(),DB.getUsers(),DB.getStudents()]);
  const gName=id=>{const u=users.find(x=>x.id===id);return u?u.nama:'—';};
  const count=id=>students.filter(s=>s.kelasId===id).length;
  const sorted=sortCls(classes); classes.length=0; classes.push(...sorted);
  const rows=classes.map((c,i)=>`<tr>
    <td>${i+1}</td><td>${esc(clsLabel(c))}</td><td>${esc(gName(c.guruId))}</td>
    <td><span class="badge b">${count(c.id)} murid</span></td>
    <td class="no-print" style="white-space:nowrap"><button class="btn btn-sm" data-edit="${c.id}">Edit</button>
      <button class="btn btn-sm btn-danger" data-del="${c.id}">Padam</button></td></tr>`).join('')
    || `<tr><td colspan="5">${emptyState('Belum ada kelas.')}</td></tr>`;
  if(!onPage('kelas'))return; // halaman lain sudah dibuka — jangan tindih
  v.innerHTML=`
    <div class="page-head"><h2>Maklumat Kelas</h2><div class="spacer"></div>
      <button class="btn btn-primary" id="addBtn">${IC.plus} Tambah Kelas</button></div>
    <div class="tbl-wrap"><table class="data"><thead><tr>
      <th>Bil</th><th>Kelas</th><th>Guru Kelas</th><th>Bil. Murid</th><th class="no-print">Tindakan</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  $('#addBtn').onclick=()=>classModal(null,users,v);
  $$('[data-edit]').forEach(b=>b.onclick=()=>classModal(classes.find(c=>c.id===b.dataset.edit),users,v));
  $$('[data-del]').forEach(b=>b.onclick=async()=>{
    if(await confirmDialog('Padam kelas ini?')){await DB.delClass(b.dataset.del);DB.addLog('Padam kelas',b.dataset.del);toast('Kelas dipadam','ok');pageKelas(v);}});
}
function classModal(c,users,v){
  const isEdit=!!c; c=c||{tahun:1,nama:'',guruId:''};
  const gOpts=`<option value="">— Tiada —</option>`+users.filter(u=>u.role.startsWith('Guru'))
    .map(u=>`<option value="${u.id}" ${c.guruId===u.id?'selected':''}>${esc(u.nama)}</option>`).join('');
  openModal(`
    <div class="modal-head"><h3>${isEdit?'Edit':'Tambah'} Kelas</h3><div style="flex:1"></div>
      <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
    <div class="modal-body">
      <div class="grid-2">
        <div class="field"><label>Tahun</label><select id="c-thn">
          <option value="0" ${!c.tahun?'selected':''}>&mdash; (tiada tahun, cth Prasekolah/PPKI)</option>
          ${[1,2,3,4,5,6].map(t=>`<option value="${t}" ${c.tahun===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Nama kelas</label><input id="c-nama" value="${esc(c.nama)}" placeholder="Amanah"></div>
      </div>
      <div class="field"><label>Guru kelas</label><select id="c-guru">${gOpts}</select></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="c-save">Simpan</button></div>`);
  $('#c-save').onclick=async()=>{
    const nama=$('#c-nama').value.trim(); if(!nama){toast('Nama kelas wajib','err');return;}
    await DB.saveClass({...(isEdit?{id:c.id}:{}),tahun:+$('#c-thn').value,nama,guruId:$('#c-guru').value||null});
    DB.addLog(isEdit?'Edit kelas':'Tambah kelas',nama); closeModal(); toast('Kelas disimpan','ok'); pageKelas(v);
  };
}

/* ---------------------------------------------------------
   11. HALAMAN: Guru & Pengguna
--------------------------------------------------------- */
async function pageGuru(v){
  const [users,classes]=await Promise.all([DB.getUsers(),DB.getClasses()]);
  const clsName=id=>{const c=classes.find(x=>x.id===id);return c?clsLabel(c):'—';};
  const rows=users.map((u,i)=>`<tr>
    <td>${i+1}</td><td>${esc(u.nama)}</td><td>${esc(u.role)}</td><td>${esc(u.username||u.email||'—')}</td>
    <td>${esc(u.kelasId?clsName(u.kelasId):'—')}</td>
    <td><span class="badge ${u.aktif?'ok':'off'}">${u.aktif?'Aktif':'Tidak Aktif'}</span></td>
    <td class="no-print" style="white-space:nowrap"><button class="btn btn-sm" data-edit="${u.id}">Edit</button>
      <button class="btn btn-sm btn-danger" data-del="${u.id}">Padam</button></td></tr>`).join('');
  if(!onPage('guru'))return; // halaman lain sudah dibuka — jangan tindih
  v.innerHTML=`
    <div class="page-head"><h2>Guru & Pengguna</h2><div class="spacer"></div>
      <button class="btn btn-primary" id="addBtn">${IC.plus} Tambah Pengguna</button></div>
    <div class="tbl-wrap"><table class="data"><thead><tr>
      <th>Bil</th><th>Nama</th><th>Jawatan / Role</th><th>ID / Emel</th><th>Kelas</th><th>Status</th><th class="no-print">Tindakan</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    ${USE_FIREBASE?'<p style="color:var(--muted);font-size:12px;margin-top:10px">Nota: daftarkan <b>emel akaun Google</b> setiap guru di sini. Bila mereka klik "Log masuk dengan Google" guna emel yang sama, mereka terus dapat peranan & kelas yang ditetapkan. Tak perlu cipta kata laluan.</p>':''}`;
  $('#addBtn').onclick=()=>userModal(null,classes,v);
  $$('[data-edit]').forEach(b=>b.onclick=()=>userModal(users.find(u=>u.id===b.dataset.edit),classes,v));
  $$('[data-del]').forEach(b=>b.onclick=async()=>{
    if(await confirmDialog('Padam pengguna ini?')){await DB.delUser(b.dataset.del);DB.addLog('Padam pengguna',b.dataset.del);toast('Pengguna dipadam','ok');pageGuru(v);}});
}
function userModal(u,classes,v){
  const isEdit=!!u; u=u||{role:'Guru Kelas',aktif:true};
  const roleOpts=ROLES.map(r=>`<option ${u.role===r?'selected':''}>${r}</option>`).join('');
  const clsOpts=`<option value="">— Tiada —</option>`+sortCls(classes).map(c=>`<option value="${c.id}" ${u.kelasId===c.id?'selected':''}>${esc(clsLabel(c))}</option>`).join('');
  openModal(`
    <div class="modal-head"><h3>${isEdit?'Edit':'Tambah'} Pengguna</h3><div style="flex:1"></div>
      <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
    <div class="modal-body">
      <div class="field"><label>Nama</label><input id="u-nama" value="${esc(u.nama||'')}"></div>
      <div class="grid-2">
        <div class="field"><label>Jawatan / Role</label><select id="u-role">${roleOpts}</select></div>
        <div class="field"><label>Kelas (jika Guru Kelas)</label><select id="u-kelas">${clsOpts}</select></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>ID Pengguna</label><input id="u-user" value="${esc(u.username||'')}"></div>
        <div class="field"><label>Emel ${USE_FIREBASE?'(emel akaun Google)':''}</label><input id="u-email" value="${esc(u.email||'')}" placeholder="${USE_FIREBASE?'nama@gmail.com':''}"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>No. Telefon</label><input id="u-tel" value="${esc(u.tel||'')}"></div>
        <div class="field"><label>Status</label><select id="u-aktif">
          <option value="1" ${u.aktif?'selected':''}>Aktif</option>
          <option value="0" ${!u.aktif?'selected':''}>Tidak Aktif</option></select></div>
      </div>
      ${USE_FIREBASE?'':`<div class="field"><label>Kata Laluan (Mod Demo)</label><input id="u-pass" value="${esc(u.password||'')}"></div>`}
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="u-save">Simpan</button></div>`);
  $('#u-save').onclick=async()=>{
    const nama=$('#u-nama').value.trim(); if(!nama){toast('Nama wajib','err');return;}
    const email=$('#u-email').value.trim().toLowerCase();
    if(USE_FIREBASE && !email){toast('Emel akaun Google wajib diisi — ia digunakan untuk log masuk.','err');return;}
    const obj={...(isEdit?{id:u.id}:{}),nama,role:$('#u-role').value,kelasId:$('#u-kelas').value||null,
      username:$('#u-user').value.trim(),email,tel:$('#u-tel').value.trim(),
      aktif:$('#u-aktif').value==='1'};
    if(!USE_FIREBASE)obj.password=$('#u-pass').value;
    await DB.saveUser(obj); DB.addLog(isEdit?'Edit pengguna':'Tambah pengguna',obj.nama+' ('+obj.role+')'); closeModal(); toast('Pengguna disimpan','ok'); pageGuru(v);
  };
}

/* ---------------------------------------------------------
   12. HALAMAN: Tetapan Sekolah
--------------------------------------------------------- */
async function pageTetapan(v){
  const s=await DB.getSchool();
  let logoData=s.logo||'';
  if(!onPage('tetapan'))return; // halaman lain sudah dibuka — jangan tindih
  v.innerHTML=`
    <div class="page-head"><h2>Tetapan Sekolah</h2></div>
    <div class="card" style="max-width:640px">
      <div class="field"><label>Logo sekolah</label>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <img id="s-logo-img" class="logo-preview" src="${logoData||''}" style="${logoData?'':'display:none'}">
          <div>
            <input type="file" id="s-logo-file" accept="image/*" style="max-width:240px">
            <div style="margin-top:8px">
              <button class="btn btn-sm btn-danger" id="s-logo-rm" style="${logoData?'':'display:none'}">Buang logo</button>
            </div>
            <div style="color:var(--muted);font-size:12px;margin-top:6px">PNG/JPG. Dipaparkan pada borang C8.</div>
          </div>
        </div></div>
      <div class="field"><label>Nama sekolah</label><input id="s-nama" value="${esc(s.nama||'')}"></div>
      <div class="grid-2">
        <div class="field"><label>Kod sekolah</label><input id="s-kod" value="${esc(s.kod||'')}"></div>
        <div class="field"><label>Daerah</label><input id="s-daerah" value="${esc(s.daerah||'')}"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Negeri</label><input id="s-negeri" value="${esc(s.negeri||'')}"></div>
        <div class="field"><label>Telefon</label><input id="s-tel" value="${esc(s.tel||'')}"></div>
      </div>
      <div class="field"><label>Alamat</label><input id="s-alamat" value="${esc(s.alamat||'')}"></div>
      <div class="field"><label>Emel</label><input id="s-email" value="${esc(s.email||'')}"></div>
      <div class="grid-2">
        <div class="field"><label>Nama Guru Besar</label><input id="s-gb" value="${esc(s.gb||'')}"></div>
        <div class="field"><label>Nama PK HEM</label><input id="s-pkhem" value="${esc(s.pkhem||'')}"></div>
      </div>
      <div class="field"><label>Nama Penyelaras RMT</label><input id="s-peny" value="${esc(s.penyelaras||'')}"></div>
      <button class="btn btn-primary" id="s-save">Simpan Tetapan</button>
    </div>

    <div class="card" style="max-width:640px;margin-top:18px">
      <h3 style="margin:0 0 6px">Warna Tema Aplikasi</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Pilih warna rasmi sekolah — seluruh aplikasi (topbar, butang, menu) akan mengikut warna ini.</p>
      <div class="swatches" id="s-swatches">
        ${['#7FB89A','#3D7E24','#022148','#0B7A3B','#1565C0','#8E1B1B','#6A1B9A','#E65100']
          .map(c=>`<button class="swatch" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}
        <label class="swatch custom" title="Warna sendiri">🎨
          <input type="color" id="s-custcolor" value="${esc(s.themeColor||'#7FB89A')}" style="opacity:0;position:absolute;inset:0;cursor:pointer"></label>
      </div>
      <p style="font-size:12px;color:var(--muted);margin:10px 0 0">Warna semasa: <b id="s-curcolor">${esc(s.themeColor||'#7FB89A (sage e-RMT)')}</b>. Klik warna untuk terap &amp; simpan.</p>
    </div>

    <div class="card" style="max-width:640px;margin-top:18px">
      <h3 style="margin:0 0 6px">Naik Kelas (Sesi Baharu)</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Sesi semasa: <b>${APP_CFG.sesi||new Date().getFullYear()}</b>.
        Proses ini akan: (1) membekukan senarai murid sesi semasa supaya rekod lama
        kekal boleh dirujuk, (2) menaikkan murid Tahun 1–5 ke tahun berikutnya
        (kelas dipadankan ikut nama, cth T1 INOVASI → T2 INOVASI),
        (3) menanda murid Tahun 6 sebagai <b>Tamat</b>, dan (4) memulakan sesi baharu.
        Dijalankan <b>sekali sahaja</b> pada hujung/awal tahun persekolahan.</p>
      <button class="btn btn-primary" id="s-promote">Proses Naik Kelas ke Sesi ${(APP_CFG.sesi||new Date().getFullYear())+1}</button>
    </div>

    <div class="card" style="max-width:640px;margin-top:18px">
      <h3 style="margin:0 0 6px">Backup &amp; Pulihkan</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Muat turun salinan penuh semua data (tetapan, pengguna, kelas, murid, kehadiran,
        borang C1/C2, cuti, roster sesi lama) sebagai satu fail JSON. Simpan di
        Google Drive/pendrive secara berkala. Jika sistem bermasalah, pulihkan dari fail ini.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-blue" id="s-backup">⬇ Muat Turun Backup</button>
        <label class="btn btn-ghost" style="cursor:pointer">⬆ Pulihkan dari Backup
          <input type="file" id="s-restore" accept=".json" style="display:none"></label>
      </div>
    </div>

    <div class="card" style="max-width:640px;margin-top:18px">
      <h3 style="margin:0 0 6px">Log Aktiviti</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 12px">
        Jejak audit: siapa buat apa dan bila (100 terkini).</p>
      <button class="btn btn-sm" id="s-loglihat">Papar Log</button>
      <div id="s-logbox" style="margin-top:12px"></div>
    </div>`;

  $('#s-logo-file').onchange=e=>{ const f=e.target.files[0]; if(!f)return;
    downscaleImage(f,220,dataURL=>{ logoData=dataURL;
      const img=$('#s-logo-img'); img.src=dataURL; img.style.display='';
      $('#s-logo-rm').style.display=''; toast('Logo dipilih — tekan Simpan Tetapan','info'); });
  };
  $('#s-logo-rm').onclick=()=>{ logoData=''; $('#s-logo-img').style.display='none';
    $('#s-logo-file').value=''; $('#s-logo-rm').style.display='none'; };

  $('#s-save').onclick=async()=>{
    await DB.saveSchool({nama:$('#s-nama').value,kod:$('#s-kod').value,daerah:$('#s-daerah').value,
      negeri:$('#s-negeri').value,tel:$('#s-tel').value,alamat:$('#s-alamat').value,email:$('#s-email').value,
      gb:$('#s-gb').value,pkhem:$('#s-pkhem').value,penyelaras:$('#s-peny').value,logo:logoData});
    simpanNamaSekolah($('#s-nama').value); terapkanIdentiti();
    const bs=$('.topbar .brand .hide-sm'); if(bs)bs.textContent=schoolNames().pendek; // kemas kini serta-merta
    DB.addLog('Ubah tetapan sekolah','');
    toast('Tetapan disimpan','ok');
  };

  /* --- Warna Tema --- */
  const pilihWarna=async c=>{
    applyTheme(c);
    await DB.saveSchool({themeColor:c});
    $('#s-curcolor').textContent=c;
    DB.addLog('Tukar warna tema',c);
    toast('Warna tema disimpan: '+c,'ok');
  };
  $$('#s-swatches .swatch[data-c]').forEach(b=>b.onclick=()=>pilihWarna(b.dataset.c));
  $('#s-custcolor').oninput=e=>pilihWarna(e.target.value);

  /* --- Log Aktiviti --- */
  $('#s-loglihat').onclick=async()=>{
    const box=$('#s-logbox'); box.innerHTML='<span class="spinner dark"></span>';
    const logs=await DB.listLogs(100);
    box.innerHTML=logs.length?`<div class="tbl-wrap" style="max-height:320px;overflow:auto"><table class="data">
      <thead><tr><th>Masa</th><th>Pengguna</th><th>Aksi</th><th>Butiran</th></tr></thead>
      <tbody>${logs.map(l=>`<tr><td style="white-space:nowrap">${new Date(l.t).toLocaleString('ms-MY')}</td>
        <td>${esc(l.oleh)}</td><td>${esc(l.aksi)}</td><td>${esc(l.detail)}</td></tr>`).join('')}</tbody>
      </table></div>`:'<p style="color:var(--muted)">Tiada log lagi.</p>';
  };

  /* --- Naik Kelas --- */
  $('#s-promote').onclick=async()=>{
    const sesi=APP_CFG.sesi||new Date().getFullYear();
    const ok=await confirmDialog(`PROSES NAIK KELAS ke sesi ${sesi+1}? Murid Tahun 1–5 akan dinaikkan, Tahun 6 ditanda Tamat, dan senarai sesi ${sesi} dibekukan untuk rujukan. Pastikan anda telah memuat turun Backup terlebih dahulu. Proses ini dijalankan SEKALI sahaja setahun.`);
    if(!ok) return;
    const btn=$('#s-promote'); btn.disabled=true; btn.innerHTML='<span class="spinner"></span> Memproses…';
    try{
      const r=await prosesNaikKelas();
      DB.addLog('Proses naik kelas',`sesi ${r.sesi}→${r.sesi+1}: ${r.naik} naik, ${r.tamat} tamat`);
      toast(`Selesai! ${r.naik} murid naik kelas, ${r.tamat} murid Tahun 6 tamat.`+(r.tiadaKelas?` ${r.tiadaKelas} murid tiada kelas padanan — sila tetapkan kelas di Maklumat Murid.`:''),'ok');
      pageTetapan(v);
    }catch(e){ toast(authErr(e),'err'); btn.disabled=false; btn.textContent='Proses Naik Kelas'; }
  };

  /* --- Backup --- */
  $('#s-backup').onclick=async()=>{
    const btn=$('#s-backup'); btn.disabled=true; btn.innerHTML='<span class="spinner"></span>';
    try{
      const bk=await DB.dumpAll();
      const nama=`backup-rmt-skbelukar-${new Date().toISOString().slice(0,10)}.json`;
      const blob=new Blob([JSON.stringify(bk)],{type:'application/json'});
      const url=URL.createObjectURL(blob); const a=document.createElement('a');
      a.href=url; a.download=nama; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      DB.addLog('Muat turun backup',nama);
      toast('Backup dimuat turun: '+nama,'ok');
    }catch(e){ toast(authErr(e),'err'); }
    btn.disabled=false; btn.textContent='⬇ Muat Turun Backup';
  };

  /* --- Pulihkan --- */
  $('#s-restore').onchange=async e=>{
    const f=e.target.files[0]; if(!f)return;
    const ok=await confirmDialog('PULIHKAN dari backup? Data sedia ada akan DITULIS GANTI dengan kandungan fail. Pastikan fail yang betul dipilih.');
    e.target.value='';
    if(!ok) return;
    try{
      const txt=await f.text();
      const bk=JSON.parse(txt);
      await DB.restoreAll(bk);
      await loadConfig();
      DB.addLog('Pulihkan dari backup',f.name);
      toast('Data berjaya dipulihkan dari backup!','ok');
      pageTetapan(v);
    }catch(err){ toast('Gagal pulihkan: '+(err.message||err),'err'); }
  };
}

/* ---------------------------------------------------------
   Helper
--------------------------------------------------------- */
/* ---------------------------------------------------------
   12b. HALAMAN: Hari Persekolahan & Cuti
--------------------------------------------------------- */
async function pageKalendar(v){
  const s=await DB.getSchool();
  let rest = Array.isArray(s.restDays)&&s.restDays.length ? [...s.restDays] : [0,6];
  const holidays=(await DB.listHolidays()).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const dnames=['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
  const sorted=[...rest].sort((a,b)=>a-b);
  const preset = JSON.stringify(sorted)===JSON.stringify([5,6]) ? 'A'
              : JSON.stringify(sorted)===JSON.stringify([0,6]) ? 'B' : 'C';

  const dayToggles=dnames.map((n,i)=>`
    <label style="display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid var(--line);border-radius:10px;cursor:pointer">
      <input type="checkbox" class="rd" value="${i}" ${rest.includes(i)?'checked':''} style="width:auto">
      <span>${n}</span></label>`).join('');

  const holRows=holidays.map(h=>`<tr><td>${esc(h.date)}</td><td>${esc(h.nama)}</td>
      <td class="no-print"><button class="btn btn-sm btn-danger" data-del="${h.id}">Padam</button></td></tr>`).join('')
      || `<tr><td colspan="3" style="color:var(--muted);padding:14px">Belum ada cuti direkod.</td></tr>`;

  if(!onPage('kalendar'))return; // halaman lain sudah dibuka — jangan tindih

  v.innerHTML=`
    <div class="page-head"><h2>Hari Persekolahan &amp; Cuti</h2></div>

    <div class="card" style="max-width:640px;margin-bottom:16px">
      <h3 style="margin:0 0 4px">Hari cuti mingguan</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 14px">
        Tandakan hari yang <b>BUKAN</b> hari persekolahan. Hari tersebut jadi kelabu &amp; tak boleh ditanda dalam borang C8.</p>
      <div class="field"><label>Pilihan pantas</label>
        <select id="k-preset">
          <option value="A" ${preset==='A'?'selected':''}>Kumpulan A — belajar Ahad hingga Khamis (cuti Jumaat &amp; Sabtu)</option>
          <option value="B" ${preset==='B'?'selected':''}>Kumpulan B — belajar Isnin hingga Jumaat (cuti Sabtu &amp; Ahad)</option>
          <option value="C" ${preset==='C'?'selected':''}>Tetapan sendiri</option>
        </select></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:8px;margin:10px 0">${dayToggles}</div>
      <button class="btn btn-primary" id="k-save-days">Simpan Hari Persekolahan</button>
    </div>

    <div class="card" style="max-width:640px;margin-bottom:16px">
      <h3 style="margin:0 0 4px">Muat Kalendar Akademik KPM</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 14px">
        Masukkan semua cuti penggal &amp; perayaan rasmi KPM sekali klik —
        tak perlu taip satu-satu. Tarikh yang sudah wujud akan dilangkau.</p>
      <div class="grid-2">
        <div class="field"><label>Tahun kalendar</label>
          <select id="kk-tahun">${Object.keys(KPM_KALENDAR).sort().map(t=>`<option>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Kumpulan</label>
          <select id="kk-kump">
            <option value="A" ${preset==='A'?'selected':''}>Kumpulan A — Kedah, Kelantan, Terengganu</option>
            <option value="B" ${preset!=='A'?'selected':''}>Kumpulan B — negeri lain</option>
          </select></div>
      </div>
      <label style="display:flex;align-items:center;gap:9px;font-size:13.5px;margin-bottom:14px;cursor:pointer">
        <input type="checkbox" id="kk-umum" checked style="width:auto">
        <span>Sertakan kelepasan am persekutuan bertarikh tetap
          (Hari Pekerja, Hari Kebangsaan, Hari Malaysia, Krismas)</span></label>
      <button class="btn btn-primary" id="kk-load">Muat Kalendar KPM</button>
      <p style="color:var(--muted);font-size:12px;margin:12px 0 0;line-height:1.55">
        <b>Nota:</b> cuti berasaskan kalendar Islam (Awal Muharram, Maulidur Rasul, Aidiladha)
        dan cuti negeri (cth: Hari Keputeraan Sultan) <b>tidak</b> termasuk —
        sila tambah secara manual di bawah. Sekolah di <b>Sarawak</b>: Deepavali ialah
        9 November (bukan 10 November) — sila laraskan.</p>
    </div>

    <div class="card" style="max-width:640px">
      <h3 style="margin:0 0 12px">Cuti / Kelepasan Am</h3>
      <div class="grid-2">
        <div class="field"><label>Tarikh</label><input type="date" id="k-date"></div>
        <div class="field"><label>Nama cuti</label><input id="k-name" placeholder="cth: Hari Raya Aidilfitri"></div>
      </div>
      <button class="btn" id="k-add">${IC.plus} Tambah Cuti</button>
      <div class="tbl-wrap" style="margin-top:14px"><table class="data">
        <thead><tr><th>Tarikh</th><th>Nama</th><th class="no-print">Tindakan</th></tr></thead>
        <tbody id="k-hol">${holRows}</tbody></table></div>
    </div>`;

  const readRest=()=>[...document.querySelectorAll('.rd:checked')].map(c=>+c.value);
  $('#k-preset').onchange=e=>{ const map={A:[5,6],B:[0,6]}; const sel=map[e.target.value];
    if(sel) document.querySelectorAll('.rd').forEach(c=>{c.checked=sel.includes(+c.value);}); };
  document.querySelectorAll('.rd').forEach(c=>c.onchange=()=>{$('#k-preset').value='C';});
  $('#k-save-days').onclick=async()=>{ const rd=readRest();
    await DB.saveSchool({restDays:rd}); APP_CFG.restDays=rd.length?rd:[0,6];
    toast('Hari persekolahan disimpan','ok'); };
  if($('#kk-load')) $('#kk-load').onclick=async()=>{
    const tahun=+$('#kk-tahun').value, kump=$('#kk-kump').value, umum=$('#kk-umum').checked;
    const senarai=binaCutiKPM(tahun,kump,umum);
    if(!senarai.length){toast('Kalendar tahun ini belum tersedia.','err');return;}
    const sedia=new Set((await DB.listHolidays()).map(h=>h.date));
    const baru=senarai.filter(x=>!sedia.has(x.date));
    if(!baru.length){toast('Semua cuti kalendar ini sudah wujud dalam sistem.','info');return;}
    const ok=await confirmDialog(`Tambah ${baru.length} hari cuti dari Kalendar KPM ${tahun} (Kumpulan ${kump})? ${senarai.length-baru.length} tarikh sudah wujud dan akan dilangkau.`);
    if(!ok)return;
    const btn=$('#kk-load'); btn.disabled=true; btn.innerHTML='<span class="spinner"></span> Memuat…';
    try{
      await DB.addHolidaysBulk(baru);
      APP_CFG.holidays=await DB.listHolidays();
      DB.addLog('Muat kalendar KPM',`${tahun} Kumpulan ${kump} · ${baru.length} hari`);
      toast(`${baru.length} hari cuti berjaya dimuat!`,'ok');
      pageKalendar(v);
    }catch(e){ toast(authErr(e),'err'); btn.disabled=false; btn.textContent='Muat Kalendar KPM'; }
  };

  $('#k-add').onclick=async()=>{ const date=$('#k-date').value, nama=$('#k-name').value.trim();
    if(!date||!nama){toast('Isi tarikh & nama cuti','err');return;}
    await DB.addHoliday({date,nama}); APP_CFG.holidays=await DB.listHolidays();
    toast('Cuti ditambah','ok'); pageKalendar(v); };
  document.querySelectorAll('#k-hol [data-del]').forEach(b=>b.onclick=async()=>{
    await DB.delHoliday(b.dataset.del); APP_CFG.holidays=await DB.listHolidays();
    toast('Cuti dipadam','ok'); pageKalendar(v); });
}

const isMobile=()=>{try{return window.innerWidth<=860;}catch(e){return false;}};
const initials=n=>String(n||'').trim().split(/\s+/).filter(w=>!/^(bin|binti|bt|a\/l|a\/p)$/i.test(w))
  .slice(0,2).map(w=>w[0]).join('').toUpperCase();
const avatTone=n=>['','b','a','r'][(String(n||'').length)%4];

// Keadaan kosong bergaya: ikon, tajuk, huraian, tindakan
function emptyRich(tajuk,huraian,butang){
  return `<div class="empty"><div class="eico">${IC.empty}</div>
    <h4>${esc(tajuk)}</h4><p>${esc(huraian)}</p>
    ${butang?`<div class="eact">${butang}</div>`:''}</div>`;
}

function emptyState(msg){return `<div class="empty">${IC.empty}<div>${esc(msg)}</div></div>`;}

// Kecilkan imej (logo) ke saiz max px, pulangkan dataURL PNG (jimat saiz simpanan)
function downscaleImage(file,max,cb){
  const rd=new FileReader();
  rd.onload=()=>{ const img=new Image();
    img.onload=()=>{ let w=img.width,h=img.height; const scale=Math.min(1,max/Math.max(w,h));
      const c=document.createElement('canvas'); c.width=Math.round(w*scale); c.height=Math.round(h*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height); cb(c.toDataURL('image/png')); };
    img.onerror=()=>toast('Fail imej tidak sah','err'); img.src=rd.result; };
  rd.readAsDataURL(file);
}

// Muat turun fail CSV dari pelayar
function downloadCSV(filename,content){
  const blob=new Blob(['\ufeff'+content],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
const CSV_TEMPLATE='nama,mykid,jantina,tahun,kelas,mula,tamat\n'+
  'Ahmad Bin Ali,180101015511,L,1,Tahun 1 Amanah,,\n'+
  'Siti Binti Kamal,180203105522,P,1,Tahun 1 Amanah,,\n'+
  'Murid Masuk Pertengahan,180305045533,L,1,Tahun 1 Amanah,2026-07-01,\n';

/* ---------------------------------------------------------
   13. Mula
--------------------------------------------------------- */
window.closeModal=closeModal;
(async function init(){
  terapkanIdentiti();
  // Firebase: tangani hasil redirect Google (jika popup disekat tadi)
  if(USE_FIREBASE){
    try{
      const rr=await fbAuth.getRedirectResult();
      if(rr && rr.user){ await resolveProfile(rr.user); enterApp(); return; }
    }catch(e){ toast(e.message,'err'); }
  }
  if(restoreSession()){ enterApp(); return; }
  if(USE_FIREBASE){
    fbAuth.onAuthStateChanged(async user=>{
      if(user && !CURRENT){ try{ await resolveProfile(user); enterApp(); }catch(e){ renderAuth(); } }
    });
  }
  renderAuth();

  // PWA service worker
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  }
})();
