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
      previousPartner: null,
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
      const partner = clients[clients[id].partner];
      if (partner) {
        partner.partner = null;
        partner.previousPartner = id;
        clients[id].previousPartner = clients[id].partner
      }
      clients[id].partner = null;
    }
  },
  blockPartner: (id, partner) => {
    clients[id].blocks.push(partner);
  },
  checkBlocks: (id, partner) => clients[id] && clients[id].blocks && clients[id].blocks.includes(partner)
}
