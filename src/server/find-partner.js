const prefs = {
  gender: require('../models/gender'),
  kinks: require('../models/kinks'),
  role: require('../models/role'),
  species: require('../models/species'),
  users: require('../models/users')
}

/**
 * Checks for any empty fields.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
const checkEmpty = (preferences) => {
  for (let key in preferences) {
    if (0 >= preferences[key].length) return true;
  }
  return false;
}

/**
 * Checks for invalid pairing options.
 * 
 * @param  Object preferences The preference object.
 * @return Boolean
 */
const checkInvalid = (preferences) => {
  for (let key in preferences) {
    if (!prefs[key]) return true;
    if (preferences[key] instanceof Array) {
      for (let i = 0; i < preferences[key].length; i++) {
        if (preferences[key][i] != 'any' && !prefs[key].find(preferences[key][i])) return true;
      }
    } else {
      return preferences[key] != 'any' && !prefs[key].find(preferences[key])
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
const matchedPreferences = (user, partner) => {
  let matchCount = 0;

  if ((user.partner['gender'].includes(partner.user['gender']) || user.partner['gender'].includes('any')) && (partner.partner['gender'].includes(user.user['gender']) || partner.partner['gender'].includes('any'))) {
    matchCount++;
  }

  if ((user.partner['species'].includes(partner.user['species']) || user.partner['species'].includes('any')) && (partner.partner['species'].includes(user.user['species']) || partner.partner['species'].includes('any'))) {
    matchCount++;
  }

  if ((user.partner['role'] == partner.user['role'] && partner.partner['role'] == user.user['role']) || (user.user['role'] == 'Switch' || partner.user['role'] == 'Switch')) {
    matchCount++;
  }

  if ((user.partner['role'] == partner.user['role'] && partner.partner['role'] == user.user['role']) || (user.user['role'] == 'Switch' || partner.user['role'] == 'Switch')) {
    matchCount++;
  }

  return matchCount >= 4;
}

/**
 * Match users kinks to see if they are into the same thing.
 * 
 * @param  Array userKinks    User's kinks
 * @param  Array partnerKinks Possible partner's kinks
 * @return Boolean
 */
const matchedDesires = (userKinks, partnerKinks) => {
  return (userKinks.includes('any') || partnerKinks.includes('any')) || similiarKinks(userKinks, partnerKinks, 1);
}

/**
 * Checks if the user and partner share a number of similar kinks.
 * @param  Object userKinks     The user's kink preferences.
 * @param  Object partnerKinks  The partner's kink preferences.
 * @param  Integer similarities The number of similar kinks to have to give a valid result.
 * @return Boolean
 */
const similiarKinks = (userKinks, partnerKinks, similarities) => {
  let similar = 0;

  for (let i = 0; i < userKinks.length; i++) {
    if (partnerKinks.includes(userKinks[i])) {
      similar++;
    }

    if (similar >= similarities) {
      return true;
    }
  }

  return false;
}

module.exports = (users, token, preferences) => {
  const currentUser = users.findClient(token);
  const clients = users.getAllClients();
  let partner = null;

  // If user submitted any blank values, do not search for anything.
  if (checkEmpty(preferences.user) || checkEmpty(preferences.partner) || checkEmpty(preferences.kinks)) {
    if (currentUser.socket.readyState == 1) {
      currentUser.socket.send(JSON.stringify({ type: 'invalid_preferences', data: true }));
    }

    return false;
  }

  // Make sure user didn't try to submit any values not allowed.
  if (checkInvalid(preferences.user) || checkInvalid(preferences.partner) || checkInvalid({ kinks: preferences.kinks })) {
    if (currentUser.socket.readyState == 1) {
      currentUser.socket.send(JSON.stringify({ type: 'invalid_preferences', data: true }));
    }

    return false;
  }

  // Update user's preferences.
  users.addPreferences(token, preferences);

  // Set that user is looking for a partner
  currentUser.lookingForPartner = true;

  // User is looking for a new partner, therefore delete any existing paired partner.
  if (currentUser.partner) {
    const currentPartner = users.findClient(currentUser.partner);

    if (currentPartner && currentUser.id == currentPartner.partner) {
      // Send message to the partner that the user has disconnected.
      if (currentPartner.socket.readyState == 1) {
        currentPartner.socket.send(JSON.stringify({ type: 'partner_left', data: true }));
      }
    }

    // Disconnect partners from each other.
    users.removePartner(currentUser.id);
  }

  if (currentUser.socket.readyState == 1) {
    currentUser.socket.send(JSON.stringify({ type: 'partner_pending', data: true }));
  }

  // Look for a partner to yiff with in the list of pending users
  for (let client of Object.values(clients)) {
    // Make sure our current partner is not our new partner and is not ourselves.
    if (!client.partner && client.lookingForPartner && client.preferences && currentUser.id != client.id) {
      // Make sure not on blocked list for user.
      if (!users.checkBlocks(currentUser.id, client.id) && !users.checkBlocks(client.id, currentUser.id)) {
        // Match based off preferences.
        if (matchedDesires(preferences.kinks, client.preferences.kinks) && matchedPreferences(preferences, client.preferences)) {
          partner = client;
          users.pairPartners(currentUser.id, client.id);

          if (currentUser.socket.readyState == 1) {
            currentUser.socket.send(JSON.stringify({
              type: 'partner_connected',
              data: {
                gender: partner.preferences.user.gender,
                species: partner.preferences.user.species,
                kinks: partner.preferences.kinks.join(', '),
                role: partner.preferences.user.role
              }
            }));

            currentUser.lookingForPartner = false;
            partner.lookingForPartner = false;
          }

          break;
        }
      }
    }
  }

  if (partner) {
    if (partner.socket.readyState == 1) {
      partner.socket.send(JSON.stringify({
        type: 'partner_connected',
        data: {
          gender: currentUser.preferences.user.gender,
          species: currentUser.preferences.user.species,
          kinks: currentUser.preferences.kinks.join(', '),
          role: currentUser.preferences.user.role,
        }
      }));

      currentUser.lookingForPartner = false;
      partner.lookingForPartner = false;
    }
  }
}
