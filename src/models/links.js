var validLinks = [
  'imgur.com',
  'e621.net',
  'furaffinity.net',
  'facdn.net',
  'f-list.net',
  'unsee.cc',
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
