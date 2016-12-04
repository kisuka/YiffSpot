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
  },
  removeClient: function(id) {
    delete clients[id];
  },
  findClient: function(id) {
    return clients[id];
  },
  removePartner: function(id) {
    delete clients[id].partner;
  },
  getPendingUsers: function() {
    return pendingUsers;
  }
}