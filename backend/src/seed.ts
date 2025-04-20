import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import Game from './models/game.model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ec_gamebazaar')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed users
const seedUsers = async () => {
  try {
    console.log('Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Create regular users
    await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123',
      role: 'user'
    });
    
    await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123',
      role: 'user'
    });
    
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Seed games
const seedGames = async () => {
  try {
    console.log('Seeding games...');
    
    // Clear existing games
    await Game.deleteMany({});
    
    // Create sample games
    const games = [
      {
        title: 'Cyber Knight 2077',
        description: 'An open-world RPG set in a dystopian future where cybernetic enhancements are the norm.',
        price: 59.99,
        discountPrice: 49.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Cyber+Knight+2077',
        images: [
          'https://via.placeholder.com/800x600?text=Screenshot+1',
          'https://via.placeholder.com/800x600?text=Screenshot+2',
          'https://via.placeholder.com/800x600?text=Screenshot+3'
        ],
        categories: ['RPG', 'Action', 'Open World'],
        tags: ['cyberpunk', 'futuristic', 'rpg', 'single-player'],
        platform: ['PC', 'PlayStation', 'Xbox'],
        releaseDate: new Date('2023-11-15'),
        publisher: 'CD Project Purple',
        developer: 'Project Purple Studio',
        rating: 4.5,
        featuredGame: true,
        stockCount: 100
      },
      {
        title: 'Galaxy Legends',
        description: 'A space-themed MMORPG where players can explore planets, trade resources, and battle alien species.',
        price: 39.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Galaxy+Legends',
        images: [
          'https://via.placeholder.com/800x600?text=GL+Screenshot+1',
          'https://via.placeholder.com/800x600?text=GL+Screenshot+2',
        ],
        categories: ['MMORPG', 'Adventure', 'Sci-Fi'],
        tags: ['space', 'multiplayer', 'aliens', 'exploration'],
        platform: ['PC'],
        releaseDate: new Date('2023-08-22'),
        publisher: 'Cosmic Games',
        developer: 'Star Studio',
        rating: 4.2,
        featuredGame: true,
        stockCount: 75
      },
      {
        title: 'Medieval Dynasty',
        description: 'Build your own medieval village, manage resources, and ensure your dynasty survives through generations.',
        price: 29.99,
        discountPrice: 19.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Medieval+Dynasty',
        images: [
          'https://via.placeholder.com/800x600?text=MD+Screenshot+1',
          'https://via.placeholder.com/800x600?text=MD+Screenshot+2',
        ],
        categories: ['Simulation', 'Strategy', 'Medieval'],
        tags: ['building', 'management', 'survival', 'historical'],
        platform: ['PC', 'PlayStation'],
        releaseDate: new Date('2023-03-10'),
        publisher: 'Ancient Games',
        developer: 'History Interactive',
        rating: 4.0,
        featuredGame: false,
        stockCount: 50
      },
      {
        title: 'Racing Thunder',
        description: 'High-speed racing game featuring the world's most exotic cars and challenging tracks.',
        price: 49.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Racing+Thunder',
        images: [
          'https://via.placeholder.com/800x600?text=RT+Screenshot+1',
          'https://via.placeholder.com/800x600?text=RT+Screenshot+2',
        ],
        categories: ['Racing', 'Sports', 'Simulation'],
        tags: ['cars', 'multiplayer', 'competitive', 'realistic'],
        platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo'],
        releaseDate: new Date('2023-05-18'),
        publisher: 'Speed Entertainment',
        developer: 'Nitro Studios',
        rating: 4.7,
        featuredGame: true,
        stockCount: 85
      },
      {
        title: 'Dungeon Explorers',
        description: 'A cooperative dungeon crawler with procedurally generated levels and hundreds of unique items and enemies.',
        price: 34.99,
        discountPrice: 24.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Dungeon+Explorers',
        images: [
          'https://via.placeholder.com/800x600?text=DE+Screenshot+1',
          'https://via.placeholder.com/800x600?text=DE+Screenshot+2',
        ],
        categories: ['RPG', 'Dungeon Crawler', 'Co-op'],
        tags: ['fantasy', 'multiplayer', 'roguelike', 'loot'],
        platform: ['PC', 'PlayStation', 'Nintendo'],
        releaseDate: new Date('2023-02-14'),
        publisher: 'Dungeon Masters Inc',
        developer: 'Crypt Games',
        rating: 4.3,
        featuredGame: false,
        stockCount: 60
      },
      {
        title: 'Ocean Depths',
        description: 'Explore the mysteries of the deep sea in this atmospheric underwater adventure game.',
        price: 24.99,
        mainImage: 'https://via.placeholder.com/600x400?text=Ocean+Depths',
        images: [
          'https://via.placeholder.com/800x600?text=OD+Screenshot+1',
          'https://via.placeholder.com/800x600?text=OD+Screenshot+2',
        ],
        categories: ['Adventure', 'Exploration', 'Indie'],
        tags: ['underwater', 'atmospheric', 'mystery', 'puzzle'],
        platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo'],
        releaseDate: new Date('2023-07-07'),
        publisher: 'Deep Blue Interactive',
        developer: 'Abyss Studios',
        rating: 4.6,
        featuredGame: true,
        stockCount: 45
      }
    ];
    
    await Game.insertMany(games);
    
    console.log('Games seeded successfully');
  } catch (error) {
    console.error('Error seeding games:', error);
  }
};

// Run the seed functions
const seedDatabase = async () => {
  try {
    await seedUsers();
    await seedGames();
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();