# 深情猫玄学馆 · 四窗口站

一个纯静态、古风 UI 的传统文化工具站群，共四个窗口：

| 窗口 | 目录 | 说明 |
| --- | --- | --- |
| 馆首页 | `index.html` | 四门导览 · 随缘一测 · 结缘留灯 |
| 子 平 八 字 | `bazi/` | 排盘详批 · 大运流年 · 白话命书 |
| 周 易 起 卦 | `iching/` | 静心仪轨 · 数字起卦 · 白话解卦 |
| 数 字 能 量 | `digit/` | 八星磁场 · 五行契合 · 尾号参考（**第三个窗口**） |
| 塔 罗 占 卜 | `tarot/` | 78张牌精讲 · 正逆位细读 · 身边小例（**第四个窗口**） |

四馆顶部导航互通：馆首页 ↔ 子平八字 ↔ 周易起卦 ↔ 数字能量 ↔ 塔罗占卜。
馆首页导航与卡片为静态 HTML（在 `index.html` 内），各子馆页面带 `.xz-nav` 站群导航条。

## 数字能量窗口（digit/）

由 `d:\ai\digit-energy`（独立工作副本 / 独立发布源）合并而来：

- 分析入口：每日免费 1 次，用罄后随缘添灯（与易学铺子同款诚信机制），详情见 `digit/README.md`；
- 店主微信：`digit/wechat-qrcode.png` / `digit/wechat-pay.png` + `digit/data.js → SHOP.wxId`；
- 更新方法：以 `d:\ai\digit-energy` 为源修改，再整体同步回 `digit/`（注意保留 `digit/data.js` 的站群导航 `otherHalls` 与 `digit/app.js` 的四馆导航渲染配置，`digit/index.html` 的 `span.xz-on` 高亮样式）。

## 塔罗窗口（tarot/）

由 `d:\ai\tarot`（独立工作副本 / 独立发布源）合并而来：

- 玩法：每日免费 2 次，再测随喜添灯；78 张牌正逆位白话讲解 + 「细读精讲」身边小例；
- 店主微信 / 收款码：`tarot/data.js → TAROT_META.wx` + `tarot/wechat-qrcode.png` / `tarot/wechat-pay.png`；
- 更新方法：以 `d:\ai\tarot` 为源修改，再把运行文件（`index.html` `app.js` `data.js` `data_deep.js` `wechat-*.png`）同步回 `tarot/`（注意保留 `tarot/index.html` 顶部与样式里的 `.xz-nav` 站群导航——那是馆内副本特有，源站没有）。

## 发布说明

- **深情猫玄学馆（本整馆四窗口站）只放在本地**，用于本地浏览/给顾客演示：双击 `index.html` 即可，四窗口相对链接互通。
- **数字能量程序本身**由 `d:\ai\digit-energy` 独立发布到 GitHub Pages，独立仓库 `digit-energy`，不占用易学铺子仓库的发布位：
  - 线上入口：`https://luyu11888.github.io/digit-energy/`
  - 推送：在 `d:\ai\digit-energy` 下 `git add . && git commit -m "..." && git push origin main`
- **塔罗程序本身**由 `d:\ai\tarot` 独立发布到 GitHub Pages，独立仓库 `tarot`：
  - 线上入口：`https://luyu11888.github.io/tarot/`
  - 推送：在 `d:\ai\tarot` 下 `git add . && git commit -m "..." && git push origin main`

> 易学铺子（单馆版）仍在 `iching-divination/` 独立维护、独立发布，与本站无文件依赖。
