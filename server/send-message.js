var string = require('string');
var url = require('url');
var validLinks = require("../models/links");

module.exports = function (socket) {
  /**
   * Handles sending a message to the user's partner.
   * @param  String message The message to send.
   */
  socket.on('send message', function(message) {
    var partner = socket.partner;
    var msg = string(message).stripTags().s;
    var links = new Array;
    var invalidLinks = false;
    
    if (!partner) {
      return false;
    }
    
    // Extract any links
    var regexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    while (matches = regexp.exec(msg)) {
      links.push(matches[0]);
    }
    
    // Check all links in message for possible malicious links.
    if (links.length > 0) {
      for (link in links) {
        var a = url.parse(links[link], true, true);
        if (validLinks.find(a.hostname) === false) {
          invalidLinks = true;
        }
      }
    }
    
    if (invalidLinks === true) {
      socket.emit('invalid links');
      return false;
    }

    socket.broadcast.to(partner.socketId).emit('receive message', { message: msg });
  });
}