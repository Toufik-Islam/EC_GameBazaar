const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config();

// Load models
const Game = require('./models/Game');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const games = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'games.json'), 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data', 'users.json'), 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Game.create(games);
    await User.create(users);
    
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Game.deleteMany();
    await User.deleteMany();
    
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide proper command: -i (import) or -d (delete)');
  process.exit();
}