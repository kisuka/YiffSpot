var express = require('express');
var app = express();
var router  = express.Router();

var gender  = require("./../models/gender");
var kinks   = require("./../models/kinks");
var role    = require("./../models/role");
var species = require("./../models/species");

/* GET index */
router.get('/', function(req, res) {
  res.render('home', {
    pageTitle: 'Yiff Spot | Yiff With Random Furries!',
    breeds: species.getAll(),
    genders: gender.getAll(),
    kinks: kinks.getAll(),
    roles: role.getAll()
  });
});

module.exports = router;