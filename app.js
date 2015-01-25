var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var string  = require('string');
var port    = process.env.PORT || 3000;

var genders = [
  'Male',
  'Female',
  'Herm',
  'Transgender',
  'Other'
];

var species = [
  'Alligator',
  'Arachnid',
  'Badger',
  'Bat',
  'Bear',
  'Bird',
  'Cat',
  'Cheetah',
  'Corvid',
  'Cougar',
  'Coyote',
  'Crocodile',
  'Deer',
  'Digimon',
  'Dinosaur',
  'Dog',
  'Dolphin',
  'Dragon',
  'Ferret',
  'Fish',
  'Fox',
  'Frog',
  'Giraffe',
  'Gryphon',
  'Hedgehog',
  'Horse',
  'Human',
  'Hydra',
  'Hyena',
  'Iguana',
  'Insect',
  'Jackal',
  'Kangaroo',
  'Koala',
  'Leopard',
  'Lion',
  'Lizard',
  'Lynx',
  'Newt',
  'Ocelot',
  'Other',
  'Otter',
  'Panda',
  'Panther',
  'Pegasus',
  'Pig/Swine',
  'Pokemon',
  'Primate',
  'Rabbit',
  'Raccoon',
  'Rat',
  'Red Panda',
  'Salamander',
  'Seal',
  'Sergal',
  'Shark',
  'Skunk',
  'Snake',
  'Squirrel',
  'Tiger',
  'Turtle',
  'Unicorn',
  'Whale',
  'Wolf',
  'Zebra'
];

var kinks = [
  '3+ Penetration',
  'Anal',
  'Birthing',
  'Biting',
  'Blood',
  'Bondage',
  'Bukkake',
  'Choking',
  'Condoms',
  'Creampie',
  'Dirty Talking',
  'Docking',
  'Double Penetration',
  'Drug / Alcohol Use',
  'Ear Play',
  'Electric Toys',
  'Enemas',
  'Face Sitting',
  'Fellatio',
  'Femboys',
  'Fisting',
  'Flexibility',
  'Foot Play',
  'Frotting',
  'Hair Pulling',
  'Handjob / Fingering',
  'Hotdogging',
  'Humiliation',
  'Ice',
  'In Heat',
  'Incest',
  'Kissing',
  'Knotting',
  'Licking',
  'Living Insertions',
  'Macrophilia',
  'Masturbation',
  'Messy',
  'Microphilia',
  'Musk',
  'Navel Play',
  'Oviposition',
  'Pain',
  'Pegging',
  'Piercings',
  'Pregnancy',
  'Queefing',
  'Rimming',
  'Saliva',
  'Scat',
  'Scissoring',
  'Scratching',
  'Sex Toys',
  'Sheath Play',
  'Slapping',
  'Sloppy Seconds',
  'Smoking',
  'Snowballing',
  'Strap-ons',
  'Strip Tease',
  'Swallowing',
  'Sweat',
  'Tail Pulling',
  'Tail Sex',
  'Teasing',
  'Tickling',
  'Tomboys',
  'Transformation',
  'Transformation',
  'Urethra Play',
  'Urine',
  'Vanilla Sex',
  'Virgin',
  'Vorarephilia',
  'Whipping',
  'Zoophilia'
];

app.enable('trust proxy');
app.set('view engine', 'jade');

// Routes
app.use('/assets', express.static(__dirname + '/public/assets'));

app.get('/', function(req, res) {
  res.render('home', {
    pageTitle: 'Yiff Spot | Yiff With Random Furries!',
    genders: genders,
    breeds: species,
    kinks: kinks
  });
});

app.get('/humans.txt', function(req, res) {
  res.sendFile(__dirname + '/public/humans.txt');
});

var activeServer = server.listen(port);

// Chat Server
var pendingUsers  = [];
var clients       = {};
var usersOnline   = 0;

/**
 * Handles the connection of a user.
 */
