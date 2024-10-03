const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./src/data/database.json');
const publicRoutes = require('./routes/publicRoutes');
const authenticationMiddleware = require('./middleware/authenticationMiddleware');

// SSL Certificate and Key
const options = {
  key: fs.readFileSync('./../cert/server.crt'),
  cert: fs.readFileSync('./../cert/server.pem')
};

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

server.use('/public', publicRoutes); // Routes available on port 8000

// Authentication middleware for all other routes
server.use(/^(?!\/(public|livros|autores|categorias)).*$/, authenticationMiddleware);

server.use(router); // Routes on port 3000

// Create HTTPS server
https.createServer(options, server).listen(8443, () => {
  console.log("Boas-vindas à API do AllBooks.")
  console.log("Acesse essa API em https://localhost:8443");
});

// Optionally, create a fallback HTTP server for redirection
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(8000, () => {
  console.log("HTTP server redirecting to HTTPS");
});
