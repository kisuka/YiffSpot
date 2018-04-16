'use strict';

/**
 * [init description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
function init() {
  if (getData() === false) {
    localStorage.setItem("user", JSON.stringify({
      id: null,
      hasPartner: false
    }));
  }
}

/**
 * [getData description]
 * @return {[type]} [description]
 */
function getData() {
  const user = localStorage.getItem("user");

  if (user === null) {
    return false;
  }

  return JSON.parse(user);
}

/**
 * [getPartner description]
 * @return {[type]} [description]
 */
function getPartner() {
  const user = getData();

  if (user === false) {
    return false;
  }

  return user.hasPartner;
}

/**
 * [setPartner description]
 * @param {[type]} value [description]
 */
function setPartner(value) {
  var user = JSON.parse(localStorage.getItem("user"));
  user.hasPartner = value;
  localStorage.setItem("user", JSON.stringify(user));
}

function getId() {
  const user = getData();

  if (user === false) {
    return false;
  }

  return user.id;
}

function setId(value) {
  var user = JSON.parse(localStorage.getItem("user"));
  user.id = value;
  localStorage.setItem("user", JSON.stringify(user));
}

module.exports = {
  init: init,
  getData: getData,
  getPartner: getPartner,
  setPartner: setPartner,
  getId: getId,
  setId: setId,
};