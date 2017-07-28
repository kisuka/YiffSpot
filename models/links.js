var validLinks = [
  'imgur.com',
  'i.imgur.com',
  'e621.net',
  'static.e621.net',
  'furaffinity.net',
  'd.facdn.net',
];

module.exports = {
  getAll: function() {
    return validLinks;
  },
  find: function(value) {
    var result = validLinks.indexOf(value);

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}