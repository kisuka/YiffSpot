var express    = require('express')
var app        = express();
var server     = require('http').Server(app);
var io         = require('socket.io')(server, {'pingInterval': 60000, 'pingTimeout': 30000});
var connection = require('./server/connection.js');

var port = process.env.PORT || 3000;

app.enable('trust proxy');
app.set('view engine', 'jade');

/* Static */
app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// Http routing
app.use('/', require('./controllers/routes'));

server.listen(port);

connection(io);

console.log('YiffSpot is running and listening on port %d.', port);
