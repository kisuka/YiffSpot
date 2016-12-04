var species = [
  'Alligator',
  'Arachnid',
  'Badger',
  'Bat',
  'Bear',
  'Bird',
  'Bovine',
  'Cat',
  'Cheetah',
  'Corvid',
  'Cougar',
  'Coyote',
  'Crocodile',
  'Deer',
  'Digimon',
  'Dinosaur',
  'Dog',
  'Dolphin',
  'Donkey',
  'Dragon',
  'Elephant',
  'Ferret',
  'Fish',
  'Fox',
  'Frog',
  'Giraffe',
  'Gryphon',
  'Hedgehog',
  'Horse',
  'Human',
  'Hydra',
  'Hyena',
  'Iguana',
  'Insect',
  'Jackal',
  'Kangaroo',
  'Koala',
  'Leopard',
  'Lion',
  'Lizard',
  'Lynx',
  'Mouse',
  'Newt',
  'Ocelot',
  'Other',
  'Otter',
  'Panda',
  'Panther',
  'Pegasus',
  'Pig/Swine',
  'Pokemon',
  'Primate',
  'Rabbit',
  'Raccoon',
  'Rat',
  'Red Panda',
  'Salamander',
  'Seal',
  'Sergal',
  'Shark',
  'Sheep',
  'Skunk',
  'Snake',
  'Squirrel',
  'Tiger',
  'Turtle',
  'Unicorn',
  'Whale',
  'Wolf',
  'Zebra'
];

module.exports = {
  getAll: function() {
    return species;
  },
  find: function(value) {
    var result = species.indexOf(value)

    if (result === -1) {
      return false;
    } else {
      return result;
    }
  }
}