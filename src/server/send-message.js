'use strict';

var string = require('string');
var url = require('url');

var validLinks = require("../models/links");

module.exports = function (socket, users, token) {
  /**
   * Handles sending a message to the user's partner.
   * @param  String message The message to send.
   */
  socket.on('send_message', function(message) {
    var msg = string(message).stripTags().s;
    var links = new Array;
    var matches;
    var invalidLinks = false;

    var currentUser = users.findClient(token);
    var partner = users.findClient(currentUser.partner);
    
    if (!partner) {
      return false;
    }
    
    // Extract any links
    var regexp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

    while (matches = regexp.exec(msg)) {
      links.push(matches[0]);
    }
    
    // Check all links in message for possible malicious links.
    if (links.length > 0) {
      for (var link in links) {
        var domain = links[link];
        if (!/^(?:f|ht)tps?\:\/\//.test(domain)) {
          domain = "http://" + domain;
        }
        
        var a = url.parse(domain, true, true);
        if (validLinks.find(getDomain(a.hostname)) === false) {
          invalidLinks = true;
        }
      }
    }
    
    if (invalidLinks === true) {
      socket.emit('invalid_links');
      return false;
    }

    socket.broadcast.to(partner.socket.id).emit('receive_message', { message: msg });
  });
}

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