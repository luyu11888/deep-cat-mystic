/* 临时验证脚本：验证公历年月日三段下拉与农历联动（验证后可删除） */
var fs = require('fs'), vm = require('vm'), path = require('path');
var dir = __dirname;

/* ---------- 极简 DOM 模拟 ---------- */
var registry = {};
function reg(el) { if (el.id) registry[el.id] = el; return el; }
function FakeEl(tag, id) {
  this.tagName = (tag || 'div').toUpperCase();
  this.id = id || '';
  this.children = [];
  this._val = '';
  this._html = '';
  this.listeners = {};
  this.dataset = {};
  this.disabled = false;
  this.checked = false;
  this.style = {};
  this.value = '';
  this.text = '';
}
Object.defineProperty(FakeEl.prototype, 'innerHTML', {
  get: function () { return this._html; },
  set: function (h) {
    var el = this;
    el._html = String(h);
    el.children = [];
    /* 注册 <select id=..> 与 <input id=..> */
    var re = /<(select|input)[^>]*\bid="([^"]+)"[^>]*>/g, m;
    while ((m = re.exec(el._html))) {
      var child = new FakeEl(m[1], m[2]);
      child._html = '';
      reg(child); el.children.push(child);
    }
  }
});
Object.defineProperty(FakeEl.prototype, 'value', {
  get: function () {
    if (this._val !== '' && this._val !== null && this._val !== undefined) return this._val;
    if (this.tagName === 'SELECT') {
      var first = this._firstOption();
      if (first !== null) return first;
    }
    return '';
  },
  set: function (v) {
    if (this.tagName === 'SELECT') {
      /* 模拟浏览器：值须匹配某个 option，否则为空 */
      this._val = this._findOption(v) !== null ? String(v) : '';
    } else {
      this._val = (v === undefined || v === null) ? '' : String(v);
    }
  }
});
FakeEl.prototype._options = function () {
  var out = [];
  function walk(el) {
    el.children.forEach(function (c) {
      if (c.tagName === 'OPTION') out.push(c);
      walk(c);
    });
    /* innerHTML 中未实体化的 option：解析 value */
    var re = /<option value="([^"]*)"[^>]*>/g, m;
    while ((m = re.exec(el._html))) {
      out.push({ _v: m[1], text: '' });
    }
  }
  walk(this);
  return out;
};
FakeEl.prototype._findOption = function (v) {
  var opts = this._options();
  for (var i = 0; i < opts.length; i++) {
    if (opts[i].value !== undefined ? opts[i].value == v : opts[i]._v == v) return opts[i];
  }
  return null;
};
FakeEl.prototype._firstOption = function () {
  var opts = this._options();
  if (!opts.length) return null;
  var o = opts[0];
  return o.value !== undefined ? String(o.value) : String(o._v);
};
FakeEl.prototype.appendChild = function (c) { this.children.push(c); if (c.id) reg(c); return c; };
FakeEl.prototype.addEventListener = function (t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); };
FakeEl.prototype.dispatchEvent = function (ev) {
  var ls = this.listeners[ev.type] || [];
  for (var i = 0; i < ls.length; i++) ls[i].call(this, ev);
  return true;
};

var document = {
  readyState: 'loading',
  title: '',
  getElementById: function (id) { return registry[id] || null; },
  createElement: function (tag) { return new FakeEl(tag, ''); },
  createEvent: function () {
    return { type: '', initEvent: function (t) { this.type = t; } };
  },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  addEventListener: function () {}
};
var window = { scrollTo: function () {} };

/* ---------- 注册页面既有元素 ---------- */
['', 'a', 'b'].forEach(function (sc) {
  var p = sc === '' ? 'in' : sc;
  reg(new FakeEl('input', p + '-date'));
  registry[p + '-date'].value = sc === 'b' ? '1998-08-08' : '2000-01-01';
  reg(new FakeEl('div', p + '-ymd'));
  reg(new FakeEl('div', p + '-lunar'));
  reg(new FakeEl('select', p + '-h'));
  reg(new FakeEl('select', p + '-min'));
  reg(new FakeEl('input', p + '-unknown'));
});
reg(new FakeEl('div', 'shopName'));

/* ---------- 加载页面脚本 ---------- */
var ctx = {
  console: console, document: document, window: window,
  localStorage: { getItem: function () { return null; }, setItem: function () {} },
  alert: function (m) { ctx.__alerts = (ctx.__alerts || []).concat([m]); },
  module: { exports: {} }
};
ctx.global = ctx;
vm.createContext(ctx);
var lctx = { module: { exports: {} } };
vm.createContext(lctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'lib', 'lunar.js'), 'utf8'), lctx);
Object.keys(lctx.module.exports).forEach(function (k) { ctx[k] = lctx.module.exports[k]; });
['data.js', 'bazi.js', 'app.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
});
/* 模拟 DOMContentLoaded */
ctx.document.readyState = 'complete';
vm.runInContext('initApp()', ctx);

