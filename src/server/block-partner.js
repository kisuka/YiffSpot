module.exports = (users, token) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner || currentUser.previousPartner);

  if (!partner) {
    return;
  }

  // Block partner
  users.removePartner(currentUser.id);
  users.blockPartner(token, partner.id);

  // Send generic left message to partner so they don't feel sad.
  if (partner.socket.readyState == 1) {
    partner.socket.emit('partner_left');
  }

  if (currentUser.socket.readyState == 1) {
    currentUser.socket.emit('partner_blocked');
  }
}
