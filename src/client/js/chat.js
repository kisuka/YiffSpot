'use strict';

const user = require('./user');

/**
 * Append message to chat box.
 * 
 * @param String message The message to append.
 * @param Object options Various options.
 */
function addChatMessage(message, options)  {
  var msg = linkify(strip_tags(message));
  var messages = document.getElementById('messages');
  var newMessage = document.createElement("li");

  newMessage.className += 'message ';
  newMessage.className += options.class;
  newMessage.innerHTML = msg;

  messages.insertBefore(newMessage, messages.lastChild);
  messages.scrollTop = messages.scrollHeight;
}

/**
 * Shows the partner is typing message.
 */
function showChatTyping() {
  document.getElementById('typing').style.display = 'block';
}

/**
 * Hides the partner is typing message.
 */
function hideChatTyping() {
  document.getElementById('typing').style.display = 'none';
}

/**
 * Converts URLs to links.
 * @param  String text The text to parse.
 * @return String      The converted text.
 */
function linkify(text) {
  if (text) {
    text = text.replace(
      /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
      function(url){
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
            full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
      }
    );
  }

  return text;
}

/**
 * Strips tags from string.
 * @param  String text The raw string.
 * @return String      The cleaned string.
 */
function strip_tags(text) {
  return text.replace(/(<([^>]+)>)/ig, "");
}

/**
 * Hides welcome message and displays chat box.
 */
function showChatBox() {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
}

/**
 * [invalidLinkMessage description]
 * @return {[type]} [description]
 */
function invalidLinkMessage() {
  alert('You have attempted to submit a possible malicious link.');
  return false;
}

/**
 * [sendMessage description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function sendMessage(socket) {
  var message = document.getElementById('message');

  if (message.value.length <= 0) {
    alert('Please enter a message.');
    return false;
  }

  if (message.value.length >= 3000) {
    alert('Please shorten the length of your message.');
    return false;
  }

  if (user.getPartner() === false) {
    message.value = '';
    alert('You are not connected to a partner yet.');
    return false;
  }

  sendTypingStatus(socket, false);
  socket.send(JSON.stringify({type:'send_message', data: message.value}));

  addChatMessage(message.value, {class: 'message-user'});
  message.value = '';
}

/**
 * [sendTypingStatus description]
 * @return {[type]} [description]
 */
function sendTypingStatus(socket, status = true) {
  if (user.getPartner()) {
    socket.send(JSON.stringify({type:'typing', data: status}));
  }
}

module.exports = {
  addChatMessage: addChatMessage,
  showChatTyping: showChatTyping,
  hideChatTyping: hideChatTyping,
  showChatBox: showChatBox,
  invalid: invalidLinkMessage,
  sendMessage: sendMessage,
  sendTypingStatus: sendTypingStatus,
};