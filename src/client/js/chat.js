const user = require('./user'),
  toast = require('./toast');

const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

const replaceTag = (tag) => tagsToReplace[tag] || tag;

const safe_tags_replace = (str) => str.replace(/[&<>]/g, replaceTag);

/**
 * Append message to chat box.
 * 
 * @param String message The message to append.
 * @param Object options Various options.
 */
const addChatMessage = (message, options) => {
  let msg = options.alreadyStripped ? message : safe_tags_replace(message);
  const matches = msg.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);

  if (matches) {
    matches.forEach(match => {
      msg = msg.replace(match, `<a href="${safe_tags_replace(match)}" target="_blank">${safe_tags_replace(match)}</a>`);
    });
  }

  const messages = document.getElementById('messages');
  const newMessage = document.createElement('li');

  newMessage.className += 'message ';
  newMessage.className += options.class;
  newMessage.innerHTML = msg;

  messages.insertBefore(newMessage, document.getElementById('typing'));
  messages.scrollTop = messages.scrollHeight;
}

/**
 * Shows the partner is typing message.
 */
const showChatTyping = () => {
  document.getElementById('typing').style.display = 'block';
}

/**
 * Hides the partner is typing message.
 */
const hideChatTyping = () => {
  document.getElementById('typing').style.display = 'none';
}

/**
 * Hides welcome message and displays chat box.
 */
const showChatBox = () => {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

/**
 * [sendMessage description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
const sendMessage = (socket) => {
  const message = document.getElementById('message');

  if (message.value.length <= 0) {
    toast.toast('Please enter a message.', 'bg-danger');
    return false;
  }

  if (message.value.length >= 3000) {
    toast.toast('Please shorten the length of your message.', 'bg-danger');
    return false;
  }

  if (user.getPartner() === false) {
    toast.toast('You are not connected to a partner yet.', 'bg-danger');
    return false;
  }

  sendTypingStatus(socket, false);
  socket.send(JSON.stringify({ type: 'send_message', data: message.value }));

  addChatMessage(message.value, { class: 'message-user' });
  message.value = '';
}

/**
 * [sendTypingStatus description]
 * @return {[type]} [description]
 */
const sendTypingStatus = (socket, status = true) => {
  if (!user.getPartner()) {
    return;
  }
  socket.send(JSON.stringify({ type: 'typing', data: status }));
}

module.exports = {
  addChatMessage: addChatMessage,
  showChatTyping: showChatTyping,
  hideChatTyping: hideChatTyping,
  showChatBox: showChatBox,
  sendMessage: sendMessage,
  sendTypingStatus: sendTypingStatus,
  safe_tags_replace: safe_tags_replace
};