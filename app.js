require('dotenv').config();

const express = require('express'),
	http = require('http'),
	https = require('https'),
	ws = require('ws'),
	fs = require('graceful-fs'),
	init = require('./src/server/init.js'),
	path = require('path');

let credentials,
	sslServer,
	wss;

if (process.env.SSL_ENABLED == 'true') {
	credentials = {
		key: fs.readFileSync(process.env.SSL_KEY_PATH),
		cert: fs.readFileSync(process.env.SSL_CRT_PATH),
	};
}

// Initalize Express
const app = express();

// Express View Engine
app.enable('trust proxy');

// Express Routing
app.use(express.static(path.join(__dirname, '/dist')));

// HTTPS redirection if ssl is enabled
if (process.env.SSL_ENABLED == 'true') {
	app.use((req, res, next) => {
		if (!req.secure) return res.redirect('https://' + req.headers.host + req.url);
		next();
	});
}

// Create HTTP + Web Socket server
const server = http.createServer(app);

// Create HTTPS server if enabled
if (process.env.SSL_ENABLED == 'true') {
	sslServer = https.createServer(credentials, app);
}

// Create Web Socket server
if (process.env.SSL_ENABLED == 'true') {
	wss = new ws.Server({ server: sslServer });
} else {
	wss = new ws.Server({ server: server });
}

// Initalize socket listeners
init(wss);

// Listen on specified port / App Start
server.listen(process.env.HTTP_PORT, () => {
	console.log('Listening on port %d', server.address().port);
});

if (process.env.SSL_ENABLED == 'true') {
	sslServer.listen(process.env.HTTPS_PORT, () => {
		console.log('Listening on port %d', sslServer.address().port);
	});
}

process.on('uncaughtException', (err) => {
	console.error(`${err.stack || err.message}`);
});