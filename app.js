var express    = require('express')
var app        = express();
var server     = require('http').Server(app);
var io         = require('socket.io')(server, {'pingInterval': 25000, 'pingTimeout': 60000});
var connection = require('./src/server/connection.js');

var port = process.env.PORT || 3000;

app.enable('trust proxy');
app.set('view engine', 'jade');
app.set('views', __dirname + '/src/views');

/* Static */
app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// Http routing
app.use('/', require('./src/controllers/routes'));

server.listen(port);

connection(io);

console.log('YiffSpot is running and listening on port %d.', port);
