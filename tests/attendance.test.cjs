const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/app.js'),'utf8');
function setup(data){
  const calls=[];
  const ctx=vm.createContext({DB:{getAttendance:async (kelas,year,month)=>{calls.push([kelas,year,month]);return data[month]||{};}}});
  vm.runInContext(source.slice(source.indexOf('async function cumulativeAbsences('),source.indexOf('async function renderC8(')),ctx);
  return {ctx,calls};
}
test('Mac carries January and February absences for each student',async()=>{
  const {ctx,calls}=setup([{a:{1:'X',2:'H',3:'X'},b:{1:'X'}},{a:{1:'X'},b:{1:'H'}}]);
  const result=await ctx.cumulativeAbsences('kelas',2026,2);
  assert.equal(result.a,3); assert.equal(result.b,1);
  assert.deepEqual(calls,[['kelas',2026,0],['kelas',2026,1]]);
});
test('January starts a new year and missing months are zero',async()=>{
  const {ctx,calls}=setup([]);
  assert.deepEqual(Object.keys(await ctx.cumulativeAbsences('kelas',2026,0)),[]);
  assert.equal(calls.length,0);
  assert.deepEqual(Object.keys(await ctx.cumulativeAbsences('kelas',2026,3)),[]);
  assert.equal(calls.length,3);
});
