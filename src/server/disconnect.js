module.exports = (users, token, socket) => {
  const currentUser = users.findClient(token);

  // Only the socket that owns the session may end it, not an older one for the same browser closing late.
  if (!currentUser || currentUser.socket !== socket) {
    return;
  }

  const partner = users.findClient(currentUser.partner);

  // Check if user has a partner
  if (partner) {
    // Disconnect user from partner.
    users.removePartner(currentUser.id);

    if (partner.socket.readyState == 1) {
      partner.socket.send(JSON.stringify({type: 'partner_disconnected', data: true}));
    }
  }

  // Remove disconnected user from clients list
  users.removeClient(currentUser.id);
  users.decrementOnline();
}
