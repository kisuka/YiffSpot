const notify = require('./alert'),
  chat = require('./chat'),
  preferences = require('./preferences'),
  user = require('./user'),
  toast = require('./toast'),
  utility = require('./utility');

// https://stackoverflow.com/questions/46476741/nodejs-util-promisify-is-not-a-function/53506206
const promisify = f => (...args) => new Promise((a, b) => f(...args, (err, res) => err ? b(err) : a(res)));

const confirm = async (text) => {
  return await (promisify(toast.confirm))(text);
}

/**
 * [left description]
 * @return {[type]} [description]
 */
const left = () => {
  chat.addChatMessage('Your yiffing partner has left.', {
    class: 'message-system'
  });
  chat.hideChatTyping();
  notify.alertUser('Partner Left');
  user.setPartner(false);

  if (!document.getElementById('disconnect-row').classList.contains('hide-ele')) {
    document.getElementById('disconnect-row').classList.add('hide-ele');
  }
}

const reconnect = (data) => {
  const userKinks = preferences.validate().kinks;
  const partnerKinks = data.kinks.split(', ').map(utility.safe_tags_replace);
  const formattedPartnerKinks = partnerKinks.map((kink) => userKinks.includes(kink) ? `<span class="common_kink">${kink}</span>` : kink);

  chat.addChatMessage(`You have been connected to your previous partner because you got disconnected, Your partner is a ${utility.safe_tags_replace(data.role)}, ${utility.safe_tags_replace(data.gender)}, ${utility.safe_tags_replace(data.species)} interested in: ${formattedPartnerKinks.join(', ')}.`,
    { class: 'message-system', alreadyStripped: true });

  user.setPartner(true);
  document.getElementById('block-partner').classList.remove('hide-ele');
  document.getElementById('disconnect-row').classList.remove('hide-ele');
}

/**
 * [joined description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
const connected = (data) => {
  chat.showChatBox();

  chat.addChatMessage('You have been connected with a yiffing partner.', {
    class: 'message-system'
  });

  const userKinks = preferences.validate().kinks;
  const partnerKinks = data.kinks.split(', ').map(utility.safe_tags_replace);
  const formattedPartnerKinks = partnerKinks.map((kink) => userKinks.includes(kink) ? `<span class="common_kink">${kink}</span>` : kink);

  chat.addChatMessage(`Your partner is a ${utility.safe_tags_replace(data.role)}, ${utility.safe_tags_replace(data.gender)}, ${utility.safe_tags_replace(data.species)} interested in: ${formattedPartnerKinks.join(', ')}.`,
    { class: 'message-system', alreadyStripped: true });

  user.setPartner(true);
  notify.alertUser('Partner Connected');

  document.getElementById('block-partner').classList.remove('hide-ele');
  document.getElementById('disconnect-row').classList.remove('hide-ele');
}

/**
 * [blocked description]
 * @return {[type]} [description]
 */
const blocked = () => {
  if (user.getPartner()) {
    user.setPartner(false);
    chat.addChatMessage('Your partner has been blocked and disconnected from you.', {
      class: 'message-system'
    });
  } else {
    chat.addChatMessage('Your previous partner has been blocked.', {
      class: 'message-system'
    });
  }

  if (!document.getElementById('disconnect-row').classList.contains('hide-ele')) {
    document.getElementById('disconnect-row').classList.add('hide-ele');
  }

  if (!document.getElementById('block-partner').classList.contains('hide-ele')) {
    document.getElementById('block-partner').classList.add('hide-ele');
  }

  chat.hideChatTyping();
}

/**
 * [pending description]
 * @return {[type]} [description]
 */
const pending = () => {
  chat.showChatBox();
  chat.addChatMessage('' +
    'We are looking for a partner to match you with. ' +
    'Please either continue to wait, or modify your yiffing preferences and update it by pressing the \'Find Partner\' button.', {
    class: 'message-system'
  });
}

/**
 * [disconnected description]
 * @return {[type]} [description]
 */
const disconnected = () => {
  chat.addChatMessage('Your yiffing partner has disconnected unexpectedly.', {
    class: 'message-system'
  });

  chat.hideChatTyping();
  notify.alertUser('Partner Disconnected');
  user.setPartner(false);

  if (!document.getElementById('disconnect-row').classList.contains('hide-ele')) {
    document.getElementById('disconnect-row').classList.add('hide-ele');
  }
}

/**
 * [blockPartner description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
const blockPartner = async (socket) => {
  if (!(await confirm('Are you sure you want to block this partner?'))) {
    return false;
  }

  socket.emit('block_partner', true);
}

const findPartner = async (socket) => {
  const data = preferences.validate();

  if (!data) {
    return;
  }

  user.setPartner(false);
  socket.emit('find_partner', data);
  chat.showChatBox();

  if (document.getElementById('sidebar').classList.contains('active-sidebar')) {
    document.getElementById('sidebar').classList.toggle('active-sidebar');
  }

  if (!user.getPartner()) {
    return;
  }

  if (!(await confirm('Are you sure you want to find a new partner?'))) {
    return false;
  }

  chat.addChatMessage('You have disconnected from your previous partner.', {
    class: 'message-system'
  });
}

const disconnect = (socket) => {
  socket.emit('disconnect_from_partner');
}

module.exports = {
  find: findPartner,
  connected: connected,
  left: left,
  blocked: blocked,
  pending: pending,
  disconnected: disconnected,
  block: blockPartner,
  disconnect: disconnect,
  reconnect: reconnect
};
