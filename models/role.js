var roles = [
  'Dominant',
  'Submissive',
  'Switch'
];

module.exports = {
  getAll: function() {
    return roles;
  },
  find: function(value) {
    var result = roles.indexOf(value)

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}