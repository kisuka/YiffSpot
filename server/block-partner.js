var users = require("../models/users");

module.exports = function (socket) {
  socket.on('block partner', function () {
    var partner = socket.prevPartner;
    var clients = users.getAllClients();

    // Check if user has a partner
    if (partner) {
      if (clients[partner.socketId] != undefined &&
        clients[partner.socketId].partner != undefined &&
        clients[partner.socketId].partner.socketId == socket.id) {
        socket.broadcast.to(partner.socketId).emit('partner disconnected');
      }
      
      // Block partner
      users.blockPartner(socket.id, partner.socketId);
      users.removePartner(partner.socketId);

      socket.emit('partner blocked');
    }
  });
}