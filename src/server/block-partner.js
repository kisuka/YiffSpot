var users = require("../models/users");

module.exports = function (socket) {
  socket.on('block_partner', function () {
    var partner = socket.prevPartner;
    var clients = users.getAllClients();

    // Check if user has a partner
    if (partner) {
      if (clients[partner.socketId] != undefined &&
        clients[partner.socketId].partner != undefined &&
        clients[partner.socketId].partner.socketId == socket.id) {
        socket.broadcast.to(partner.socketId).emit('partner_disconnected');
      }
      
      // Block partner
      users.blockPartner(socket.id, partner.socketId);
      users.removePartner(partner.socketId);
      delete socket.partner;

      socket.emit('partner_blocked');
    }
  });
}