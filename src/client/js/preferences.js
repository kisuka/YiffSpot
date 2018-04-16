'use strict';

const SlimSelect = require('./../../../node_modules/slim-select/dist/slimselect');

/**
 * [initPreferences description]
 * @return {[type]} [description]
 */
function initPreferences() {
  loadPreferences();

  new SlimSelect({select: '#userGender', showSearch: false});
  new SlimSelect({select: '#userSpecies'});
  new SlimSelect({select: '#userRole', showSearch: false});
  new SlimSelect({select: '#userKinks'});
  new SlimSelect({select: '#partnerGender'});
  new SlimSelect({select: '#partnerRole', showSearch: false});
  new SlimSelect({select: '#partnerSpecies'});
}

/**
 * [loadPreferences description]
 * @return {[type]} [description]
 */
function loadPreferences() {
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

/**
 * [savePreferences description]
 * @return {[type]} [description]
 */
function savePreferences(e) {
  e.preventDefault();

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
}

/**
 * [invalid description]
 * @return {[type]} [description]
 */
function invalidPreferences() {
  alert('You have attempted to submit invalid preferences. Please check your preferences again.');
    return false;
}

/**
 * [toggleMenu description]
 * @return {[type]} [description]
 */
function toggleMenu(e) {
  e.preventDefault();
  document.getElementById("sidebar").classList.toggle('active-sidebar');
}

/**
 * [validatePreferences description]
 * @return {[type]} [description]
 */
function validatePreferences() {
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

  if (gender === '') {
    alert('Please select your gender.');
    return false;
  }

  if (species === '') {
    alert('Please select your species.');
    return false;
  }

  if (role === '') {
    alert('Please select your role.');
    return false;
  }

  if (!matchGender) {
    alert("Please select the gender you're seeking.");
    return false;
  }

  if (!matchSpecies) {
    alert("Please select the species you're seeking.");
    return false;
  }

  if (!matchRole) {
    alert("Please select the role you're seeking.");
    return false;
  }

  if (!kinks) {
    alert("Please select the kinks you're interested in.");
    return false;
  }

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

  return {
    'user': {
      'gender': gender,
      'species': species,
      'role': role
    },
    'partner': {
      'gender': selectedGenders,
      'species': selectedSpecies,
      'role': matchRole
    },
    'kinks': selectedKinks,
  };
}

module.exports = {
  init: initPreferences,
  load: loadPreferences,
  save: savePreferences,
  validate: validatePreferences,
  invalid: invalidPreferences,
  toggleMenu: toggleMenu,
};