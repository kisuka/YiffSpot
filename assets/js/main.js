var socket = io();
var partner = false;

$(function() {
  $('.selectpicker').selectpicker();

  /**
   * Handles the submission of the user's yiffing preferences
   * and informs the server to find a partner.
   */
  $('#userSettings').submit(function(e) {
    e.preventDefault();

    var gender        = $('#userGender').val();
    var species       = $('#userSpecies').val();
    var kinks         = $('#userKinks').val();
    var matchGender   = $('#partnerGender').val();
    var matchSpecies  = $('#partnerSpecies').val();

    if (gender === '') {
      alert('Please select your gender.');
      return false;
    }
    if (species === '') {
      alert('Please select your species.');
      return false;
    }
    if (!matchGender) {
      alert('Please select the gender your seeking.');
      return false;
    }
    if (!matchSpecies) {
      alert('Please select the species your seeking.');
      return false;
    }
    if (!kinks) {
      alert('Please select the kinks you are interested in.');
      return false;
    }

    // Clear current message history
    $("#messages").empty();

    // Tell the server to find the user a yiffing partner
    socket.emit('find partner', [
      { 'gender': gender },
      { 'species': species },
      { 'kinks': kinks },
      { 'matchGender': matchGender },
      { 'matchSpecies': matchSpecies }
    ]);
  });


  /**
   * Handles the submission of a message using the chatbox
   * and informs the server to send a message to the partner.
   */
  $('#messageBox').submit(function(e) {
    e.preventDefault();

    var message = $('#message').val();

    if (message === '') {
      alert('Please enter a message.');
      return false;
    }

    if (message.length > 2000) {
      alert('Are you trying to send a novel? Calm down and shorten your message.');
      return false;
    }

    if (partner === false) {
      $('#message').val('');

      alert('You are not connected to a partner yet.');
      return false;
    }

    socket.emit('send message', message);

    newMessage(message, 'user');

    $('#message').val('');
  });


  /**
   * Informs the user that they've been connected with a yiffing partner.
   * @param  Object data The partner's yiffing preferences.
   */
  socket.on('partner connected', function(data) {
    newMessage('You have been connected with a yiffing partner!');
    newMessage("Your partner is a "+data.gender+" "+data.species+" interested in: "+data.kinks+".");
    partner = true;
  });


  /**
   * Informs the user that their yiffing partner has disconnected.
   */
  socket.on('partner disconnected', function() {
    newMessage('Your partner has disconnected!');
    partner = false;
  });


  /**
   * Informs the user that no yiffing partner has been found that matches their preferences.
   */
  socket.on('no match', function() {
    newMessage('Sorry, we are unable to match you with a partner. Please either continue to wait, or modify your yiffing preferences.');
  });


  /**
   * Handles the recieving of a message for the user.
   * @param  String data The message contents.
   * @param  String type The type of message.
   */
  socket.on('recieve message', function(data) {
    newMessage(data.message, 'partner');
  });
});


/**
 * Auto scroll chat window to bottom.
 */
function autoScroll() {
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}

/**
 * Handles the creation of a new message in the chat window.
 * @param  String message The message to be displayed.
 * @param  String type    The type of message to display.
 */
function newMessage(message, type) {
  if(type === 'user')
    $('#messages').append($('<li class="message message-user">').text(message));
  else if (type === 'partner')
    $('#messages').append($('<li class="message message-partner">').text(message));
  else
    $('#messages').append($('<li class="message message-system">').text(message));

  autoScroll();
}