@echo off
chcp 65001 >nul
title Webview 服务器
color 0A

cd /d %~dp0

echo ========================================
echo    Webview 开发服务器 (Node.js)
echo ========================================
echo.
echo 服务器地址: http://localhost:8080
echo 请在浏览器输入此地址访问
echo ========================================
echo.

node -e "const http=require('http');const fs=require('fs');const path=require('path');http.createServer((req,res)=>{let f=req.url==='/'?'index.html':req.url;let p=path.join(__dirname,f);fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);res.end('Not Found')}else{let t=f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'text/html';res.writeHead(200,{'Content-Type':t});res.end(d)}})}).listen(8080,()=>console.log('Server running at http://localhost:8080'))"

pause