'use strict';

var chat    = require('./chat');
var partner = require('./partner');

var SlimSelect = require('./../../../node_modules/slim-select/dist/index');

/**
 * Initial things to do for prefences such as loading saved preferences
 * and enabling SlimSelect on select inputs.
 */
document.addEventListener('DOMContentLoaded', function() {
  loadSavedPreferences();
  
  new SlimSelect({
    select: '#userGender',
    showSearch: false
  });
  
  new SlimSelect({
    select: '#userSpecies'
  });
  
  new SlimSelect({
    select: '#userRole',
    showSearch: false
  });
  
  new SlimSelect({
    select: '#userKinks'
  });
  
  new SlimSelect({
    select: '#partnerGender'
  });
  
  new SlimSelect({
    select: '#partnerRole',
    showSearch: false
  });
  
  new SlimSelect({
    select: '#partnerSpecies'
  });
});

/**
 * Load preferences from local storage.
 */
function loadSavedPreferences() {
  var gendersSelect = document.getElementById('partnerGender');
  var kinksSelect = document.getElementById('userKinks');
  var speciesSelect = document.getElementById('partnerSpecies');

  if (localStorage['gender']) {
    document.getElementById('userGender').value = localStorage['gender'];
  }

  if (localStorage['species']) {
    document.getElementById('userSpecies').value = localStorage['species'];
  }

  if (localStorage['role']) {
    document.getElementById('userRole').value = localStorage['role'];
  }

  if (localStorage['partnerGender']) {
    var genders = localStorage['partnerGender'].split(',');
    
    for(var count=0; count < gendersSelect.options.length; count++) {
      if(genders.includes(gendersSelect.options[count].value)) {
        gendersSelect.options[count].selected = "selected";
      }
    }
  } else {
    gendersSelect.options[0].selected = "selected";
  }

  if (localStorage['partnerSpecies']) {
    var species = localStorage['partnerSpecies'].split(',');
    
    for(var count=0; count < speciesSelect.options.length; count++) {
      if(species.includes(speciesSelect.options[count].value)) {
        speciesSelect.options[count].selected = "selected";
      }
    }
  } else {
    speciesSelect.options[0].selected = "selected";
  }

  if (localStorage['partnerRole']) {
    document.getElementById('partnerRole').value = localStorage['partnerRole'];
  }

  if (localStorage['kinks']) {
    var kinks = localStorage['kinks'].split(',');

    for(var count=0; count < kinksSelect.options.length; count++) {
      if(kinks.includes(kinksSelect.options[count].value)) {
        kinksSelect.options[count].selected = "selected";
      }
    }
  } else {
    kinksSelect.options[0].selected = "selected";
  }
}

function listen(socket, user) {
  /**
   * Off Canvas Preferences
   */
  document.getElementById("menu").onclick = function(e) {
    document.getElementById("sidebar").classList.toggle('active-sidebar');
  };

  /**
   * Find a partner.
   * 
   * @param  Object e Submit event
   */
  document.getElementById('userSettings').addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (document.getElementById("sidebar").classList.contains('active-sidebar')) {
      document.getElementById("sidebar").classList.toggle('active-sidebar');
    }

    if (user.allow == false) {
      return false;
    }

    if (user.hasPartner) {
      if (!confirm('Are you sure you want to find a new partner?')) {
        return false;
      }

      chat.addChatMessage('You have disconnected from your previous partner.', {
        class: 'message-system'
      });
    }

    const data = partner.findPartner();

    if (data) {
      user.hasPartner = false;
      socket.emit('find_partner', data);
      chat.showChatBox();
    }
  });
  
  /**
   * Save preferences to local storage.
   * @param  Object e Click event
   */
  document.getElementById("savePref").onclick = function(e) {
    var gender       = document.getElementById('userGender').value;
    var species      = document.getElementById('userSpecies').value;
    var role         = document.getElementById('userRole').value;
    var kinks        = document.getElementById('userKinks');
    var matchGender  = document.getElementById('partnerGender');
    var matchSpecies = document.getElementById('partnerSpecies');
    var matchRole    = document.getElementById('partnerRole').value;
    
    var selectedKinks = [];
    var selectedGenders = [];
    var selectedSpecies = [];
    
    for (var i=0; i<kinks.options.length; i++) {
      if (kinks.options[i].selected) {
        selectedKinks.push(kinks.options[i].value);
      }
    }
    
    for (var i=0; i<matchGender.options.length; i++) {
      if (matchGender.options[i].selected) {
        selectedGenders.push(matchGender.options[i].value);
      }
    }
    
    for (var i=0; i<matchSpecies.options.length; i++) {
      if (matchSpecies.options[i].selected) {
        selectedSpecies.push(matchSpecies.options[i].value);
      }
    }
    
    kinks = selectedKinks.join(',');
    matchGender = selectedGenders.join(',');
    matchSpecies = selectedSpecies.join(',');
  
    localStorage['gender'] = gender;
    localStorage['species'] = species;
    localStorage['role'] = role;
    localStorage['partnerGender'] = matchGender;
    localStorage['partnerSpecies'] = matchSpecies;
    localStorage['partnerRole'] = matchRole;
    localStorage['kinks'] = kinks;
  
    alert('Preferences have been saved.');
  };

  /**
   * Displays error regarding attempt to submit invalid prefences.
   */
  socket.on('invalid_preferences', () => {
    alert('You have attempted to submit invalid preferences. Please check your preferences again.');
    return false;
  });
}

module.exports = {
  listen: listen,
  loadSavedPreferences: loadSavedPreferences,
};