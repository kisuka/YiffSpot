const languages = [
  'English',
  'Spanish',
  'French',
  'Deutsch',
  'Portuguese'
];

module.exports = {
  getAll: () => languages,
  find: (value) => languages.includes(value)
}