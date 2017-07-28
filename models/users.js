var pendingUsers  = [];
var clients       = {};
var usersOnline   = 0;

module.exports = {
  getOnline: function() {
    return usersOnline;
  },
  incrementOnline: function() {
    return ++usersOnline;
  },
  decrementOnline: function() {
    return --usersOnline;
  },
  getAllClients: function() {
    return clients;
  },
  addClient: function(socket) {
    clients[socket.id] = socket;
    clients[socket.id].blocks = new Array;
  },
  removeClient: function(id) {
    delete clients[id];
  },
  findClient: function(id) {
    return clients[id];
  },
  addPartner: function(id, partner) {
    clients[id].partner = partner;
    clients[id].prevPartner = partner;
  },
  removePartner: function(id) {
    delete clients[id].partner;
  },
  getPendingUsers: function() {
    return pendingUsers;
  },
  blockPartner: function(id, partner) {
    clients[id].blocks.push(partner);
  },
  checkBlocks: function(id, partner) {
    if (clients[id] == undefined || clients[id].blocks == undefined) {
      return false;
    }

    var result = clients[id].blocks.indexOf(partner);

    if (result === -1) {
      return false;
    } else {
      return true;
    }
  },
}