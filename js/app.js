/* =========================================================
   RMT Attendance SK Belukar — app.js
   Mod Firebase (bila config diisi) ATAU Mod Demo (localStorage)
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   0. Ikon (SVG inline, Material-style)
--------------------------------------------------------- */
const IC = {
  dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/><path d="M8 2v4M16 2v4"/></svg>',
  student:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>',
  teacher:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>',
  cls:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18v12H3z"/><path d="M3 21h18"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L3.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2h5l.3-2a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
  empty:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/></svg>'
};

const MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const DAYNAMES = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const ROLES = ['Administrator','Guru Besar','PK HEM','Guru RMT','Guru Kelas','Pembantu Tadbir'];

/* ---------------------------------------------------------
   1. Utiliti UI
--------------------------------------------------------- */
const $  = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

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

const LS_KEY='rmt_skb_demo_v1';
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

// Konfigurasi kalendar global (hari cuti mingguan + cuti/kelepasan am)
// restDays: nombor hari (0=Ahad,1=Isnin,...,6=Sabtu) yang BUKAN hari persekolahan.
// Lalai [0,6] = Sabtu & Ahad (Kumpulan B). Kumpulan A = [5,6] (Jumaat & Sabtu).
let APP_CFG={restDays:[0,6],holidays:[]};
async function loadConfig(){
  try{
    const s=await DB.getSchool();
    APP_CFG.restDays = Array.isArray(s.restDays)&&s.restDays.length? s.restDays : [0,6];
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
  sessionStorage.setItem('rmt_current',JSON.stringify(CURRENT));
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
    sessionStorage.setItem('rmt_current',JSON.stringify(CURRENT));
  }
}
function restoreSession(){
  try{const c=sessionStorage.getItem('rmt_current');if(c){CURRENT=JSON.parse(c);return true;}}catch(e){}
  return false;
}
async function doLogout(){
  if(USE_FIREBASE) await fbAuth.signOut();
  CURRENT=null; sessionStorage.removeItem('rmt_current');
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
  sessionStorage.setItem('rmt_current',JSON.stringify(CURRENT));
}

/* ---------------------------------------------------------
   4. Skrin LOG MASUK / DAFTAR
--------------------------------------------------------- */
function renderAuth(mode){
  mode=mode||'login';
  $('#app').classList.remove('active');
  const root=$('#auth'); root.style.display='grid';
  const modeTag = USE_FIREBASE
     ? '<p style="color:var(--blue);font-size:12px">Mod Firebase aktif</p>'
     : '<p style="color:var(--warn);font-size:12px">Mod Demo — data dalam pelayar ini sahaja</p>';
  const brand=`<div class="auth-brand">
        <div class="auth-logo">RMT</div>
        <h1>RMT Attendance SK Belukar</h1>
        <p>Rekod Kehadiran Murid RMT · Borang C8 KPM</p>${modeTag}</div>`;

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
      try{ await doRegister(nama,email,p1); toast('Akaun berjaya didaftar!','ok'); enterApp(); }
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
      try{ await doGoogleLogin(); if(CURRENT) enterApp(); }
      catch(e){ toast(authErr(e),'err'); gb.disabled=false; gb.innerHTML=`${googleG} Log masuk dengan Google`; }
    };
  }
  const submit=async()=>{
    const btn=$('#lg-btn'); const u=$('#lg-user').value.trim(); const p=$('#lg-pass').value;
    if(!u||!p){toast('Isi emel dan kata laluan.','err');return;}
    btn.disabled=true; btn.innerHTML='<span class="spinner"></span>';
    try{ await doLogin(u,p); enterApp(); }
    catch(e){ toast(authErr(e),'err'); btn.disabled=false; btn.textContent='Log Masuk'; }
  };
  $('#lg-btn').onclick=submit;
  $('#lg-pass').addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
}

