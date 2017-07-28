var socket = io.connect();
var partner = false;
var typingTimer;

$(function() {
  loadSavedPreferences();

  var messageBox = document.getElementById("messageBox");

  $(window).on('beforeunload', function(e) {
    return 'Are you sure you want to leave Yiff Spot?';
  });

  $('.selectpicker').selectpicker();
  
  /**
   * Function that controls launching the find partner event.
   * @return void
   */
  function findPartner() {
    partner = false;

    var gender        = $('#userGender').val();
    var species       = $('#userSpecies').val();
    var role          = $('#userRole').val();
    var kinks         = $('#userKinks').val();
    var matchGender   = $('#partnerGender').val();
    var matchSpecies  = $('#partnerSpecies').val();
    var matchRole     = $('#partnerRole').val();

    if (gender === '') {
      alert('Please select your gender.');
      return false;
    }

    if (species === '') {
      alert('Please select your species.');
      return false;
    }

    if (role === '') {
      alert('Please select your role.');
      return false;
    }

    if (!matchGender) {
      alert("Please select the gender you're seeking.");
      return false;
    }

    if (!matchSpecies) {
      alert("Please select the species you're seeking.");
      return false;
    }

    if (!matchRole) {
      alert("Please select the role you're seeking.");
      return false;
    }

    if (!kinks) {
      alert("Please select the kinks you're interested in.");
      return false;
    }

    // Tell the server to find the user a yiffing partner
    socket.emit('find partner', {
      'user': {
        'gender': gender,
        'species': species,
        'role': role
      },
      'partner': {
        'gender': matchGender,
        'species': matchSpecies,
        'role': matchRole
      },
      'kinks': kinks,
    });
  }

  /**
   * Handles the submission of the user's yiffing preferences
   * and informs the server to find a partner.
   */
  $('#userSettings').submit(function(e) {
    e.preventDefault();

    if (partner) {
      if (!confirm('Are you sure you want to find a new partner?')) return false;

      newMessage('You have disconnected from your yiffing partner!');
    }

    findPartner();
  });

  /**
   * Handles if user is typing in the message box to send 'partner is typing' status.
   */
  messageBox.addEventListener("input", function(e) {
    if (partner == true) {
      clearTimeout(typingTimer);

      typingTimer = setTimeout(stoppedTyping, 2000);

      socket.emit('typing', true);
    }
  });

  function stoppedTyping() {
    socket.emit('typing', false);
  }

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

    stoppedTyping();
  });

  $('#savePref').on('click', function(e) {
    var gender       = $('#userGender').val();
    var species      = $('#userSpecies').val();
    var role         = $('#userRole').val();
    var kinks        = $('#userKinks').val();
    var matchGender  = $('#partnerGender').val();
    var matchSpecies = $('#partnerSpecies').val();
    var matchRole    = $('#partnerRole').val();

    localStorage['gender'] = gender;
    localStorage['species'] = species;
    localStorage['role'] = role;
    localStorage['partnerGender'] = matchGender;
    localStorage['partnerSpecies'] = matchSpecies;
    localStorage['partnerRole'] = matchRole;
    localStorage['kinks'] = kinks;

    alert('Preferences have been saved.');
  });
  
  $('#block-partner').on('click', function(e) {
    e.preventDefault();

    if (!confirm('Are you sure you want to block this partner?')) {
      return false;
    }

    socket.emit('block partner');
  });

  /**
   * Displays partner is typing status.
   * @param Boolean data True/False if the partner is typing or has stopped.
   */
  socket.on('partner typing', function(data) {
    if (data.status) {
      $('#typing').show();
    } else {
      $('#typing').hide();
    }
  });

  /**
   * Updates the users online count.
   * @param  Integer count The amount of users online.
   */
  socket.on('update user count', function(count) {
    $('#userCount').text(count);
  });

  /**
   * Informs the users of invalid values being submitted.
   */
  socket.on('invalid preferences', function() {
    alert('You have attempted to submit invalid preferences. Please check your preferences again.');
    return false;
  });
  
  /**
   * Informs the users of invalid links being submitted.
   */
  socket.on('invalid links', function() {
    alert('You have attempted to submit a possible malicious link. Please only use known image sites.');
    return false;
  });

  /**
   * Informs the user that they've been connected with a yiffing partner.
   * @param  Object data The partner's yiffing preferences.
   */
  socket.on('partner connected', function(data) {
    $("#welcome").hide();
    $("#chat").show();

    newMessage('You have been connected with a yiffing partner!');
    newMessage("Your partner is a "+data.role+", "+data.gender+", "+data.species+" interested in: "+data.kinks+".");
    partner = true;
    
    alertUser("Partner Connected!");
  });

  /**
   * Informs the user that their yiffing partner has disconnected.
   */
  socket.on('partner disconnected', function() {
    newMessage('Your partner has disconnected!');
    partner = false;
    $('#typing').hide();
  });
  
  /**
   * Informs the user that their yiffing partner has blocked.
   */
  socket.on('partner blocked', function() {
    if (partner) {
      partner = false;
      newMessage('Your partner has been blocked and disconnected from you!');
    } else {
      newMessage('Your previous partner has been blocked!');
    }
    
    $('#typing').hide();
  });

  /**
   * Informs the user that no yiffing partner has been found that matches their preferences.
   */
  socket.on('no match', function() {
    $("#welcome").hide();
    $("#chat").show();

    newMessage('Sorry, we are unable to match you with a partner. Please either continue to wait, or modify your yiffing preferences.');
  });

  /**
   * Handles the recieving of a message for the user.
   * @param  String data The message contents.
   * @param  String type The type of message.
   */
  socket.on('receive message', function(data) {
    newMessage(data.message, 'partner');
    alertUser("New Message!");
  });
});

/**
 * Plays a sound and adds an alert message to browser tab.
 * 
 * @param  string message The text for the alert message.
 * @return void
 */
function alertUser(message) {
  $.titleAlert(message, {
    requireBlur:true,
    stopOnFocus:true,
    duration:10000,
    interval:500
  });

  var notification = new Audio('/assets/notification.mp3');
  notification.play();
}

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

  if(type === 'user') {
    $('#messages li:last').before($('<li class="message message-user">').html(msg));
  }
  else if (type === 'partner') {
    $('#messages li:last').before($('<li class="message message-partner">').html(msg));
  }
  else {
    $('#messages li:last').before($('<li class="message message-system">').html(msg));
  }

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

/**
 * Select default options from localStorage saved options.
 */
function loadSavedPreferences() {
  if (localStorage['gender']) {
    $('#userGender').val(localStorage['gender']);
  }

  if (localStorage['species']) {
    $('#userSpecies').val(localStorage['species']);
  }

  if (localStorage['role']) {
    $('#userRole').val(localStorage['role']);
  }

  if (localStorage['partnerGender']) {
    $('#partnerGender').val(localStorage['partnerGender'].split(','));
  }

  if (localStorage['partnerSpecies']) {
    $('#partnerSpecies').val(localStorage['partnerSpecies'].split(','));
  }

  if (localStorage['partnerRole']) {
    $('#partnerRole').val(localStorage['partnerRole']);
  }

  if (localStorage['kinks']) {
    $('#userKinks').val(localStorage['kinks'].split(','));
  }
}
