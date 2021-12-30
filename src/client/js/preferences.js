const TomSelect = require('./../../../node_modules/tom-select/dist/js/tom-select.complete.js');

const genderRepo = require('./../../models/gender'),
  kinksRepo = require('./../../models/kinks'),
  roleRepo = require('./../../models/role'),
  speciesRepo = require('./../../models/species');

const toast = require('./toast');

// Key = LocalStoage Key
// Value = Data from TomSelect
const _updateStorage = (key, value) => {
  localStorage[key] = value.join(',');
}

/**
 * [initPreferences description]
 * @return {[type]} [description]
 */
const initPreferences = () => {
  new TomSelect('#userGender', {
    options: [{ value: '', text: 'Select Gender' }, ...genderRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['gender'] || [''],
    onChange: (gender) => {
      localStorage['gender'] = gender;
    }
  });

  new TomSelect('#userSpecies', {
    options: [{ value: '', text: 'Select Species' }, ...speciesRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['species'] || [''],
    onChange: (userSpecies) => {
      localStorage['species'] = userSpecies;
    }
  });

  new TomSelect('#userRole', {
    options: [{ value: '', text: 'Select Role' }, ...roleRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['role'] || [''],
    onChange: (role) => {
      localStorage['role'] = role;
    }
  });

  new TomSelect('#userKinks', {
    options: [{ value: 'any', text: 'Any / All' }, ...kinksRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['kinks'] && localStorage['kinks'].split(',') || ['any'],
    onChange: (kinks) => {
      _updateStorage('kinks', kinks);
    }
  });

  new TomSelect('#partnerGender', {
    options: [{ value: 'any', text: 'Any / All' }, ...genderRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['partnerGender'] && localStorage['partnerGender'].split(',') || ['any'],
    onChange: (partnerGender) => {
      _updateStorage('partnerGender', partnerGender);
    }
  });

  new TomSelect('#partnerRole', {
    options: [{ value: '', text: 'Select Role' }, ...roleRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['partnerRole'] || [''],
    onChange: (partnerRole) => {
      localStorage['partnerRole'] = partnerRole;
    }
  });

  new TomSelect('#partnerSpecies', {
    options: [{ value: 'any', text: 'Any / All' }, ...speciesRepo.getAll().map(item => {
      return { value: item, text: item };
    })],
    items: localStorage['partnerSpecies'] && localStorage['partnerSpecies'].split(',') || ['any'],
    onChange: (species) => {
      _updateStorage('partnerSpecies', species);
    }
  });

  new TomSelect('#siteTheme', {
    options: [{ value: 'dark', text: 'Dark' }, { value: 'light', text: 'Light' }],
    items: localStorage['theme'] || ['dark'],
    onChange: (theme) => {
      localStorage['theme'] = theme;
      loadTheme();
    }
  });

  loadTheme();
}

const loadTheme = () => {
  if (!localStorage['theme'] || localStorage['theme'] != 'light') {
    document.body.classList.add('dark');
    document.getElementById('navbar').classList.add('navbar-dark');
    document.getElementById('navbar').classList.remove('navbar-light');
  } else {
    document.body.classList.remove('dark');
    document.getElementById('navbar').classList.remove('navbar-dark');
    document.getElementById('navbar').classList.add('navbar-light');
  }
}

/**
 * [invalid description]
 * @return {[type]} [description]
 */
const invalidPreferences = () => {
  toast.toast('You have attempted to submit invalid preferences. Please check your preferences again.', 'bg-danger');
  return false;
}

/**
 * [toggleMenu description]
 * @return {[type]} [description]
 */
const toggleMenu = (e) => {
  e.preventDefault();
  document.getElementById('sidebar').classList.toggle('active-sidebar');
  document.getElementById('chat').style.display = document.getElementById('sidebar').classList.contains('active-sidebar') || !document.getElementById('welcome').classList.contains('hidden') ? 'none' : 'flex';
  document.getElementById('welcome').style.display = document.getElementById('sidebar').classList.contains('active-sidebar') || document.getElementById('welcome').classList.contains('hidden') ? 'none' : 'flex';
}

/**
 * [validatePreferences description]
 * @return {[type]} [description]
 */
const validatePreferences = () => {
  const gender = document.getElementById('userGender').value,
    species = document.getElementById('userSpecies').value,
    role = document.getElementById('userRole').value,
    kinks = document.getElementById('userKinks'),
    matchGender = document.getElementById('partnerGender'),
    matchSpecies = document.getElementById('partnerSpecies'),
    matchRole = document.getElementById('partnerRole').value;

  const selectedKinks = [];
  const selectedGenders = [];
  const selectedSpecies = [];

  let validPreferences = true;

  const assertToastMessage = (condition, message) => {
    if (!condition) {
      toast.toast(message, 'bg-danger');
    }

    return condition
  }

  validPreferences = validPreferences && assertToastMessage(gender !== '', 'Please select your gender.');
  validPreferences = validPreferences && assertToastMessage(species !== '', 'Please select your species.');
  validPreferences = validPreferences && assertToastMessage(role !== '', 'Please select your role.');
  validPreferences = validPreferences && assertToastMessage(matchGender, 'Please select the gender you\'re seeking.');
  validPreferences = validPreferences && assertToastMessage(matchSpecies !== '', 'Please select the species you\'re seeking.');
  validPreferences = validPreferences && assertToastMessage(matchRole !== '', 'Please select the role you\'re seeking.');
  validPreferences = validPreferences && assertToastMessage(kinks !== '', 'Please select the kinks you\'re interested in.');

  if (!validPreferences) {
    return false;
  }

  for (let i = 0; i < kinks.options.length; i++) {
    if (kinks.options[i].selected) {
      selectedKinks.push(kinks.options[i].value);
    }
  }

  for (let i = 0; i < matchGender.options.length; i++) {
    if (matchGender.options[i].selected) {
      selectedGenders.push(matchGender.options[i].value);
    }
  }

  for (let i = 0; i < matchSpecies.options.length; i++) {
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
  validate: validatePreferences,
  invalid: invalidPreferences,
  toggleMenu: toggleMenu,
  loadTheme: loadTheme,
};