const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/app.js'),'utf8');
function calendar(config){
  const ctx=vm.createContext({APP_CFG:{restDays:[0,6],holidays:[],replacementDays:{},...config}});
  vm.runInContext(source.slice(source.indexOf('function daysInMonth('),source.indexOf('const C8_STATE=')),ctx);
  return ctx;
}
test('replacement Saturday and holiday override both exclusions, once only',()=>{
  const c=calendar({holidays:[{date:'2026-10-24',nama:'Cuti'}]});
  const count=c.schoolDays(2026,9).length;
  assert.equal(c.isWeekend(2026,9,24),true);
  assert.equal(c.isHoliday(2026,9,24),true);
  c.APP_CFG.replacementDays['2026-10-24']={nama:'Ganti'};
  assert.equal(c.isWeekend(2026,9,24),false);
  assert.equal(c.isHoliday(2026,9,24),false);
  assert.equal(c.schoolDays(2026,9).length,count+1);
  assert.equal(c.holidayName(2026,9,24),'Sekolah ganti: Ganti');
  delete c.APP_CFG.replacementDays['2026-10-24'];
  assert.equal(c.schoolDays(2026,9).length,count);
});
test('weekday replacement does not double count and Group A weekend works',()=>{
  const c=calendar({restDays:[5,6]});
  const before=c.schoolDays(2026,9).length;
  c.APP_CFG.replacementDays['2026-10-25']={nama:'Ahad'};
  assert.equal(c.schoolDays(2026,9).length,before);
  c.APP_CFG.replacementDays['2026-10-23']={nama:'Jumaat'};
  assert.equal(c.schoolDays(2026,9).length,before+1);
});
test('empty weekend configuration and leap dates',()=>{
  const c=calendar({restDays:[]});
  assert.equal(c.schoolDays(2026,9).length,31);
  assert.equal(c.validCalendarDate('2028-02-29'),true);
  for(const date of ['2026-02-29','2026-13-01','2026-04-31','2026-1-01','invalid'])assert.equal(c.validCalendarDate(date),false,date);
});
