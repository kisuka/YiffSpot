const clients = {};
let usersOnline = 0;

module.exports = {
  getOnline: () => usersOnline,
  incrementOnline: () => usersOnline++,
  decrementOnline: () =>  usersOnline--,
  getAllClients: () => clients,
  addClient: (socket, token) => {
    clients[token] = {
      id: token,
      socket: socket,
      preferences: null,
      partner: null,
      blocks: [],
    }
  },
  addPreferences: (id, preferences) => {
    clients[id].preferences = preferences;
  },
  removeClient: (id) => {
    delete clients[id];
  },
  findClient: (id) => clients[id],
  pairPartners: (id, partner) => {
    clients[id].partner = partner;
    clients[partner].partner = id;
  },
  removePartner: (id) => {
    if (clients[id].partner) {
      if (clients[clients[id].partner]) {
        clients[clients[id].partner].partner = null;
      }
      clients[id].partner = null;
    }
  },
  blockPartner: (id, partner) => {
    clients[id].blocks.push(partner);
  },
  checkBlocks: (id, partner) => clients[id] && clients[id].blocks && clients[id].blocks.includes(partner)
}
