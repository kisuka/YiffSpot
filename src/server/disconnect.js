module.exports = (users, userId) => {
  const currentUser = users.findClient(userId);

  if (!currentUser) {
    return;
  }

  const partner = users.findClient(currentUser.partner);

  // Check if user has a partner
  if (partner) {
    // Disconnect user from partner.
    users.removePartner(currentUser.id);

    if (partner.socket.isAlive) {
      partner.socket.emit('partner_disconnected');
    }
  }

  // Remove disconnected user from clients list
  users.removeClient(currentUser.id);
  users.decrementOnline();

  console.log('User Disconnected... Total Users Online: %d', users.getOnline());
}
