module.exports = (users, token, message) => {
  const currentUser = users.findClient(token);
  const partner = users.findClient(currentUser.partner);

  if (partner.socket.readyState != 1) {
    return;
  }

  partner.socket.send(JSON.stringify({ type: 'receive_message', data: message }));
}