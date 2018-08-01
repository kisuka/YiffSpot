const config  = require('./config');

const express = require('express');
const fs      = require('graceful-fs');

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

module.exports = router;