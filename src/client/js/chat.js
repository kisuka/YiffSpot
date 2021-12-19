const user = require('./user'),
  utility = require('./utility'),
  toast = require('./toast');

/**
 * Append message to chat box.
 * 
 * @param String message The message to append.
 * @param Object options Various options.
 */
const addChatMessage = (message, options, dontAddToLog = false) => {
  let msg = options.alreadyStripped ? message : utility.safe_tags_replace(message);
  const matches = msg.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);

  if (matches) {
    matches.forEach(match => {
      msg = msg.replace(match, `<a href="${utility.safe_tags_replace(match)}" target="_blank">${utility.safe_tags_replace(match)}</a>`);
    });
  }

  const messages = document.getElementById('messages');
  const newMessage = document.createElement('li');

  if (!dontAddToLog) {
    chatLog.push({
      message: msg,
      class: options.class
    });
    localStorage.setItem('chatLog', JSON.stringify(chatLog));
  }

  newMessage.className += 'message ';
  newMessage.className += options.class;
  newMessage.innerHTML = msg;

  const isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;

  messages.insertBefore(newMessage, document.getElementById('typing'));
  if (isScrolledToBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
}

let chatLog = JSON.parse(localStorage.getItem('chatLog') || "[]");

const clearChat = () => {
  document.getElementById('messages').innerHTML = "<li class=\"typing message message-system\" id=\"typing\">Your partner is typing...</li>";
  chatLog = [];
  localStorage.setItem('chatLog', '[]');
}

const reloadChat = () => {
  chatLog.forEach(e => {
    addChatMessage(e.message, {
      alreadyStripped: true,
      class: e.class
    }, true);
  });
}


/**
 * Shows the partner is typing message.
 */
const showChatTyping = () => {
  const messages = document.getElementById('messages');
  const isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
  document.getElementById('typing').style.display = 'block';
  if (isScrolledToBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
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
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('chat').style.display = 'flex';
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
  socket.emit('send_message', message.value);

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
  socket.emit('typing', status);
}

module.exports = {
  addChatMessage: addChatMessage,
  showChatTyping: showChatTyping,
  hideChatTyping: hideChatTyping,
  showChatBox: showChatBox,
  sendMessage: sendMessage,
  sendTypingStatus: sendTypingStatus,
  clearChat: clearChat,
  reloadChat: reloadChat
};