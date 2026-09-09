/* ============================================================
 * xz-music.js — 深情猫玄学馆 · 全馆「玄乐」迷你背景乐播放器（共享版）
 *
 * 引用方式（放在页面 <body> 末尾，同步加载即可）：
 *   主页：  <script src="xz-music.js"></script>
 *   分馆页：<script src="../xz-music.js"></script>
 *
 * 形态：常态只是一个 26px 小圆钮（几乎不遮内容），
 *       - 播放中：钮内四根音柱跳动；暂停：显示 ▶；
 *       - 鼠标悬停 / 键盘聚焦时向左滑出曲名（触屏不展开，永远只留圆钮）；
 *       - 浏览器拦下自动播放时，圆钮上方浮现小气泡「轻触起乐」，
 *         首次任意点击 / 触屏 / 回车即自动鸣响，随后气泡短暂亮出曲名。
 *
 * 曲目与位置等全部可调：改下方 CFG 即可，全馆 5 页同步生效。
 * ============================================================ */
(function () {
  'use strict';
  var CFG = {
    file: '1，小 主持 人《合欢》.mp3',   /* 曲目（站点根目录） */
    title: '《合欢》',                   /* 曲名 */
    by: '小主持人',                      /* 演唱 / 来源 */
    vol: 0.65,                          /* 音量 0~1 */
    left: 10, bottom: 12                /* 距左下角位置（px） */
  };
  if (!window.Audio || document.getElementById('xzmPl')) return;

  /* 本脚本所在目录：配合 src 前缀（根页/子页不同层级自动正确） */
  var here = (function () {
    var ss = document.getElementsByTagName('script');
    var s = document.currentScript || ss[ss.length - 1];
    var u = (s && s.src) ? new URL(s.src, location.href) : new URL(location.href);
    return new URL('./', u);
  })();
  var srcUrl = new URL(CFG.file, here).href;

  var CSS = [
    '.xzm-pl{position:fixed;left:' + CFG.left + 'px;bottom:' + CFG.bottom + 'px;z-index:40;',
    'display:flex;align-items:center;padding:3px;cursor:pointer;line-height:1;',
    'border:1px solid rgba(201,162,75,.55);border-radius:999px;',
    'background:linear-gradient(180deg,rgba(28,17,7,.9),rgba(13,9,4,.86));',
    'box-shadow:0 6px 16px rgba(0,0,0,.4);user-select:none;-webkit-user-select:none;',
    'transition:border-color .2s;}',
    '.xzm-pl:hover{border-color:rgba(233,200,125,.95);}',
    '.xzm-pl:focus-visible{outline:1px solid #e0bd6a;outline-offset:2px;}',
    '.xzm-dial{flex:none;width:26px;height:26px;border-radius:50%;display:inline-flex;',
    'align-items:center;justify-content:center;gap:2px;',
    'border:1px solid rgba(240,206,132,.9);',
    'background:radial-gradient(circle at 34% 28%,#8a5320,#46290d 70%,#291707);',
    'box-shadow:0 0 8px rgba(201,162,75,.35),inset 0 1px 0 rgba(255,238,196,.3);}',
    '.xzm-dial i{width:2px;height:11px;border-radius:1.5px;',
    'background:linear-gradient(180deg,#ffd98a,#a8762a);box-shadow:0 0 5px rgba(255,212,128,.6);}',
    '.xzm-pl.xzm-on .xzm-dial i{animation:xzmWave .9s ease-in-out infinite;}',
    '.xzm-dial i:nth-child(2){animation-delay:.12s;}',
    '.xzm-dial i:nth-child(3){animation-delay:.24s;}',
    '.xzm-dial i:nth-child(4){animation-delay:.36s;}',
    '@keyframes xzmWave{0%,100%{transform:scaleY(.35);}50%{transform:scaleY(1);}}',
    '.xzm-tri{display:none;font-size:8px;color:#ffe9b8;text-shadow:0 0 6px rgba(255,210,120,.8);}',
    '.xzm-pl:not(.xzm-on) .xzm-dial i{display:none;}',
    '.xzm-pl:not(.xzm-on) .xzm-tri{display:inline-block;}',
    '.xzm-txt{overflow:hidden;white-space:nowrap;max-width:0;opacity:0;margin-left:0;',
    'font-size:10.5px;letter-spacing:1px;color:#f2d78f;text-shadow:0 0 8px rgba(255,210,120,.25);',
    'transition:max-width .25s ease,opacity .25s ease,margin-left .25s ease;}',
    '.xzm-pl:hover .xzm-txt,.xzm-pl:focus-visible .xzm-txt{max-width:190px;opacity:1;margin-left:6px;}',
    '.xzm-bub{position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);',
    'font-size:9.5px;letter-spacing:1.5px;color:#ead9a8;white-space:nowrap;padding:3px 9px;',
    'border-radius:999px;border:1px solid rgba(201,162,75,.5);background:rgba(16,10,4,.92);',
    'box-shadow:0 6px 14px rgba(0,0,0,.35);visibility:hidden;opacity:0;',
    'transition:opacity .2s ease,visibility .2s ease;}',
    '.xzm-pl.xzm-show .xzm-bub,.xzm-pl.xzm-wait .xzm-bub{visibility:visible;opacity:1;}',
    '.xzm-pl.xzm-wait .xzm-bub{animation:xzmNudge 1.8s ease-in-out infinite;}',
    '@keyframes xzmNudge{0%,100%{opacity:.5;}50%{opacity:1;}}',
    '@media (max-width:640px){',
    '.xzm-pl{left:8px;bottom:10px;padding:2px;}',
    '.xzm-dial{width:22px;height:22px;}',
    '.xzm-dial i{width:2px;height:9px;}',
    '.xzm-txt{display:none;}',
    '}'
  ].join('\n');

  var st = document.createElement('style');
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  var pl = document.createElement('div');
  pl.className = 'xzm-pl';
  pl.id = 'xzmPl';
  pl.setAttribute('role', 'button');
  pl.tabIndex = 0;
  pl.setAttribute('aria-pressed', 'false');
  pl.setAttribute('aria-label', '背景玄乐' + CFG.title + '播放控制');
  pl.title = '玄乐' + CFG.title + ' · ' + CFG.by + ' · 点击起落';
  pl.innerHTML =
    '<span class="xzm-dial">' +
      '<i></i><i></i><i></i><i></i>' +
      '<span class="xzm-tri">▶</span>' +
    '</span>' +
    '<span class="xzm-txt">♪ ' + CFG.title + ' · ' + CFG.by + '</span>' +
    '<span class="xzm-bub" id="xzmSt"></span>';
  document.body.appendChild(pl);

  var bubEl = document.getElementById('xzmSt');
  var audio = new Audio(srcUrl);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = CFG.vol;

  var playing = false, waiting = false, unlockAt = 0, hidT = 0;

  /* 气泡：text 为空则收起；hold>0 表示短暂展示后自动收起 */
  function bub(text, hold) {
    if (hidT) { clearTimeout(hidT); hidT = 0; }
    if (text) {
      bubEl.textContent = text;
      pl.classList.add('xzm-show');
      if (hold) hidT = setTimeout(function () { hideBub(); }, hold);
    } else { hideBub(); }
    function hideBub() {
      hidT = 0;
      if (!waiting) { pl.classList.remove('xzm-show'); }
      bubEl.textContent = '';
    }
  }
  function setPlaying(v) {
    playing = v;
    pl.classList.toggle('xzm-on', v);
    pl.setAttribute('aria-pressed', v ? 'true' : 'false');
    pl.title = '玄乐' + CFG.title + ' · ' + CFG.by + (v ? ' · 正鸣' : ' · 已歇 · 点击续响');
  }
  function firePlay(showName) {
    var p = audio.play();
    if (!p || typeof p.then !== 'function') {
      setPlaying(true);
      bub('', 0);
      if (showName) bub('♪ ' + CFG.title, 2400);
      return;
    }
    p.then(function () {
      setPlaying(true);
      bub('', 0);                       /* 清掉可能残留的错误提示 */
      if (showName) bub('♪ ' + CFG.title, 2400);
    }, function (err) {
      setPlaying(false);
      if (err && err.name === 'NotAllowedError') { enterWait(); }
      else { fail(); }
    });
  }
  function enterWait() {
    if (waiting) return;
    waiting = true;
    pl.classList.add('xzm-wait');
    bub('轻触起乐');
    var tryUnlock = function (e) {
      if (e && e.type === 'keydown') {
        var k = e.key || '';
        if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape'].indexOf(k) !== -1) return;
      }
      unlockAt = Date.now();
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(function () { leave(); }, function (err) {
          if (!err || err.name !== 'NotAllowedError') { leave(); fail(); }
        });
      } else { leave(); }
      function leave() {
        waiting = false;
        pl.classList.remove('xzm-wait');
        setPlaying(true);
        bub('♪ ' + CFG.title, 2600);
        window.removeEventListener('pointerdown', tryUnlock);
        window.removeEventListener('keydown', tryUnlock);
        window.removeEventListener('touchend', tryUnlock);
      }
    };
    window.addEventListener('pointerdown', tryUnlock);
    window.addEventListener('touchend', tryUnlock);
    window.addEventListener('keydown', tryUnlock);
  }
  function fail() { /* 曲目缺失 / 解码失败等 */
    waiting = false;
    pl.classList.remove('xzm-wait');
    setPlaying(false);
    bub('此曲暂不可闻');
  }

  audio.addEventListener('error', fail);
  pl.addEventListener('click', function (e) {
    e.stopPropagation();
    if (Date.now() - unlockAt < 500) return;   /* 这一击刚用于解锁鸣响，不再翻转 */
    if (playing) {
      audio.pause();
      setPlaying(false);
      bub('');
    } else {
      firePlay(false);
    }
  });
  pl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pl.click();
    }
  });

  firePlay(true);   /* 进页即尝试自动起乐，成功则亮一下曲名 */
})();
