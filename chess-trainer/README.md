# 棋感訓練

入口：`棋感訓練.html`，已接到 `Games.html` 的棋盤與紙牌區。

## 棋盤操作

- 棋盤上滾輪向上／向下，或下方箭頭，回看上一手／下一手。答題前只保存原題以前的棋譜；不可看到原局後續，回到原題才能作答。
- 答題後滾輪沿試走歷史往返，仍可用「原題」回到初始訓練局面。
- 右鍵點格子切換圓圈，右鍵拖曳切換箭頭；Shift 使用紅色，預設綠色。標記按局面保存，棋盤翻轉時同步轉換，Esc／清除標記只清目前局面。
- 上一手起終點高亮、將軍王提示、合法目的地提示與升變選擇。
- ELO、匯入、操作說明與授權移到「設定與匯入」，主畫面只放棋盤和當下操作。
- 手機採直向單欄、橫向雙欄，自適應棋盤與安全區；按鈕至少 44px，輸入框 16px，設定改為底部面板。點棋子再點目的地試走；開啟「標記」可點格子或拖曳畫線，「完成」恢復走棋，標記模式不會移動棋子。
- 網站 favicon、頁首及 Games 入口共用 `棋感訓練-icon.svg`。

## 規則

- 每題先以 Stockfish 18 Lite single 分析，再開放作答；0 centipawn 自動跳過。
- 固定白方視角：負數黑優、正數白優；黑方行棋的 UCI 分數會反轉。
- 0 < 絕對分數 < 2.00 算小優，≥ 2.00 算大優。±0.01、±0.10 都算小優。
- 3 秒或 depth 18 的輕量分析並非絕對真理，答案會顯示深度。微小優勢可能因深度而改變方向。
- 練習統計只存在本頁本次使用期間，不上傳。
- 作答後解鎖試走：點選或拖曳棋子、標示合法目的地、悔棋、回到原題、選擇升變，並自動重新評估試走局面。支持雙方輪流走棋、王車易位與吃過路兵；原題與成績不受試走影響。將死、逼和與其他和棋狀態會停止試走，仍可悔棋或重設。
- 評分條、最多三條引擎建議與每步圖標僅於作答後顯示；支援一鍵試走引擎首選。MultiPV 以第一條主變作為局面答案，不會誤用第三條評分。歷史評分按行棋方視角比較前後局面，快走後會依序補評；切換題目取消舊分析。
- 著法分類使用本站公開的近似分數損失門檻（0.10 / 0.50 / 1.00 / 2.00），並非 Chess.com 的預期得分模型。`!` 以同深度次選差距近似；`!!` 和理論棋僅提供定義、不自動授予。各門檻與來源在設定的操作與評分說明中。評分條不是勝率。
- 試走提供上一步與下一步；回到原題也保留可重播的試走。退回後走新著法才替換後續路線，非法落子不會清掉重播紀錄。
- 答題後提供「查看完整對局」：保留 Chess.com API 每場的 `url`，PGN 則讀取 `Link` / `Site`；只接受兩平台的對局網址。未附來源的 PGN 明確顯示無連結，不會導向首頁或虛構比賽。
- 對局連結定位到原題最後一步之後：Lichess 用 `#ply`，Chess.com 用分析頁 `?tab=analysis&move=ply-1`（從 0 開始）。連結固定對應原題，不會把試走分支誤當實戰經過。標籤顯示原題 SAN 步數。
- ELO 可設定上下界（含邊界，留空不限），要求雙方棋譜當時的 `WhiteElo`、`BlackElo` 都符合；啟用後排除未知分數。只篩選已載入題庫，沒有符合題目時不會放寬範圍；匯入後仍沿用設定。設定儲存在本機 localStorage，無法使用儲存時不影響本次篩選。

## 棋局資料

內建兩場 Lichess 公開已結束對局，原始 PGN 保留於 `chess-sample.pgn`、`chess-sample-2.pgn`。
來源：https://lichess.org/yyznGmXs 與 https://lichess.org/YO3ICtJi 。
不以比賽勝負當答案，不使用棋譜附帶分數；每題重新分析。

介面支援 Lichess 對局連結、玩家最近五場、Chess.com 玩家 UTC 本月最近八场標準棋局，以及貼上 PGN。網路錯誤不會覆蓋原題庫。

- Lichess 單局：`https://lichess.org/game/export/{gameId}`
- Lichess 玩家：`https://lichess.org/api/games/user/{username}?max=5&ongoing=false&finished=true`
- Chess.com 月份：`https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}`
- 棋局庫：https://database.lichess.org/ ，大量取樣應另外建立離線匯入流程，不要讓瀏覽器下載整個月的資料庫。

只接受 PGN 結果已結束的標準棋局。每三個半回合抽一個中盤/殘局候選位置，排除終局；不會預告誰贏。

## 開發與部署

`npm run build:chess` 重建已簽入版本控制的 `chess-trainer/generated/trainer.js`，供直接靜態託管使用。HTML 不依賴瀏覽器解析 npm 套件。
`npm run build` 先重建該檔案，再建置既有網站，輸出到 `dist`。
`node scripts/test-chess.mjs` 驗證分數分類、PGN、連結與實際 Stockfish 分析。

`public/chess-engine` 為 Vite 正式輸出來源；根目錄 `chess-engine` 提供直接靜態託管。`build:chess` 同步二者。
引擎為 Stockfish.js 18.0.8 的原始 Lite single 二進位，GPLv3；隨附授權，原始碼與建置說明：https://github.com/nmrugg/stockfish.js/tree/v18.0.8 。
