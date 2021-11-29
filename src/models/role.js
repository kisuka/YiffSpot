const roles = [
  'Dominant',
  'Submissive',
  'Switch'
];

module.exports = {
  getAll: () => roles,
  find: (value) => roles.includes(value)
}