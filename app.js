'use strict';

require('dotenv').config();

var express = require('express');
var http    = require('http');
var https   = require('https');
var ws      = require('ws');
var fs      = require('graceful-fs');
var init    = require('./src/server/init.js');
var path    = require('path');

var credentials = undefined;
var sslServer   = undefined;
var wss         = undefined;

if (process.env.SSL_ENABLED == true) {
	credentials = {
	  key: fs.readFileSync(process.env.SSL_KEY_PATH),
	  cert: fs.readFileSync(process.env.SSL_CRT_PATH),
	};
}

// Initalize Express
var app = express();

// Express View Engine
app.enable('trust proxy');

// Express Routing
app.use(express.static(path.join(__dirname, '/dist')));
app.use('/assets', express.static(path.join(__dirname, '/dist/assets')));

// HTTPS redirection if ssl is enabled
if (process.env.SSL_ENABLED == true) {
  app.use(function requireHTTPS(req, res, next) {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// Create HTTP + Web Socket server
var server = http.createServer(app);

// Create HTTPS server if enabled
if (process.env.SSL_ENABLED == true) {
	sslServer = https.createServer(credentials, app);
}

// Create Web Socket server
if (process.env.SSL_ENABLED == true) {
	wss = new ws.Server({server: sslServer});
} else {
	wss = new ws.Server({server: server});
}

// Initalize socket listeners
init(wss);

// Listen on specified port / App Start
server.listen(process.env.HTTP_PORT, function listening() {
  console.log('Listening on port %d', server.address().port);
});

if (process.env.SSL_ENABLED == true) {
	sslServer.listen(process.env.HTTPS_PORT, function listening() {
	  console.log('Listening on port %d', sslServer.address().port);
	});
}

process.on('uncaughtException', function(err) {
    console.log('Uncaught Error: ');
    console.log(err);
});