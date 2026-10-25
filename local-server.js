const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');
const contentTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8' };

http.createServer((request, response) => {
  const relativePath = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
  const filePath = path.join(root, relativePath);
  if (!filePath.startsWith(root)) { response.writeHead(403).end('Forbidden'); return; }
  fs.readFile(filePath, (error, content) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}).listen(4173, '127.0.0.1', () => console.log('Sweet Bites is running at http://127.0.0.1:4173'));
