/* 临时验证脚本：验证 strengthOf 新旺衰算法（验证后可删除） */
var fs = require('fs'), vm = require('vm'), path = require('path');
var dir = __dirname;
var ctx = { console: console, module: { exports: {} } };
ctx.global = ctx;
vm.createContext(ctx);
/* lunar.js 为 UMD：Node 下挂到 module.exports，需提取为全局供 data/bazi 使用 */
var lctx = { module: { exports: {} } };
vm.createContext(lctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'lib', 'lunar.js'), 'utf8'), lctx, { filename: 'lunar.js' });
Object.keys(lctx.module.exports).forEach(function (k) { ctx[k] = lctx.module.exports[k]; });
function load(f) { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }); }
load('data.js');
load('bazi.js');

var ZHI_DETAIL = ctx.ZHI_DETAIL, GAN_DETAIL = ctx.GAN_DETAIL;

function fakePillars(arr) {
  return arr.map(function (gz, i) {
    return {
      key: ['y', 'm', 'd', 't'][i], gan: gz[0], zhi: gz[1],
      hides: ZHI_DETAIL[gz[1]].hide,
      ganWx: GAN_DETAIL[gz[0]].wx, zhiWx: ZHI_DETAIL[gz[1]].wx
    };
  });
}

function show(name, pillars, dayGan) {
  var s = ctx.strengthOf(pillars, dayGan);
  console.log(name + '  [' + pillars.map(function (p) { return p.gan + p.zhi; }).join(' ') + ']  日主' + dayGan +
    ' → 【' + s.strength + '】 综合分:' + s.final +
    '  令:' + s.sLing + ' 地:' + s.sDi + ' 势:' + s.sShi +
    '  同党:' + s.selfE + ' 异党:' + s.otherE + '(' + Math.round(s.ratio * 100) + '%)');
  if (s.rootList.length) console.log('    比根: ' + s.rootList.join('、') + (s.yinRootList.length ? ' | 印根: ' + s.yinRootList.join('、') : ''));
  if (s.tongGanList.length) console.log('    干助: ' + s.tongGanList.join('、'));
  if (s.notes.length) console.log('    提示: ' + s.notes.join(' | '));
}

/* ---- 真实排盘（案例库两例） ---- */
function realCase(name, opt) {
  try {
    var r = ctx.calcBazi(opt);
    var four = r.pillars.map(function (p) { return p.gan + p.zhi; }).join(' ');
    console.log(name + '  [' + four + ']  日主' + r.dayGan + ' → 【' + r.strength + '】 综合分:' + r.st.final +
      '  令:' + r.st.sLing + ' 地:' + r.st.sDi + ' 势:' + r.st.sShi + '  同党占比:' + Math.round(r.st.ratio * 100) + '%');
    if (r.st.notes.length) console.log('    提示: ' + r.st.notes.join(' | '));
  } catch (e) { console.log(name + ' 计算异常: ' + e.message); }
}

console.log('===== 真实排盘 =====');
realCase('案例A(库:曾标身强)', { y: 1995, m: 8, d: 8, h: 8, min: 30, sex: 0, sect: 2 });
realCase('案例B(库:财旺有印)', { y: 2000, m: 1, d: 1, h: 8, min: 30, sex: 1, sect: 2 });

console.log('\n===== 构造极端 / 边界案例 =====');
/* 1. 满盘比劫 → 专旺 */
show('1.曲直(全木)   ', fakePillars([['甲', '寅'], ['乙', '卯'], ['甲', '寅'], ['乙', '卯']]), '甲');
/* 2. 满盘克泄 → 从弱 */
show('2.克泄交加     ', fakePillars([['庚', '午'], ['庚', '午'], ['甲', '申'], ['庚', '午']]), '甲');
/* 3. 三合水局帮身（壬日 申子辰） */
show('3.三合比局     ', fakePillars([['甲', '申'], ['丙', '子'], ['壬', '辰'], ['辛', '亥']]), '壬');
/* 4. 三合异党局（甲日 申子辰合水=印） */
show('4.三合印局     ', fakePillars([['甲', '申'], ['丙', '子'], ['甲', '辰'], ['甲', '子']]), '甲');
/* 5. 三合异党局（戊日 申子辰合水=财） */
show('5.三合财局     ', fakePillars([['甲', '申'], ['丙', '子'], ['戊', '辰'], ['戊', '子']]), '戊');
/* 6. 冲提纲（甲生卯月，酉来冲） */
show('6.月令被冲     ', fakePillars([['辛', '酉'], ['丁', '卯'], ['甲', '寅'], ['乙', '亥']]), '甲');
/* 7. 印当令（戊生午月） */
show('7.印当令       ', fakePillars([['庚', '申'], ['戊', '午'], ['戊', '午'], ['戊', '戌']]), '戊');
/* 8. 虚浮印比无根（甲日，乙壬透干但支无根） */
show('8.虚浮帮身     ', fakePillars([['癸', '巳'], ['丁', '巳'], ['甲', '午'], ['乙', '巳']]), '甲');
/* 9. 失令但有强根强助（庚日午月，申酉戌+土印） */
show('9.失令根深     ', fakePillars([['戊', '戌'], ['戊', '午'], ['庚', '申'], ['庚', '辰']]), '庚');
/* 10. 得令但泄耗重（辛日申月，水木成势） —— 即案例A同型 */
show('10.得令泄重    ', fakePillars([['乙', '亥'], ['甲', '申'], ['辛', '未'], ['壬', '辰']]), '辛');
/* 11. 中和目标（甲日，春秋平衡） */
show('11.中和之局    ', fakePillars([['癸', '酉'], ['辛', '酉'], ['甲', '寅'], ['甲', '子']]), '甲');
/* 12. 墓库余气根（乙日辰月? 用辛日丑月，丑藏辛余气） */
show('12.余气微根    ', fakePillars([['丙', '子'], ['庚', '丑'], ['辛', '卯'], ['甲', '午']]), '辛');
