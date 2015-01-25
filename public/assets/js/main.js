var socket = io.connect();
var partner = false;

$(function() {
  $(window).on('beforeunload', function(e) {
    return 'Are you sure you want to leave Yiff Spot?';
  });

  $('.selectpicker').selectpicker();

  /**
   * Handles the submission of the user's yiffing preferences
   * and informs the server to find a partner.
   */
  $('#userSettings').submit(function(e) {
    e.preventDefault();

    if (partner) {
      if (!confirm('Are you sure you want to find a new partner?'))
        return false;
    }

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
   * Updates the users online count.
   * @param  Integer count The amount of users online.
   */
  socket.on('update user count', function(count) {
    $('#userCount').text(count);
  });

  /**
  *	Informs the user of an invalid message being submitted.
  */
  socket.on('invalid message',function(){
	alert('The message you entered was invalid and was not sent to your chat partner.');
	return false;
  }
  
  /**
   * Informs the users of invalid values being submitted.
   */
  socket.on('invalid preferences', function() {
    alert('You have attempted to submit invalid preferences. Please check your preferences again.');
    return false;
  });

  /**
   * Informs the user that they've been connected with a yiffing partner.
   * @param  Object data The partner's yiffing preferences.
   */
  socket.on('partner connected', function(data) {
    $("#welcome").hide();
    $("#chat").show();

    // Clear current message history
    $("#messages").empty();

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
    $("#welcome").hide();
    $("#chat").show();

    // Clear current message history
    $("#messages").empty();

    newMessage('Sorry, we are unable to match you with a partner. Please either continue to wait, or modify your yiffing preferences.');
  });

  /**
   * Handles the recieving of a message for the user.
   * @param  String data The message contents.
   * @param  String type The type of message.
   */
  socket.on('receive message', function(data) {
    newMessage(data.message, 'partner');
    
    $.titleAlert("New Message!", {
        requireBlur:true,
        stopOnFocus:true,
        duration:10000,
        interval:500
    });
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
  var msg = linkify(strip_tags(message));

  if(type === 'user')
    $('#messages').append($('<li class="message message-user">').html(msg));
  else if (type === 'partner')
    $('#messages').append($('<li class="message message-partner">').html(msg));
  else
    $('#messages').append($('<li class="message message-system">').html(msg));

  autoScroll();
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
