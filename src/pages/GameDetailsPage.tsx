
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Rating,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Share,
  FileDownload,
  Computer,
  Storage,
  Memory,
  PhoneAndroid,
} from '@mui/icons-material';

// Temporary game data - would be fetched from API in real app
const MOCK_GAMES = [
  {
    id: 1,
    title: 'Cyber Adventure 2077',
    price: 59.99,
    discountPrice: 49.99,
    rating: 4.5,
    images: [
      'https://via.placeholder.com/800x450?text=Cyber+Adventure+Screenshot+1',
      'https://via.placeholder.com/800x450?text=Cyber+Adventure+Screenshot+2',
      'https://via.placeholder.com/800x450?text=Cyber+Adventure+Screenshot+3',
      'https://via.placeholder.com/800x450?text=Cyber+Adventure+Screenshot+4'
    ],
    category: 'action',
    publisher: 'Game Studio X',
    developer: 'Game Studio X',
    releaseDate: '2023-05-15',
    description: `Experience the future in this open-world action game. Cyber Adventure 2077 takes you to a dystopian future where corporations rule the world and cybernetic enhancements are the norm.
    
    Features:
    - Immersive open world
    - Customizable character with unique abilities
    - Multiple endings based on your choices
    - Stunning graphics and realistic physics
    - Over 100 hours of gameplay
    `,
    systemRequirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i5-4670K or AMD Ryzen 3 1300X',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GTX 970 or AMD Radeon RX 570',
        storage: '70 GB available space',
      },
      recommended: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i7-8700K or AMD Ryzen 5 3600X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 3060 or AMD Radeon RX 6700 XT',
        storage: '70 GB SSD',
      }
    },
    reviews: [
      {
        id: 1,
        user: 'GamerX',
        avatar: 'https://via.placeholder.com/50',
        rating: 5,
        date: '2023-06-10',
        comment: 'One of the best games I\'ve played. The story is amazing and the graphics are stunning!',
      },
      {
        id: 2,
        user: 'RPGLover',
        avatar: 'https://via.placeholder.com/50',
        rating: 4,
        date: '2023-06-05',
        comment: 'Great game with a lot of content. Some minor bugs but overall excellent experience.',
      },
      {
        id: 3,
        user: 'GameCritic',
        avatar: 'https://via.placeholder.com/50',
        rating: 4.5,
        date: '2023-05-20',
        comment: 'Impressive world-building and character development. The side quests are as engaging as the main story.',
      }
    ],
    installationGuide: 'installation_guide_cyber_adventure.pdf',
    videoTutorial: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-tabpanel-${index}`}
      aria-labelledby={`game-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Find game by ID
  const game = MOCK_GAMES.find(game => game.id === Number(id)) || MOCK_GAMES[0];
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Review submitted! (This would be sent to the server in a real app)');
    setReviewText('');
    setReviewRating(null);
  };
  
  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
  };
  
  return (
    <Box>
      {/* Game Title and Basic Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {game.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Chip label={`${game.category.charAt(0).toUpperCase() + game.category.slice(1)}`} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={game.rating} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({game.reviews.length} reviews)
            </Typography>
          </Box>
          <Typography variant="body2">
            Release Date: {game.releaseDate}
          </Typography>
          <Typography variant="body2">
            Publisher: {game.publisher}
          </Typography>
          <Typography variant="body2">
            Developer: {game.developer}
          </Typography>
        </Box>
      </Box>
      
      {/* Game Images and Purchase Info */}
      <Grid container spacing={4}>
        {/* Images Section */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={game.images[selectedImage]}
              alt={`${game.title} screenshot`}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 3,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {game.images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`${game.title} thumbnail ${index + 1}`}
                sx={{
                  width: 100,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: index === selectedImage ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </Box>
        </Grid>
        
        {/* Purchase Info Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 3 }}>
              {game.discountPrice ? (
                <>
                  <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${game.price.toFixed(2)}
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ${game.discountPrice.toFixed(2)}
                  </Typography>
                  <Chip label="Sale" color="error" size="small" sx={{ mt: 1 }} />
                </>
              ) : (
                <Typography variant="h4">
                  ${game.price.toFixed(2)}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<ShoppingCart />}
                fullWidth
              >
                Add to Cart
              </Button>
              
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={isInWishlist ? <Favorite /> : <FavoriteBorder />}
                onClick={toggleWishlist}
                fullWidth
              >
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={<Share />}
                fullWidth
              >
                Share
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Download Resources
            </Typography>
            
            <List disablePadding>
              <ListItem disablePadding sx={{ pb: 1 }}>
                <Button 
                  startIcon={<FileDownload />} 
                  variant="text" 
                  component="a" 
                  href={game.installationGuide} 
                  target="_blank"
                >
                  Installation Guide (PDF)
                </Button>
              </ListItem>
              <ListItem disablePadding>
                <Button startIcon={<FileDownload />} variant="text">
                  Game Manual
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs Section */}
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Description" />
            <Tab label="System Requirements" />
            <Tab label="Reviews" />
            <Tab label="Installation Tutorial" />
          </Tabs>
          
          {/* Description Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" paragraph component="div" sx={{ whiteSpace: 'pre-line' }}>
              {game.description}
            </Typography>
          </TabPanel>
          
          {/* System Requirements Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Minimum Requirements
                </Typography>
                <List>
                  <ListItem>
                    <Computer sx={{ mr: 2 }} />
                    <ListItemText primary="Operating System" secondary={game.systemRequirements.minimum.os} />
                  </ListItem>
                  <ListItem>
                    <Memory sx={{ mr: 2 }} />
                    <ListItemText primary="Processor" secondary={game.systemRequirements.minimum.processor} />
                  </ListItem>
                  <ListItem>
                    <PhoneAndroid sx={{ mr: 2 }} />
                    <ListItemText primary="Memory" secondary={game.systemRequirements.minimum.memory} />
                  </ListItem>
                  <ListItem>
                    <PhoneAndroid sx={{ mr: 2 }} />
                    <ListItemText primary="Graphics" secondary={game.systemRequirements.minimum.graphics} />
                  </ListItem>
                  <ListItem>
                    <Storage sx={{ mr: 2 }} />
                    <ListItemText primary="Storage" secondary={game.systemRequirements.minimum.storage} />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Recommended Requirements
                </Typography>
                <List>
                  <ListItem>
                    <Computer sx={{ mr: 2 }} />
                    <ListItemText primary="Operating System" secondary={game.systemRequirements.recommended.os} />
                  </ListItem>
                  <ListItem>
                    <Memory sx={{ mr: 2 }} />
                    <ListItemText primary="Processor" secondary={game.systemRequirements.recommended.processor} />
                  </ListItem>
                  <ListItem>
                    <PhoneAndroid sx={{ mr: 2 }} />
                    <ListItemText primary="Memory" secondary={game.systemRequirements.recommended.memory} />
                  </ListItem>
                  <ListItem>
                    <PhoneAndroid sx={{ mr: 2 }} />
                    <ListItemText primary="Graphics" secondary={game.systemRequirements.recommended.graphics} />
                  </ListItem>
                  <ListItem>
                    <Storage sx={{ mr: 2 }} />
                    <ListItemText primary="Storage" secondary={game.systemRequirements.recommended.storage} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Reviews Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={game.rating} precision={0.5} readOnly size="large" />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {game.rating} out of 5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {game.reviews.length} reviews
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Review List */}
              {game.reviews.map((review) => (
                <Card key={review.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Avatar src={review.avatar} alt={review.user} />
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle1">{review.user}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={review.rating} precision={0.5} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {review.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body1">{review.comment}</Typography>
                  </CardContent>
                </Card>
              ))}
              
              {/* Submit Review Form */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Write a Review
                </Typography>
                <form onSubmit={handleSubmitReview}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Your Rating</Typography>
                    <Rating
                      name="review-rating"
                      value={reviewRating}
                      onChange={(event, newValue) => {
                        setReviewRating(newValue);
                      }}
                      precision={0.5}
                    />
                  </Box>
                  <TextField
                    label="Your Review"
                    multiline
                    rows={4}
                    fullWidth
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained"
                    disabled={!reviewRating || !reviewText.trim()}
                  >
                    Submit Review
                  </Button>
                </form>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Installation Tutorial Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Video Tutorial
            </Typography>
            <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', mb: 4 }}>
              <iframe
                src={game.videoTutorial}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Game Installation Tutorial"
              />
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Step-by-Step Installation Guide
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Step 1: Download the Game" 
                  secondary="After purchase, download the game installer from your account's 'My Games' section."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 2: Run the Installer" 
                  secondary="Double-click the downloaded file to start the installation process."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 3: Choose Installation Location" 
                  secondary="Select where you want to install the game on your computer."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 4: Select Components" 
                  secondary="Choose which components to install (full game, additional content, etc.)."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 5: Wait for Installation" 
                  secondary="The installer will copy files to your computer. This may take some time depending on your system."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Step 6: Launch the Game" 
                  secondary="Once installation is complete, you can launch the game from your desktop or start menu."
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                startIcon={<FileDownload />}
                component="a"
                href={game.installationGuide}
                target="_blank"
              >
                Download Full Installation Guide (PDF)
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}