/* ---------------------------------------------------------
   5. Rangka aplikasi + navigasi
--------------------------------------------------------- */
const NAV=[
  {id:'dashboard',label:'Dashboard',short:'Utama',icon:'dash',all:true},
  {id:'kehadiran',label:'Kehadiran (C8)',short:'Kehadiran',icon:'check',all:true},
  {id:'murid',label:'Maklumat Murid',short:'Murid',icon:'student',all:true},
  {id:'borang',label:'Borang C1/C2',short:'Borang',icon:'file',all:true},
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
  const bitems=navList.map(n=>
    `<div class="bnav-item" data-nav="${n.id}">${IC[n.icon]}<span>${n.short||n.label}</span></div>`).join('');
  $('#app').innerHTML=`
    <div class="topbar">
      <div class="brand"><span class="logo">RMT</span><span class="hide-sm">SK Belukar</span></div>
      <div class="spacer"></div>
      <button class="icon-btn" id="darkBtn" title="Mod gelap">${IC.moon}</button>
      <div class="user-chip"><span>${esc(CURRENT.nama)}</span><span class="role">· ${esc(CURRENT.role)}</span></div>
      <button class="icon-btn" id="logoutBtn" title="Log keluar">${IC.logout}</button>
    </div>
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        ${items}
        <div class="nav-sep"></div>
        <div class="nav-item" id="nav-logout">${IC.logout}<span>Log Keluar</span></div>
      </aside>
      <main class="content" id="view"></main>
    </div>
    <nav class="bottom-nav" id="bnav">${bitems}</nav>`;
  $('#logoutBtn').onclick=$('#nav-logout').onclick=doLogout;
  $('#darkBtn').onclick=toggleDark;
  $$('.nav-item[data-nav], .bnav-item[data-nav]').forEach(el=>el.onclick=()=>{
    location.hash='#'+el.dataset.nav;
  });
}

