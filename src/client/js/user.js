/**
 * [init description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
const init = () => {
  if (getData()) return;
  localStorage.setItem('user', JSON.stringify({
    id: null,
    hasPartner: false
  }));
}

/**
 * [getData description]
 * @return {[type]} [description]
 */
const getData = () => {
  const user = localStorage.getItem('user');
  return user && JSON.parse(user);
}

/**
 * [getPartner description]
 * @return {[type]} [description]
 */
const getPartner = () => {
  const user = getData();
  return user && user.hasPartner;
}

/**
 * [setPartner description]
 * @param {[type]} value [description]
 */
const setPartner = (value) => {
  const user = JSON.parse(localStorage.getItem('user'));
  user.hasPartner = value;
  localStorage.setItem('user', JSON.stringify(user));
}

const getId = () => {
  const user = getData();
  return user && user.id;
}

const setId = (value) => {
  const user = JSON.parse(localStorage.getItem('user'));
  user.id = value;
  localStorage.setItem('user', JSON.stringify(user));
}

const getSecret = () => {
  const user = getData();
  return user && user.secret;
}

const setSecret = (value) => {
  const user = JSON.parse(localStorage.getItem('user'));
  user.secret = value;
  localStorage.setItem('user', JSON.stringify(user));
}

module.exports = {
  init: init,
  getData: getData,
  getPartner: getPartner,
  setPartner: setPartner,
  getId: getId,
  setId: setId,
  getSecret: getSecret,
  setSecret: setSecret
};