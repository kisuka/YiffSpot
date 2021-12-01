const genders = [
  'Male',
  'Female',
  'Gender Fluid',
  'Herm',
  'Transgender',
  'Other'
];

module.exports = {
  getAll: () => genders,
  find: (value) => genders.includes(value)
}