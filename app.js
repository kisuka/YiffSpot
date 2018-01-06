'use strict';

const express = require('express'),
      http    = require('http'),
      https   = require('https'),
      ws      = require('ws'),
      fs      = require('fs'),
      config  = require('./config'),
      routes  = require('./routes'),
      init    = require('./src/server/init.js');

var credentials = undefined,
    sslServer   = undefined,
    wss         = undefined;

if (config.ssl_enabled == true) {
	credentials = {
	  key: fs.readFileSync(config.ssl_key),
	  cert: fs.readFileSync(config.ssl_crt),
	};
}

// Initalize Express
const app = express();

// Express View Engine
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views');

// Express Routing
app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// HTTPS redirection if ssl is enabled
if (config.ssl_enabled == true) {
  app.use(function requireHTTPS(req, res, next) {
    if (!req.secure) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

app.use(routes);

// Create HTTP + Web Socket server
const server = http.createServer(app);

// Create HTTPS server if enabled
if (config.ssl_enabled == true) {
	sslServer = https.createServer(credentials, app);
}

// Create Web Socket server
if (config.ssl_enabled == true) {
	wss = new ws.Server({server: sslServer});
} else {
	wss = new ws.Server({server: server});
}

// Initalize socket listeners
init(wss);

// Listen on specified port / App Start
server.listen(config.http_port, function listening() {
  console.log('Listening on port %d', server.address().port);
});

if (config.ssl_enabled == true) {
	sslServer.listen(config.https_port, function listening() {
	  console.log('Listening on port %d', sslServer.address().port);
	});
}
