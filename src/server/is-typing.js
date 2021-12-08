module.exports = (users, token, status) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner);

  if (!partner || partner.partner != currentUser.id) {
    return;
  }

  if (!partner.socket.isAlive) {
    return
  }

  partner.socket.emit('partner_typing', status);
}