const prefs = {
  gender: require('../models/gender'),
  kinks: require('../models/kinks'),
  language: require('../models/language'),
  role: require('../models/role'),
  species: require('../models/species')
}

/**
 * Checks a single value: it must be text, and either 'any' or one of the allowed options.
 *
 * @param  Object model The allowed options.
 * @param  Mixed  value The value sent.
 * @return Boolean
 */
const isAllowed = (model, value) => typeof value === 'string' && (value === 'any' || model.find(value));

/**
 * Checks a list: it must hold at least one value, and every value must be allowed.
 *
 * @param  Object model  The allowed options.
 * @param  Mixed  values The values sent.
 * @return Boolean
 */
const allAllowed = (model, values) => values instanceof Array && values.length > 0 && values.every(value => isAllowed(model, value));

/**
 * Checks that every field is present, of the right type, and allowed.
 * A bad request left waiting in the pool would break matching for everyone who reaches it.
 *
 * @param  Object preferences The preference object.
 * @return Boolean
 */
const checkValid = (preferences) => {
  const { user, partner, kinks } = preferences || {};

  return !!user && !!partner &&
    isAllowed(prefs.gender, user.gender) && isAllowed(prefs.species, user.species) &&
    isAllowed(prefs.role, user.role) && isAllowed(prefs.language, user.language) &&
    allAllowed(prefs.gender, partner.gender) && allAllowed(prefs.species, partner.species) &&
    isAllowed(prefs.role, partner.role) && allAllowed(prefs.kinks, kinks);
}

/**
 * Checks someone gets the role they asked for. A Switch can take either role,
 * and asking for a Switch means either role is fine.
 *
 * @param  String wanted The role they asked for.
 * @param  String role   The other person's role.
 * @return Boolean
 */
const roleFits = (wanted, role) => wanted == 'Switch' || wanted == role || role == 'Switch';

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

  if (roleFits(user.partner['role'], partner.user['role']) && roleFits(partner.partner['role'], user.user['role'])) {
    matchCount++;
  }

  return matchCount >= 3;
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
 * Match users language.
 * 
 * @param  String userLanguage  User's Language
 * @param  String partnerLanguage Possible partner's kinks
 * @return Boolean
 */
const matchedLanguage = (userLanguage, partnerLanguage) => {
  return userLanguage.includes('any') || partnerLanguage.includes('any') || userLanguage === partnerLanguage
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

  // A page from before the language picker sends no language: treat that as any language.
  if (preferences && preferences.user && preferences.user.language === undefined) {
    preferences.user.language = 'any';
  }

  // Make sure every field is filled in and only holds allowed values.
  if (!checkValid(preferences)) {
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
      // Send message to the partner that the user has disconnected.
    if (currentPartner.socket.readyState == 1) {
      currentPartner.socket.send(JSON.stringify({ type: 'partner_left', data: true }));
    }
    
    currentUser.previousPartner = currentPartner.id;
    currentPartner.previousPartner = currentUser.id;
    
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
        if (matchedDesires(preferences.kinks, client.preferences.kinks) && matchedPreferences(preferences, client.preferences) &&  matchedLanguage(preferences.user.language, client.preferences.user.language)) {
          partner = client;
          users.pairPartners(currentUser.id, client.id);

          if (currentUser.socket.readyState == 1) {
            currentUser.socket.send(JSON.stringify({
              type: 'partner_connected',
              data: {
                gender: partner.preferences.user.gender,
                species: partner.preferences.user.species,
                kinks: partner.preferences.kinks.join(', '),
                role: partner.preferences.user.role,
                language: partner.preferences.user.language
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
