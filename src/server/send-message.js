module.exports = (users, userId, message) => {
  const currentUser = users.findClient(userId);
  const partner = users.findClient(currentUser.partner);

  if (!partner.socket.isAlive) {
    return;
  }

  partner.socket.emit('receive_message', {
    content: message,
    isContributor: currentUser.isContributor,
  });
}