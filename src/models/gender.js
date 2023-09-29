const genders = [
  'Male',
  'Female',
  'Gender Fluid',
  'Intersex',
  'Transgender',
  'Non-Binary',
  'Other'
];

module.exports = {
  getAll: () => genders,
  find: (value) => genders.includes(value)
}