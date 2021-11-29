module.exports = (users, token, status) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner);

  if (!partner || partner.partner != currentUser.id) {
    return;
  }

  if (partner.socket.readyState != 1) {
    return
  }

  partner.socket.send(JSON.stringify({ type: 'partner_typing', data: status }));
}