function setActiveNav(id){
  $$('.nav-item[data-nav], .bnav-item[data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav===id));
}

function route(){
  if(!CURRENT){renderAuth();return;}
  const page=(location.hash||'#dashboard').slice(1);
  setActiveNav(page);
  const v=$('#view'); if(!v)return;
  v.innerHTML='<div class="center-load"><span class="spinner dark"></span></div>';
  ({dashboard:pageDashboard,kehadiran:pageKehadiran,murid:pageMurid,
    kelas:pageKelas,guru:pageGuru,kalendar:pageKalendar,borang:pageBorang,tetapan:pageTetapan}[page]||pageDashboard)(v);
}
window.addEventListener('hashchange',route);

/* Dark mode */
function toggleDark(){
  const d=document.documentElement.getAttribute('data-theme')==='dark'?'':'dark';
  document.documentElement.setAttribute('data-theme',d);
  localStorage.setItem('rmt_theme',d);
}
(function initTheme(){const t=localStorage.getItem('rmt_theme');if(t)document.documentElement.setAttribute('data-theme',t);})();

/* ---------------------------------------------------------
   6. HALAMAN: Papan Pemuka
--------------------------------------------------------- */
async function pageDashboard(v){
  const [students,classes,users,school]=await Promise.all([DB.getStudents(),DB.getClasses(),DB.getUsers(),DB.getSchool()]);
  const rmtAktif=students.filter(s=>s.statusRMT==='Aktif');
  const today=new Date(); const y=today.getFullYear(),m=today.getMonth(),d=today.getDate();
  // hadir hari ini merentas semua kelas
  let hadir=0,tidak=0;
  for(const c of classes){
    const rec=await DB.getAttendance(c.id,y,m);
    for(const s of rmtAktif.filter(x=>x.kelasId===c.id)){
      const mark=rec[s.id]?.[d];
      if(mark==='H')hadir++; else if(mark==='X')tidak++;
    }
  }
  const teachers=users.filter(u=>u.role.startsWith('Guru'));
  const monthly=await buildMonthlyChart(classes,rmtAktif,y);

  v.innerHTML=`
    <div class="page-head"><h2>Dashboard</h2><div class="spacer"></div>
      <span class="badge b">${esc(school.nama)}</span></div>
    <div class="stat-grid">
      ${stat('g',IC.student,rmtAktif.length,'Murid RMT aktif')}
      ${stat('b',IC.cls,classes.length,'Jumlah kelas')}
      ${stat('g',IC.check,hadir,'Hadir hari ini ('+d+' '+MONTHS[m]+')')}
      ${stat('r',IC.check,tidak,'Tidak hadir hari ini')}
      ${stat('b',IC.teacher,teachers.length,'Jumlah guru')}
      ${stat('o',IC.teacher,users.length,'Jumlah pengguna')}
    </div>
    <div class="card">
      <h3 style="margin:0 0 4px">Peratus kehadiran bulanan · ${y}</h3>
      <p style="color:var(--muted);margin:0 0 14px;font-size:13px">Purata kehadiran murid RMT setiap bulan</p>
      ${monthly}
    </div>`;
}
function stat(cls,ico,val,lbl){
  return `<div class="stat ${cls}"><div class="ico">${ico}</div>
    <div class="txt"><div class="val">${val}</div><div class="lbl">${lbl}</div></div></div>`;
}
async function buildMonthlyChart(classes,students,year){
  const pcts=[];
  for(let m=0;m<12;m++){
    let hadirCount=0,shouldCount=0;
    const days=schoolDays(year,m);
    for(const c of classes){
      const rec=await DB.getAttendance(c.id,year,m);
      const cs=students.filter(s=>s.kelasId===c.id);
      for(const s of cs){ for(const day of days){ const mk=rec[s.id]?.[day];
        if(mk){shouldCount++; if(mk==='H')hadirCount++;} }}
    }
    pcts.push(shouldCount? Math.round(hadirCount/shouldCount*100):0);
  }
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
  let allowed = isAdmin() ? classes : classes.filter(c=>c.id===CURRENT.kelasId||c.guruId===CURRENT.id);
  if(!allowed.length){
    v.innerHTML=emptyState('Tiada kelas diperuntukkan kepada anda. Sila hubungi Administrator.'); return;
  }
  if(!C8_STATE.kelasId||!allowed.find(c=>c.id===C8_STATE.kelasId)) C8_STATE.kelasId=allowed[0].id;

  const clsOpts=allowed.map(c=>`<option value="${c.id}" ${c.id===C8_STATE.kelasId?'selected':''}>Tahun ${c.tahun} ${esc(c.nama)}</option>`).join('');
  const moOpts=MONTHS.map((mm,i)=>`<option value="${i}" ${i===C8_STATE.month?'selected':''}>${mm}</option>`).join('');
  const yNow=new Date().getFullYear();
  const yOpts=[yNow-1,yNow,yNow+1].map(yy=>`<option value="${yy}" ${yy===C8_STATE.year?'selected':''}>${yy}</option>`).join('');

  v.innerHTML=`
    <div class="page-head"><h2>Rekod Kehadiran Murid RMT</h2><div class="spacer"></div>
      <button class="btn btn-blue" id="printC8">${IC.print} Cetak / PDF</button></div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Kelas</label><select id="c8-kelas">${clsOpts}</select></div>
      <div class="field"><label>Bulan</label><select id="c8-bulan">${moOpts}</select></div>
      <div class="field"><label>Tahun</label><select id="c8-tahun">${yOpts}</select></div>
      <span class="c8-save-tag" id="c8-save"></span>
    </div>
    <div id="c8-holder"></div>
    <div class="c8-legend no-print">
      <span><i style="background:var(--card)"></i> Hadir (H/✓)</span>
      <span><i style="background:var(--card);color:var(--danger)">✕</i> Tidak hadir (X)</span>
      <span><i style="background:var(--weekend)"></i> Cuti mingguan (ikut Kumpulan A/B)</span>
      <span><i style="background:var(--holiday)"></i> Cuti umum</span>
      <span>Klik sel untuk kitar: kosong → ✓ → ✕ → kosong (auto simpan)</span>
    </div>`;

  $('#c8-kelas').onchange=e=>{C8_STATE.kelasId=e.target.value;renderC8();};
  $('#c8-bulan').onchange=e=>{C8_STATE.month=+e.target.value;renderC8();};
  $('#c8-tahun').onchange=e=>{C8_STATE.year=+e.target.value;renderC8();};
  $('#printC8').onclick=printC8;
  renderC8();
}

async function renderC8(){
  const holder=$('#c8-holder'); if(!holder)return;
  holder.innerHTML='<div class="center-load"><span class="spinner dark"></span></div>';
  const {kelasId,year,month}=C8_STATE;
  const [students,classes,school]=await Promise.all([DB.getStudents(),DB.getClasses(),DB.getSchool()]);
  const cls=classes.find(c=>c.id===kelasId);
  const roster=students.filter(s=>s.kelasId===kelasId && s.statusRMT==='Aktif')
                       .sort((a,b)=>a.nama.localeCompare(b.nama));
  const rec=await DB.getAttendance(kelasId,year,month);
  // rekod bulan lepas (untuk kolum "BULAN LEPAS")
  const pm = month===0?11:month-1, py = month===0?year-1:year;
  const recPrev=await DB.getAttendance(kelasId,py,pm);

  const nDays=daysInMonth(year,month);
  const dayCells=[];
  for(let d=1;d<=nDays;d++) dayCells.push({d,we:isWeekend(year,month,d),hol:isHoliday(year,month,d)});

  // ---- header ----
  const dayTh=dayCells.map(c=>`<th class="col-day ${c.we?'we':''} ${c.hol?'hol':''}">${c.d}</th>`).join('');
  const bulanLabel=`${MONTHS[month]} ${year}`;

  // ---- baris murid ----
  let bodyRows='';
  roster.forEach((s,i)=>{
    const sr=rec[s.id]||{};
    let hadir=0,absSemasa=0;
    const cells=dayCells.map(c=>{
      const mk=sr[c.d]; if(mk==='H')hadir++; if(mk==='X')absSemasa++;
      const cls=[c.we?'we':'',c.hol?'hol':'',mk==='H'?'present':'',mk==='X'?'absent':''].join(' ');
      const sym=mk==='H'?'✓':mk==='X'?'✕':'';
      const clickable=(!c.we&&!c.hol);
      return `<td class="day ${cls}" data-sid="${s.id}" data-day="${c.d}" ${clickable?'':'data-lock="1"'}>${sym}</td>`;
    }).join('');
    // bulan lepas: bilangan X
    const prev=recPrev[s.id]||{}; let absLepas=0; Object.values(prev).forEach(x=>{if(x==='X')absLepas++;});
    const jumlahSemua=absSemasa+absLepas;
    bodyRows+=`<tr>
      <td class="col-bil">${i+1}</td>
      <td class="name col-nama">${esc(s.nama)}</td>
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

  holder.innerHTML=`
    <div class="c8-scroll">
      <table class="c8">
        <thead>
          <tr><td class="c8-title" colspan="${5+nDays+3}">
            ${school.logo?`<img src="${school.logo}" style="height:32px;vertical-align:middle;margin-right:10px">`:''}
            ${esc(school.nama)} &nbsp;·&nbsp; REKOD KEHADIRAN MURID RMT &nbsp;·&nbsp; ${bulanLabel}
            &nbsp;·&nbsp; ${esc('Tahun '+cls.tahun+' '+cls.nama)}
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
  // klik sel
  $$('.c8 td.day').forEach(td=>{
    if(td.dataset.lock)return;
    td.onclick=()=>cycleCell(td);
  });
}

async function cycleCell(td){
  const sid=td.dataset.sid, day=+td.dataset.day;
  const cur=td.classList.contains('present')?'H':td.classList.contains('absent')?'X':'';
  const next={'':'H','H':'X','X':''}[cur];
  // kemas kini paparan segera (optimistik)
  td.classList.remove('present','absent'); td.textContent='';
  if(next==='H'){td.classList.add('present');td.textContent='✓';}
  if(next==='X'){td.classList.add('absent');td.textContent='✕';}
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
  let allowed = isAdmin() ? classes : classes.filter(c=>c.id===CURRENT.kelasId||c.guruId===CURRENT.id);
  if(!allowed.length){ v.innerHTML=emptyState('Tiada kelas diperuntukkan kepada anda.'); return; }
  if(!BORANG_STATE.kelasId||!allowed.find(c=>c.id===BORANG_STATE.kelasId)) BORANG_STATE.kelasId=allowed[0].id;

  const clsOpts=allowed.map(c=>`<option value="${c.id}" ${c.id===BORANG_STATE.kelasId?'selected':''}>Tahun ${c.tahun} ${esc(c.nama)}</option>`).join('');
  const yNow=new Date().getFullYear();
  const yOpts=[yNow-1,yNow,yNow+1].map(y=>`<option ${y===BORANG_STATE.year?'selected':''}>${y}</option>`).join('');

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
  holder.innerHTML='<div class="center-load"><span class="spinner dark"></span></div>';
  const {jenis,kelasId,year}=BORANG_STATE;
  const students=(await DB.getStudents()).filter(s=>s.kelasId===kelasId&&s.statusRMT==='Aktif')
    .sort((a,b)=>a.nama.localeCompare(b.nama));
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
      <b>KELAS</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: TAHUN ${cls.tahun||''} ${esc((cls.nama||'').toUpperCase())} &nbsp;&nbsp;&nbsp; <b>TAHUN:</b> ${year}
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

/* Cetakan rasmi C8 — dokumen berasingan, A4 landscape, gaya borang KPM */
async function printC8(){
  const src=$('.c8');
  if(!src){toast('Borang belum dipaparkan.','err');return;}
  const {kelasId,year,month}=C8_STATE;
  const [school,classes,users]=await Promise.all([DB.getSchool(),DB.getClasses(),DB.getUsers()]);
  const cls=classes.find(c=>c.id===kelasId)||{};
  const guru=users.find(u=>u.id===cls.guruId);

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
        <div class="t2">REKOD KEHADIRAN MURID RMT</div>
      </div>
      <div class="tag">BORANG C8</div>
    </div>
    <div class="info">
      <div><b>BULAN:</b> ${MONTHS[month].toUpperCase()} ${year}</div>
      <div><b>KELAS:</b> TAHUN ${cls.tahun||''} ${esc((cls.nama||'').toUpperCase())}</div>
      <div><b>GURU KELAS:</b> ${esc(guru?guru.nama.toUpperCase():'—')}</div>
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
  const clsName=id=>{const c=classes.find(x=>x.id===id);return c?`Tahun ${c.tahun} ${c.nama}`:'—';};
  let list=students;
  if(!isAdmin()) list=list.filter(s=>s.kelasId===CURRENT.kelasId);
  if(MURID_FILTER.q) list=list.filter(s=>s.nama.toLowerCase().includes(MURID_FILTER.q.toLowerCase()));
  if(MURID_FILTER.kelasId) list=list.filter(s=>s.kelasId===MURID_FILTER.kelasId);
  if(MURID_FILTER.statusRMT) list=list.filter(s=>s.statusRMT===MURID_FILTER.statusRMT);
  list.sort((a,b)=>a.nama.localeCompare(b.nama));

  const clsOpts=`<option value="">Semua kelas</option>`+classes.map(c=>`<option value="${c.id}" ${MURID_FILTER.kelasId===c.id?'selected':''}>Tahun ${c.tahun} ${esc(c.nama)}</option>`).join('');
  const rows=list.map((s,i)=>`<tr>
      <td>${i+1}</td><td>${esc(s.nama)}</td><td>${esc(s.mykid||'—')}</td>
      <td>${s.jantina==='L'?'Lelaki':'Perempuan'}</td><td>${esc(clsName(s.kelasId))}</td>
      <td><span class="badge ${s.statusRMT==='Aktif'?'ok':'off'}">${esc(s.statusRMT)}</span></td>
      <td class="no-print" style="white-space:nowrap">
        <button class="btn btn-sm" data-edit="${s.id}">Edit</button>
        ${isAdmin()?`<button class="btn btn-sm btn-danger" data-del="${s.id}">Padam</button>`:''}
      </td></tr>`).join('') || `<tr><td colspan="7">${emptyState('Tiada murid dijumpai.')}</td></tr>`;

  v.innerHTML=`
    <div class="page-head"><h2>Maklumat Murid</h2><div class="spacer"></div>
      ${isAdmin()?`<button class="btn" id="impBtn">Import CSV</button>
      <button class="btn btn-primary" id="addBtn">${IC.plus} Tambah Murid</button>`:''}
    </div>
    <div class="c8-toolbar no-print">
      <div class="field"><label>Cari nama</label><input id="f-q" value="${esc(MURID_FILTER.q)}" placeholder="Nama murid…"></div>
      <div class="field"><label>Kelas</label><select id="f-kelas">${clsOpts}</select></div>
      <div class="field"><label>Status RMT</label><select id="f-status">
        <option value="">Semua</option>
        <option ${MURID_FILTER.statusRMT==='Aktif'?'selected':''}>Aktif</option>
        <option ${MURID_FILTER.statusRMT==='Tidak Aktif'?'selected':''}>Tidak Aktif</option></select></div>
      <span style="align-self:center;color:var(--muted);font-size:13px">${list.length} murid</span>
    </div>
    <div class="tbl-wrap"><table class="data">
      <thead><tr><th>Bil</th><th>Nama Penuh</th><th>No. MyKid</th><th>Jantina</th><th>Kelas</th><th>Status RMT</th><th class="no-print">Tindakan</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;

  $('#f-q').oninput=e=>{MURID_FILTER.q=e.target.value;pageMurid(v);};
  $('#f-kelas').onchange=e=>{MURID_FILTER.kelasId=e.target.value;pageMurid(v);};
  $('#f-status').onchange=e=>{MURID_FILTER.statusRMT=e.target.value;pageMurid(v);};
  if($('#addBtn'))$('#addBtn').onclick=()=>studentModal(null,classes,v);
  if($('#impBtn'))$('#impBtn').onclick=()=>importCSVModal(classes,v);
  $$('[data-edit]').forEach(b=>b.onclick=()=>studentModal(students.find(s=>s.id===b.dataset.edit),classes,v));
  $$('[data-del]').forEach(b=>b.onclick=async()=>{
    if(await confirmDialog('Padam murid ini?')){await DB.delStudent(b.dataset.del);toast('Murid dipadam','ok');pageMurid(v);}});
}

function studentModal(s,classes,v){
  const isEdit=!!s; s=s||{jantina:'L',statusRMT:'Aktif',tahun:1};
  const clsOpts=classes.map(c=>`<option value="${c.id}" ${s.kelasId===c.id?'selected':''}>Tahun ${c.tahun} ${esc(c.nama)}</option>`).join('');
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
        <div class="field"><label>Kelas</label><select id="m-kelas">${clsOpts}</select></div>
      </div>
      <div class="field"><label>Status RMT</label><select id="m-status">
        <option ${s.statusRMT==='Aktif'?'selected':''}>Aktif</option>
        <option ${s.statusRMT==='Tidak Aktif'?'selected':''}>Tidak Aktif</option></select></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="m-save">Simpan</button></div>`);
  $('#m-save').onclick=async()=>{
    const nama=$('#m-nama').value.trim(); if(!nama){toast('Nama wajib diisi','err');return;}
    const obj={...(isEdit?{id:s.id}:{}),nama,mykid:$('#m-kid').value.trim(),jantina:$('#m-jan').value,
      tahun:+$('#m-thn').value,kelasId:$('#m-kelas').value,statusRMT:$('#m-status').value};
    await DB.saveStudent(obj); closeModal(); toast('Murid disimpan','ok'); pageMurid(v);
  };
}

function importCSVModal(classes,v){
  openModal(`
    <div class="modal-head"><h3>Import Murid (CSV)</h3><div style="flex:1"></div>
      <button class="icon-btn" onclick="closeModal()">${IC.x}</button></div>
    <div class="modal-body">
      <p style="margin-top:0;color:var(--muted);font-size:13px">
        Format tajuk: <code>nama,mykid,jantina,tahun,kelas</code><br>
        jantina = L atau P · kelas = padanan "Tahun X Nama" (cth: Tahun 1 Amanah).</p>
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
      let cls=classes.find(c=>`tahun ${c.tahun} ${c.nama}`.toLowerCase()===kelasName)
            ||classes.find(c=>c.nama.toLowerCase()===kelasName&&c.tahun===tahun);
      await DB.saveStudent({nama,mykid:(p[idx('mykid')]||'').trim(),
        jantina:((p[idx('jantina')]||'L').trim().toUpperCase().startsWith('P'))?'P':'L',
        tahun,kelasId:cls?cls.id:(classes[0]?.id||''),statusRMT:'Aktif'});
      ok++;
    }
    closeModal(); toast(ok+' murid diimport','ok'); pageMurid(v);
  };
}

/* ---------------------------------------------------------
   10. HALAMAN: Kelas
--------------------------------------------------------- */
async function pageKelas(v){
  const [classes,users,students]=await Promise.all([DB.getClasses(),DB.getUsers(),DB.getStudents()]);
  const gName=id=>{const u=users.find(x=>x.id===id);return u?u.nama:'—';};
  const count=id=>students.filter(s=>s.kelasId===id).length;
  classes.sort((a,b)=>a.tahun-b.tahun||a.nama.localeCompare(b.nama));
  const rows=classes.map((c,i)=>`<tr>
    <td>${i+1}</td><td>Tahun ${c.tahun} ${esc(c.nama)}</td><td>${esc(gName(c.guruId))}</td>
    <td><span class="badge b">${count(c.id)} murid</span></td>
    <td class="no-print" style="white-space:nowrap"><button class="btn btn-sm" data-edit="${c.id}">Edit</button>
      <button class="btn btn-sm btn-danger" data-del="${c.id}">Padam</button></td></tr>`).join('')
    || `<tr><td colspan="5">${emptyState('Belum ada kelas.')}</td></tr>`;
  v.innerHTML=`
    <div class="page-head"><h2>Maklumat Kelas</h2><div class="spacer"></div>
      <button class="btn btn-primary" id="addBtn">${IC.plus} Tambah Kelas</button></div>
    <div class="tbl-wrap"><table class="data"><thead><tr>
      <th>Bil</th><th>Kelas</th><th>Guru Kelas</th><th>Bil. Murid</th><th class="no-print">Tindakan</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  $('#addBtn').onclick=()=>classModal(null,users,v);
  $$('[data-edit]').forEach(b=>b.onclick=()=>classModal(classes.find(c=>c.id===b.dataset.edit),users,v));
  $$('[data-del]').forEach(b=>b.onclick=async()=>{
    if(await confirmDialog('Padam kelas ini?')){await DB.delClass(b.dataset.del);toast('Kelas dipadam','ok');pageKelas(v);}});
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
        <div class="field"><label>Tahun</label><select id="c-thn">${[1,2,3,4,5,6].map(t=>`<option ${c.tahun===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label>Nama kelas</label><input id="c-nama" value="${esc(c.nama)}" placeholder="Amanah"></div>
      </div>
      <div class="field"><label>Guru kelas</label><select id="c-guru">${gOpts}</select></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" id="c-save">Simpan</button></div>`);
  $('#c-save').onclick=async()=>{
    const nama=$('#c-nama').value.trim(); if(!nama){toast('Nama kelas wajib','err');return;}
    await DB.saveClass({...(isEdit?{id:c.id}:{}),tahun:+$('#c-thn').value,nama,guruId:$('#c-guru').value||null});
    closeModal(); toast('Kelas disimpan','ok'); pageKelas(v);
  };
}

/* ---------------------------------------------------------
   11. HALAMAN: Guru & Pengguna
--------------------------------------------------------- */
async function pageGuru(v){
  const [users,classes]=await Promise.all([DB.getUsers(),DB.getClasses()]);
  const clsName=id=>{const c=classes.find(x=>x.id===id);return c?`Tahun ${c.tahun} ${c.nama}`:'—';};
  const rows=users.map((u,i)=>`<tr>
    <td>${i+1}</td><td>${esc(u.nama)}</td><td>${esc(u.role)}</td><td>${esc(u.username||u.email||'—')}</td>
    <td>${esc(u.kelasId?clsName(u.kelasId):'—')}</td>
    <td><span class="badge ${u.aktif?'ok':'off'}">${u.aktif?'Aktif':'Tidak Aktif'}</span></td>
    <td class="no-print" style="white-space:nowrap"><button class="btn btn-sm" data-edit="${u.id}">Edit</button>
      <button class="btn btn-sm btn-danger" data-del="${u.id}">Padam</button></td></tr>`).join('');
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
    if(await confirmDialog('Padam pengguna ini?')){await DB.delUser(b.dataset.del);toast('Pengguna dipadam','ok');pageGuru(v);}});
}
function userModal(u,classes,v){
  const isEdit=!!u; u=u||{role:'Guru Kelas',aktif:true};
  const roleOpts=ROLES.map(r=>`<option ${u.role===r?'selected':''}>${r}</option>`).join('');
  const clsOpts=`<option value="">— Tiada —</option>`+classes.map(c=>`<option value="${c.id}" ${u.kelasId===c.id?'selected':''}>Tahun ${c.tahun} ${esc(c.nama)}</option>`).join('');
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
    await DB.saveUser(obj); closeModal(); toast('Pengguna disimpan','ok'); pageGuru(v);
  };
}

/* ---------------------------------------------------------
   12. HALAMAN: Tetapan Sekolah
--------------------------------------------------------- */
async function pageTetapan(v){
  const s=await DB.getSchool();
  let logoData=s.logo||'';
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
    toast('Tetapan disimpan','ok');
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
  $('#k-add').onclick=async()=>{ const date=$('#k-date').value, nama=$('#k-name').value.trim();
    if(!date||!nama){toast('Isi tarikh & nama cuti','err');return;}
    await DB.addHoliday({date,nama}); APP_CFG.holidays=await DB.listHolidays();
    toast('Cuti ditambah','ok'); pageKalendar(v); };
  document.querySelectorAll('#k-hol [data-del]').forEach(b=>b.onclick=async()=>{
    await DB.delHoliday(b.dataset.del); APP_CFG.holidays=await DB.listHolidays();
    toast('Cuti dipadam','ok'); pageKalendar(v); });
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
const CSV_TEMPLATE='nama,mykid,jantina,tahun,kelas\nAhmad Bin Ali,180101015511,L,1,Tahun 1 Amanah\nSiti Binti Kamal,180203105522,P,1,Tahun 1 Amanah\n';

/* ---------------------------------------------------------
   13. Mula
--------------------------------------------------------- */
window.closeModal=closeModal;
(async function init(){
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
