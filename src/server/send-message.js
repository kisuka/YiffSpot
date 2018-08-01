'use strict';

const getUrls = require('get-urls');
const url = require('url');

const validLinks = require("../models/links");

/**
 * Extract domain name without subdomain.
 * 
 * @param  String url The url to process.
 * @return String
 */
function getDomain(url) {
  if (url != null) {
    var parts = url.split('.').reverse();

    if (parts != null && parts.length == 1) {
      return url;
    }

    if (parts != null && parts.length >= 2) {
      var url = parts[1]+'.'+parts[0];
      return url;
    }
  }
}

module.exports = function (users, token, message) {
  var msg = message.replace(/(<([^>]+)>)/gi, "");
  var invalidLinks = false;

  var currentUser = users.findClient(token);
  var partner = users.findClient(currentUser.partner);

  if (!partner) {
    return false;
  }

  var urlList = getUrls(msg);

  urlList.forEach(function(link) {
    const urlToCheck = url.parse(link);
    
    if (validLinks.find(getDomain(urlToCheck.hostname)) === false) {
      invalidLinks = true;
    }
  });

  if (invalidLinks === true) {
    if (currentUser.socket.readyState == 1) {
      currentUser.socket.send(JSON.stringify({type:'invalid_links', data: true}));
    }
    return false;
  }

  if (partner.socket.readyState == 1) {
    partner.socket.send(JSON.stringify({type:'receive_message', data: msg}));
  }
}