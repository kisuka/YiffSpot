const config  = require('./config');

const express = require('express');
const fs      = require('fs');
const marked  = require('marked');

const gender  = require("./src/models/gender");
const kinks   = require("./src/models/kinks");
const role    = require("./src/models/role");
const species = require("./src/models/species");

const router  = express.Router();

// Home Page
router.get('/', function(req, res) {
  res.render('home', {
    pageTitle: config.page_title,
    breeds: species.getAll(),
    genders: gender.getAll(),
    kinks: kinks.getAll(),
    roles: role.getAll(),
  });
});

// Changelog
router.get('/changes', function(req, res) {
  const file = fs.readFileSync('./CHANGELOG.md', 'utf8');
  res.send(marked(file.toString()));
});

module.exports = router;