module.exports = (users, token, message) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner);

  if (!partner.socket.isAlive) {
    return;
  }

  partner.socket.emit('receive_message', {
    content: message,
    isContributor: currentUser.isContributor,
  });
}