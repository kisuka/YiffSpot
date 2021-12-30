const originalTitle = document.title;
let flashAlert;

/**
 * Flash the title tab between different texts.
 * 
 * @param  String pageTitle       The original page title.
 * @param  String newMessageTitle The new page title to flash to.
 */
const flashTitle = (pageTitle, newMessageTitle) => {
  document.title = document.title == pageTitle ? newMessageTitle : pageTitle;
}

/**
 * Clear any alerts when window is active.
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState != 'visible' || !flashAlert) {
    return;
  }

  if (flashAlert) {
    clearInterval(flashAlert);
    flashAlert = null;
  }

  document.title = originalTitle;
});

/**
 * Alert the user of specific actions that have happened.
 * 
 * @param String message The message to alert the user with.
 */
const alertUser = (message) => {
  if (document.visibilityState != 'hidden') {
    return;
  }

  if (flashAlert) {
    clearInterval(flashAlert);
    window.title = originalTitle;
    flashAlert = null;
  }

  flashAlert = setInterval(() => flashTitle(originalTitle, message), 500);
  new Audio('/assets/notification.mp3').play();
}

module.exports = {
  alertUser: alertUser,
}