var $ = function (id) { return registry[id]; };
function fire(el) {
  var ev = { type: 'change' };
  el.dispatchEvent(ev);
}
function pv(id) { return $(id).value; }
var pass = 0, fail = 0;
function chk(name, got, want) {
  var ok = got === want;
  if (ok) pass++; else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  got=' + JSON.stringify(got) + (ok ? '' : '  want=' + JSON.stringify(want)));
}

console.log('===== 初始化 =====');
chk('初始隐藏框 in-date', pv('in-date'), '2000-01-01');
chk('初始年下拉 in-sy', pv('in-sy'), '2000');
chk('初始月下拉 in-sm', pv('in-sm'), '1');
chk('初始日下拉 in-sd', pv('in-sd'), '1');
chk('合盘B默认年 b-sy', pv('b-sy'), '1998');
chk('农历联动初始年 in-ly', pv('in-ly'), '1999'); /* 2000-01-01 = 农历1999-11-25 */

console.log('===== 选年 1995（含日数适配 2 月） =====');
$('in-sy').value = 1995; fire($('in-sy'));
chk('选年后隐藏框', pv('in-date'), '1995-01-01');
chk('农历年跟随', pv('in-ly'), '1994');
$('in-sm').value = 2; fire($('in-sm'));
chk('选 2 月后日期', pv('in-date'), '1995-02-01');
chk('1995 年 2 月天数=28', String($('in-sd')._options().length), '28');
$('in-sd').value = 28; fire($('in-sd'));
chk('选 28 日生效', pv('in-date'), '1995-02-28');

console.log('===== 换闰年 2024 检查 2 月 29 日存在 =====');
$('in-sy').value = 2024; fire($('in-sy'));
chk('2024 年保持月 2', pv('in-sm'), '2');
chk('2024 年 2 月天数=29', String($('in-sd')._options().length), '29');
$('in-sd').value = 29; fire($('in-sd'));
chk('2024-02-29 有效', pv('in-date'), '2024-02-29');
$('in-sy').value = 2023; fire($('in-sy'));
chk('2023-02-29 钳制为 28', pv('in-date'), '2023-02-28');

console.log('===== 大月 31 天 / 小月 30 天 =====');
$('in-sy').value = 1990; fire($('in-sy'));
$('in-sm').value = 1; fire($('in-sm'));
$('in-sd').value = 31; fire($('in-sd'));
chk('1990-01-31', pv('in-date'), '1990-01-31');
$('in-sm').value = 4; fire($('in-sm'));
chk('4 月无 31 日→30', pv('in-date'), '1990-04-30');

console.log('===== 农历→公历反向联动 =====');
$('in-ly').value = 1995; fire($('in-ly'));
chk('农历1995年→公历年', pv('in-sy'), '1995');
chk('农历1995年→in-date 年份', pv('in-date').split('-')[0], '1995');
$('in-ld').value = 15; fire($('in-ld'));
/* 农历四月十五 → 公历 1995-05-14：校验三段下拉与隐藏框一致即可 */
chk('农历改日→公历三段同步', pv('in-sy') + '-' + (pv('in-sm') < 10 ? '0' : '') + pv('in-sm') + '-' + (pv('in-sd') < 10 ? '0' : '') + pv('in-sd'), pv('in-date'));

console.log('===== setSolarAndSync（试例/今日按钮路径） =====');
ctx.setSolarAndSync('', '1988-06-15');
chk('三段下拉同步年', pv('in-sy'), '1988');
chk('三段下拉同步月', pv('in-sm'), '6');
chk('三段下拉同步日', pv('in-sd'), '15');
chk('隐藏框', pv('in-date'), '1988-06-15');
chk('农历同步年', pv('in-ly'), '1988');
ctx.setSolarAndSync('b', '1975-12-31');
chk('合盘B同步', pv('b-sy') + '-' + pv('b-sm') + '-' + pv('b-sd'), '1975-12-31');

console.log('===== readPicker 读取 =====');
var o = ctx.readPicker('');
chk('readPicker y', o.y, 1988);
chk('readPicker m', o.m, 6);
chk('readPicker d', o.d, 15);
chk('readPicker h', o.h, 8);
chk('readPicker min', o.min, 30);

console.log('\n结果：' + pass + ' 通过，' + fail + ' 失败');
