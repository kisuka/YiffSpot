const SlimSelect = require('./../../../node_modules/slim-select/dist/slimselect');

const genderRepo = require('./../../models/gender'),
  kinksRepo = require('./../../models/kinks'),
  roleRepo = require('./../../models/role'),
  speciesRepo = require('./../../models/species');

const toast = require('./toast');

// Key = LocalStoage Key
// Value = Data from SlimSelect
const _updateStorage = (key, value) => {
  localStorage[key] = value.map(v => v.value).join(',');
}

/**
 * [initPreferences description]
 * @return {[type]} [description]
 */
const initPreferences = () => {
  new SlimSelect({
    select: '#userGender',
    showSearch: false,
    data: [{ value: '', text: 'Select Gender' }, ...genderRepo.getAll().map(item => {
      return { text: item };
    })],
    placeholder: true,
    onChange: (gender) => {
      localStorage['gender'] = gender.value;
    }
  });

  new SlimSelect({
    select: '#userSpecies',
    data: [{ value: '', text: 'Select Species' }, ...speciesRepo.getAll().map(item => {
      return { text: item };
    })],
    placeholder: true,
    onChange: (userSpecies) => {
      localStorage['species'] = userSpecies.value;
    }
  });

  new SlimSelect({
    select: '#userRole',
    showSearch: false,
    data: [{ value: '', text: 'Select Role' }, ...roleRepo.getAll().map(item => {
      return { text: item };
    })],
    placeholder: true,
    onChange: (role) => {
      localStorage['role'] = role.value;
    }
  });

  new SlimSelect({
    select: '#userKinks',
    data: [{ value: 'any', text: 'Any / All', selected: true }, ...kinksRepo.getAll().map(item => {
      return { text: item };
    })],
    onChange: (kinks) => {
      _updateStorage('kinks', kinks);
    }
  });

  new SlimSelect({
    select: '#partnerGender',
    data: [{ value: 'any', text: 'Any / All', selected: true }, ...genderRepo.getAll().map(item => {
      return { text: item };
    })],
    onChange: (partnerGender) => {
      _updateStorage('partnerGender', partnerGender);
    }
  });

  new SlimSelect({
    select: '#partnerRole',
    showSearch: false,
    data: [{ value: '', text: 'Select Role' }, ...roleRepo.getAll().map(item => {
      return { text: item };
    })],
    onChange: (partnerRole) => {
      localStorage['partnerRole'] = partnerRole.value;
    }
  });

  new SlimSelect({
    select: '#partnerSpecies',
    data: [{ value: 'any', text: 'Any / All', selected: true }, ...speciesRepo.getAll().map(item => {
      return { text: item };
    })],
    onChange: (species) => {
      _updateStorage('partnerSpecies', species);
    }
  });

  new SlimSelect({
    select: '#siteTheme',
    data: [{ value: 'dark', text: 'Dark', selected: true }, { value: 'light', text: 'Light' }],
    onChange: (theme) => {
      localStorage['theme'] = theme.value;
      loadTheme();
    }
  });

  loadPreferences();
  loadSettings();
  loadTheme();
}

/**
 * [loadPreferences description]
 * @return {[type]} [description]
 */
const loadPreferences = () => {
  const gendersSelect = document.getElementById('partnerGender'),
    kinksSelect = document.getElementById('userKinks'),
    speciesSelect = document.getElementById('partnerSpecies');

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
    const genders = localStorage['partnerGender'].split(',');
    
    for (let count = 0; count < gendersSelect.options.length; count++) {
      if (!genders.includes(gendersSelect.options[count].value)) {
        continue;
      }

      gendersSelect.options[count].selected = 'selected';
    }
  } else {
    gendersSelect.options[0].selected = 'selected';
  }

  if (localStorage['partnerSpecies']) {
    const species = localStorage['partnerSpecies'].split(',');
    
    for (let count = 0; count < speciesSelect.options.length; count++) {
      if (!species.includes(speciesSelect.options[count].value)) {
        continue;
      }

      speciesSelect.options[count].selected = 'selected';
    }
  } else {
    speciesSelect.options[0].selected = 'selected';
  }

  if (localStorage['partnerRole']) {
    document.getElementById('partnerRole').value = localStorage['partnerRole'];
  }

  if (localStorage['kinks']) {
    const kinks = localStorage['kinks'].split(',');

    for (let count = 0; count < kinksSelect.options.length; count++) {
      if (!kinks.includes(kinksSelect.options[count].value)) {
        continue;
      }

      kinksSelect.options[count].selected = 'selected';
    }
  } else {
    kinksSelect.options[0].selected = 'selected';
  }
}

/**
 * [loadSettings description]
 * @return {[type]} [description]
 */
const loadSettings = () => {
  if (!localStorage['theme']) {
    return;
  }

  document.getElementById('siteTheme').value = localStorage['theme'];
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
  load: loadPreferences,
  validate: validatePreferences,
  invalid: invalidPreferences,
  toggleMenu: toggleMenu,
  loadSettings: loadSettings,
  loadTheme: loadTheme,
};