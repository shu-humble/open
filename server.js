const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 提供靜態文件
app.use(express.static(path.join(__dirname)));

// 預設路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Games.html'));
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);
}); 