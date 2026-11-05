# 🧰 怪物彈珠工具箱 (Monster Strike Toolbox)

🔗 **線上使用**：https://emily4027.github.io/monster-strike-toolbox/

《怪物彈珠》輔助工具的整合入口頁。把各個獨立的小工具集中在同一個首頁，並提供統一的 Google 登入，讓需要雲端儲存的工具共用登入狀態。

---

## 🧩 收錄的工具

| 工具 | 說明 | 連結 |
|------|------|------|
| 🍏 果實分配計算機 | 管理角色果實配置、計算庫存需求 | [前往](https://emily4027.github.io/monster-strike-fruit-assign/)（[原始碼](https://github.com/emily4027/monster-strike-fruit-assign)） |
| 📊 抽卡統計工具 | 紀錄抽卡結果 | [前往](https://emily4027.github.io/monster-strike-gacha/)（[原始碼](https://github.com/emily4027/monster-strike-gacha)） |

---

## ✨ 功能

### 🚀 整合入口
- 卡片式導覽，點擊卡片即可前往對應工具。
- 卡片由 `tools.js` 的工具清單自動產生，版面採 CSS Grid 自動排列，新增工具不需要改 HTML 或 CSS。

### 🔐 Google 登入 (Firebase Authentication)
- 頁首的「登入」按鈕會開啟 Google 帳號選擇視窗。
- 登入後顯示頭像與名稱；點擊該區塊並確認後即可登出。
- 登入僅用於雲端儲存各工具的資料，電子郵件不會公開。
- 登入狀態以 sessionStorage 暫存，重新開啟頁面時會立即顯示登入狀態，避免按鈕閃爍；實際狀態仍以 Firebase 回報為準，登入過期時會自動修正畫面。
- Firebase SDK 超過 5 秒仍未載入時，登入按鈕會停用並提示「登入服務暫時無法使用，請重新整理頁面」。

### 🎨 視覺與互動
- **3D 傾斜效果**：滑鼠移到卡片上時，依游標位置計算 `rotateX / rotateY`，卡片會跟著傾斜；卡片角落的裝飾圓圈有視差位移。
- **動態背景**：緩慢旋轉的柔光漸層，不搶視覺焦點。
- **主題色**：果實為綠色、抽卡為藍紫色，在 `tools.js` 中設定。
- **GitHub 連結**：右上角可前往專案原始碼。

### 📱 響應式設計 (RWD)
- 電腦版多欄卡片，手機版（寬度 600px 以下）自動改為單欄，並縮小標題與連結圖示。

---

## 🚀 快速開始

### 本地開發
Google 登入需要 `http(s)` 環境，**請勿直接用 `file://` 開啟**，請使用本機伺服器：

```bash
git clone https://github.com/emily4027/monster-strike-toolbox.git
cd monster-strike-toolbox

python -m http.server 8000     # 然後開啟 http://localhost:8000
# 或使用 VS Code 的 Live Server 擴充功能
```

### ➕ 新增一個工具卡片
在 `tools.js` 的 `MS_TOOLS` 陣列多加一筆即可：

```js
{
    id: 'xxx',                 // 英文代號，卡片會帶有 card-xxx class
    name: '新工具',              // 卡片標題
    description: '一句話說明。', // 卡片說明
    url: 'https://emily4027.github.io/monster-strike-xxx/',
    emoji: '🎯',                // 卡片圖示
    color: '#ff9800',           // 主題色：裝飾圓圈、按鈕 hover 底色
    bg: '#fff3e0',              // 淺色底：圖示背景
},
```

卡片樣式、配色與 3D 傾斜效果都會自動套用，不需要修改 `index.html`、`style.css` 或 `script.js`。若某張卡片需要特別的樣式，可以在 `style.css` 用 `.card-xxx` 個別調整。

---

## 📂 檔案結構

```
.
├── index.html      # 入口首頁（卡片模板、登入區塊、Firebase SDK 載入）
├── style.css       # 樣式（CSS 變數、動畫、RWD、登入元件）
├── tools.js        # 工具清單（卡片的名稱、說明、網址、圖示與主題色）
├── script.js       # 互動腳本（產生卡片、3D 傾斜效果、登入狀態管理）
├── CHANGELOG.md    # 更新日誌
└── README.md       # 專案說明
```

---

## 🛠 技術架構

- **HTML5**：語意化結構。
- **CSS3**：CSS 變數、Grid / Flexbox、`@keyframes` 動畫、媒體查詢。
- **JavaScript**：原生 Vanilla JS，無需建置工具。
- **外部資源（CDN）**：
  - Firebase Authentication SDK (11.6.1)
  - Bootstrap Icons (1.11.3)
  - Google Fonts：Noto Sans TC

### 關於 Firebase 設定
`index.html` 內的 Firebase 設定（`apiKey` 等）是網頁端用的識別資訊，本來就會出現在前端程式碼中，**不屬於機密**。實際的資料安全由 Firebase 的授權網域設定與 Firestore 安全規則把關。

---

## 📝 授權與備註

- 本專案為非官方粉絲製作工具，與 MIXI 無直接關聯。
- 字體使用 Google Fonts (Noto Sans TC)。
- 本工具由 AI 協助撰寫。
