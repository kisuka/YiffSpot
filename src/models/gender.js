const genders = [
  'Male',
  'Female',
  'Herm',
  'Transgender',
  'Other'
];

module.exports = {
  getAll: () => genders,
  find: (value) => genders.includes(value)
}