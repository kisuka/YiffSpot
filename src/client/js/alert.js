'use strict';

var originalTitle = document.title;
var flashingTitle = false;
var windowFocus = true;
var flashAlert = null;

/**
 * Flash the title tab between different texts.
 * 
 * @param  String pageTitle       The original page title.
 * @param  String newMessageTitle The new page title to flash to.
 */
function flashTitle(pageTitle, newMessageTitle) {
  flashingTitle = true;
  
  if (document.title == pageTitle) {
    document.title = newMessageTitle;
  } else {
    document.title = pageTitle;
  }
}

/**
 * Check for is window was put in background.
 */
window.onblur = function() {
  windowFocus = false;
}

/**
 * Clear any alerts when window is active.
 */
window.onfocus = function() {
  windowFocus = true;

  if (flashingTitle == true) {
    clearInterval(flashAlert);
    document.title = originalTitle;
  }
}

/**
 * Alert the user of specific actions that have happened.
 * 
 * @param  String message The message to alert the user with.
 */
function alertUser(message) {
  if (windowFocus == false) {
    const notification = new Audio('/assets/notification.mp3');

    flashAlert = setInterval(function() {
      flashTitle(originalTitle, message);
    }, 500);

    notification.play();
  }
}

module.exports = {
  alertUser: alertUser,
};