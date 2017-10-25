'use strict';

var config = require('./config');

var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server, {cookie: false, transports: ['websocket']});
var redis   = require('socket.io-redis');
var marked  = require('marked');
var fs      = require('fs');

var gender  = require("./src/models/gender");
var kinks   = require("./src/models/kinks");
var role    = require("./src/models/role");
var species = require("./src/models/species");

var connection = require('./src/server/connection.js');

app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views');

/* Static */
app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/public/assets'));

// Http routing
app.get('/', function(req, res) {
  res.render('home', {
    pageTitle: config.pageTitle,
    breeds: species.getAll(),
    genders: gender.getAll(),
    kinks: kinks.getAll(),
    roles: role.getAll(),
  });
});

app.get('/changes', function(req, res) {
  var file = fs.readFileSync('./CHANGELOG.md', 'utf8');
  res.send(marked(file.toString()));
});

if (config.cluster == true) {
  io.adapter(redis());
}

server.listen(config.port);

connection(io);

console.log('Listening on port %d', config.port);
