module.exports = (users, token) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner || clientUser.previousPartner);

  if (!partner) {
    return;
  }

  const clients = users.getAllClients();

  // Block partner
  users.removePartner(currentUser.id);
  users.blockPartner(token, partner.id);

  // Send generic left message to partner so they don't feel sad.
  if (clients[partner.id] && clients[partner.id].partner && partner.socket.readyState == 1) {
    partner.socket.send(JSON.stringify({ type: 'partner_left', data: true }));
  }

  if (currentUser.socket.readyState == 1) {
    currentUser.socket.send(JSON.stringify({ type: 'partner_blocked', data: true }));
  }
}
