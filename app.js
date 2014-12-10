var express     = require('express');
var app         = express();
var compression = require('compression');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var cacheTime   = 0;
var port		= process.env.PORT || 3000;

// Configurations
app.use(compression({ threshold: 512 }));
app.use('/assets', express.static(__dirname + '/assets'));

// Routes
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/humans.txt', function(req, res) {
  res.sendFile(__dirname + '/assets/humans.txt');
});

// Configure & Start Socket.io
require('./socketapp').start(io.sockets);

// Start the web server
var activeServer = http.listen(port);
console.log('YiffSpot is online and listening on port %d.', port);