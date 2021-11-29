module.exports = (clients, data) => {
  clients.forEach((client) => {
    if (client.readyState != 1) return;
    client.send(JSON.stringify(data));
  });
}