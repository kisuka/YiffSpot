'use strict';

var gender  = require("../models/gender");
var kinks   = require("../models/kinks");
var role    = require("../models/role");
var species = require("../models/species");
var users   = require("../models/users");

module.exports = function (socket, users, token) {
  /**
   * Handles connecting two users together for a yiffing session.
   * @param  Object preferences The yiffing preferences of the user.
   */
  socket.on('find_partner', function (preferences) {
    // Update user's preferences.
    users.addPreferences(token, preferences);

    var partner = null;
    var currentUser = users.findClient(token);
    var clients = users.getAllClients();

    // If user submitted any blank values, do not search for anything.
    if (checkEmpty(preferences.user) || checkEmpty(preferences.partner) || checkEmpty(preferences.kinks)) {
      socket.emit('invalid_preferences');
      return false;
    }

    // Make sure user didn't try to submit any values not allowed.
    if (checkInvalid(preferences.user) || checkInvalid(preferences.partner) || checkInvalid({kinks: preferences.kinks})) {
      socket.emit('invalid_preferences');
      return false;
    }

    // User is looking for a new partner, therefore delete any existing paired partner.
    if (currentUser.partner != null) {
      var currentPartner = users.findClient(currentUser.partner);

      if (currentPartner && currentUser.id == currentPartner.partner) {
        // Send message to the partner that the user has disconnected.
        socket.broadcast.to(currentPartner.socket.id).emit('partner_left');
      }

      // Disconnect partners from each other.
      users.removePartner(currentUser.id);
    }

    // Look for a partner to yiff with in the list of pending users
    for (var client in clients) {
      var client = clients[client];

      // Make sure our current partner is not our new partner and is not ourselves.
      if (client.partner == null && client.preferences != null && currentUser.id != client.id) {
        // Make sure not on blocked list for user.
        if (users.checkBlocks(currentUser.id, client.id) === false && users.checkBlocks(client.id, currentUser.id) === false) {
          // Match based off preferences.
          if (matchedDesires(preferences.kinks, client.preferences.kinks) && matchedPreferences(preferences, client.preferences)) {
            partner = client;
            users.pairPartners(currentUser.id, client.id);

            socket.emit('partner_connected', {
              gender: partner.preferences.user.gender,
              species: partner.preferences.user.species,
              kinks: partner.preferences.kinks.join(", "),
              role: partner.preferences.user.role
            });

            break;
          }
        }
      }
    }

    if (partner != null) {
      socket.broadcast.to(partner.socket.id).emit('partner_connected', {
        gender: currentUser.preferences.user.gender,
        species: currentUser.preferences.user.species,
        kinks: currentUser.preferences.kinks.join(", "),
        role: currentUser.preferences.user.role,
      });
    } else {
      socket.emit('partner_pending');
    }
  });
}

/**
 * Checks for any empty fields.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
function checkEmpty(preferences) {
  for (var key in preferences) {
    if (preferences[key].length < 1) {
      return true;
    }
  }
  return false;
}

/**
 * Checks for invalid pairing options.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
function checkInvalid(preferences) {
  for (var key in preferences) {
    if (preferences[key] instanceof Array) {
      for (var i = 0; i < preferences[key].length; i++) {
        if (preferences[key][i] != 'any' && eval(key).find(preferences[key][i]) === false) {
          return true;
        }
      }
    } else {
      if (preferences[key] != 'any' && eval(key).find(preferences[key]) === false) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Figure out if two users match each other's requirements.
 * 
 * @param  Object user    User's preferences
 * @param  Object partner Possible partner's preferences
 * @return Boolean
 */
function matchedPreferences(user, partner) {
  var matchCount = 0;

  if ((user.partner['gender'].indexOf(partner.user['gender']) !== -1 || user.partner['gender'].indexOf('any') !== -1) &&
    (partner.partner['gender'].indexOf(user.user['gender']) !== -1 || partner.partner['gender'].indexOf('any') !== -1)) {
    ++matchCount;
  }

  if ((user.partner['species'].indexOf(partner.user['species']) !== -1 || user.partner['species'].indexOf('any') !== -1) &&
    (partner.partner['species'].indexOf(user.user['species']) !== -1 || partner.partner['species'].indexOf('any') !== -1)) {
    ++matchCount;
  }

  if ((user.partner['role'] == partner.user['role'] && partner.partner['role'] == user.user['role']) || (user.user['role'] == 'Switch' || partner.user['role'] == 'Switch')) {
    ++matchCount;
  }

  if (matchCount >= 3) {
    return true;
  } else {
    return false;
  }
}

/**
 * Match users kinks to see if they are into the same thing.
 * 
 * @param  Array userKinks    User's kinks
 * @param  Array partnerKinks Possible partner's kinks
 * @return Boolean
 */
function matchedDesires(userKinks, partnerKinks) {
  if (userKinks.indexOf('any') !== -1 || partnerKinks.indexOf('any') !== -1) {
    return true;
  }

  if (similiarKinks(userKinks, partnerKinks, 1)) {
    return true;
  }

  return false;
}

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
    if (partnerKinks.indexOf(userKinks[i]) !== -1) {
      similar++;
    }

    if (similar >= similarities) {
      return true;
    }
  }
  return false;
}