io.sockets.on('connection', function(socket)
{
  clients[socket.id] = socket;

  usersOnline++;

  io.sockets.emit('update user count', usersOnline);

  console.log('User Connected! Total Users Online: %d', usersOnline);

  /**
   * Handles connecting two users together for a yiffing session.
   * @param  Object preferences The yiffing preferences of the user.
   */
  socket.on('find partner', function (preferences) {

    // If user submitted any blank values, do not search for anything.
    if (preferences[0].gender.length === 0 || preferences[1].species.length === 0 || preferences[3].matchGender.length === 0 ||
      preferences[4].matchSpecies.length === 0 || preferences[2].kinks.length === 0) {
      socket.emit('invalid preferences');
      return false;
    }

    // Make sure user didn't try to submit any values not allowed.
    if (genders.indexOf(preferences[0].gender, genders) === -1 || species.indexOf(preferences[1].species, species) === -1 ||
      hasInvalidValues(preferences[3].matchGender, genders) || hasInvalidValues(preferences[4].matchSpecies, species) ||
      hasInvalidValues(preferences[2].kinks, kinks)) {
      socket.emit('invalid preferences');
      return false;
    }

    // Delete any existing match   
    if (socket.partner) {
      socket.broadcast.to(socket.partner.socketId).emit('partner disconnected');

      // Disconnect user from partner.
      delete clients[socket.partner.socketId].partner;

      // Disconnect partner from user.
      delete socket.partner;
    }

    var user = {
      socketId: socket.id,
      info: preferences
    };
    var partner;
    var partnerSocket;

    // Look for a partner to yiff with in the list of pending users
    for (var i = 0; i < pendingUsers.length; i++) {
      var tmpUser = pendingUsers[i];

      // Make sure our previous partner is not our new partner and is not ourselves
      if (socket.partner != tmpUser && socket.id != tmpUser.socketId) {

        // Check if user and partner are interested in each other's genders.
        if((user.info[3].matchGender.indexOf(tmpUser.info[0].gender) !== -1 || user.info[3].matchGender[0] == 'any') &&
          (tmpUser.info[3].matchGender.indexOf(user.info[0].gender) !== -1 || tmpUser.info[3].matchGender[0] == 'any')) {

          // Check if user and partner are capable on species preferences.
          if((user.info[4].matchSpecies.indexOf(tmpUser.info[1].species) !== -1 || user.info[4].matchSpecies[0] == 'any') &&
            (tmpUser.info[4].matchSpecies.indexOf(user.info[1].species) !== -1 || tmpUser.info[4].matchSpecies[0] == 'any')) {

            // Check if user and partner share at least one similar kink.
            if((user.info[2].kinks[0] == 'any' || tmpUser.info[2].kinks[0] == 'any') ||
                similiarKinks(user.info[2].kinks, tmpUser.info[2].kinks, 1)) {

              // Get the socket client for this partner
              partnerSocket = clients[tmpUser.socketId];

              // Remove the partner we found from the list of users looking for a partner
              pendingUsers.splice(i, 1);

              // If the partner we found exists / hasn't disconnected
              if (partnerSocket) {
                partner = tmpUser;

                socket.emit('partner connected', {
                  gender: partner.info[0].gender,
                  species: partner.info[1].species,
                  kinks: partner.info[2].kinks.join(", ")
                });

                break;
              }
            }
          }
        }
      }
    }

    // User found a partner
    if (partner) {
      // Match user and partner as yiffing partners
      socket.partner = partner;
      partnerSocket.partner = user;

      // Remove user and partner from pending users
      socket.inlist = false;
      partnerSocket.inlist = false;

      // Inform partner of match
      socket.broadcast.to(partner.socketId).emit('partner connected', {
        gender: user.info[0].gender,
        species: user.info[1].species,
        kinks: user.info[2].kinks.join(", ")
      });
    } else {
      // Add user to pending users list
      if (!socket.inlist) {
        socket.inlist = true;
        pendingUsers.push(user);
      }

      // Inform the user that the system is still looking for a match
      socket.emit('no match');
    }
  });


  /**
   * Handles sending a message to the user's partner.
   * @param  String message The message to send.
   */
  socket.on('send message', function(message) {
	
	// Server side check of user messages
	if(message === '' || message.length > 2000){
		socket.emit('invalid message');
		return false;
	}
		
    var partner = socket.partner;
    var msg = string(message).stripTags().s;
	
	// Check if the user is connected to a partner
    if(!partner)
      return false;

    socket.broadcast.to(partner.socketId).emit('receive message', { message: msg });
  });


  /**
   * Handles the disconnection of a user.
   */
  socket.on('disconnect', function() {
    var partner = socket.partner;

    // Check if user has a partner
    if (partner) {
      // Disconnect user from partner.
      delete clients[partner.socketId].partner;

      socket.broadcast.to(partner.socketId).emit('partner disconnected');
    }

    // Remove disconnected user from clients list
    delete clients[socket.id];

    usersOnline--;

    io.sockets.emit('update user count', usersOnline);

    console.log('User Disconnected! Total Users Online: %d', usersOnline);
  });
});

/**
 * Checks if the user and partner share a number of similar kinks.
 * @param  Object userKinks     The user's kink preferences.
 * @param  Object partnerKinks  The partner's kink preferences.
 * @param  Integer similarities The number of similar kinks to have to give a valid result.
 * @return Boolean
 */
function similiarKinks(userKinks, partnerKinks, similarities) {
  var similar = 0;

  for (var i = 0; i < userKinks.length; i++) {
    if (partnerKinks.indexOf(userKinks[i]) !== -1)
      similar++;

    if (similar >= similarities)
      return true;
  }

  return false;
}

/**
 * Checks an array for invalid values.
 * @param  Array  a The array of submitted values.
 * @param  Array  b The array of valid values.
 * @return Boolean
 */
function hasInvalidValues(a, b) {
  for (var i = 0; i < a.length; i++) {
    if (a[i] != 'any' && b.indexOf(a[i]) === -1)
      return true;
  }

  return false;
}

console.log('YiffSpot is running and listening on port %d.', port);
