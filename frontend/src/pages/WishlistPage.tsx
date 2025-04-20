
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  Rating,
  IconButton,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { Delete, ShoppingCart, Visibility } from '@mui/icons-material';

// Mock data for wishlist items
const MOCK_WISHLIST_ITEMS = [
  {
    id: 1,
    title: 'Cyber Adventure 2077',
    price: 59.99,
    discountPrice: 49.99,
    rating: 4.5,
    image: 'https://via.placeholder.com/300x200?text=Cyber+Adventure',
    category: 'action',
    publisher: 'Game Studio X',
    releaseDate: '2023-05-15'
  },
  {
    id: 3,
    title: 'Space Explorer',
    price: 29.99,
    discountPrice: 19.99,
    rating: 4.0,
    image: 'https://via.placeholder.com/300x200?text=Space+Explorer',
    category: 'adventure',
    publisher: 'Cosmic Games',
    releaseDate: '2023-02-10'
  },
  {
    id: 7,
    title: 'War Strategy 2',
    price: 44.99,
    discountPrice: 39.99,
    rating: 4.4,
    image: 'https://via.placeholder.com/300x200?text=War+Strategy',
    category: 'strategy',
    publisher: 'Tactical Games',
    releaseDate: '2022-10-25'
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST_ITEMS);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const removeFromWishlist = (id: number) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
    setNotificationMessage('Game removed from wishlist');
    setNotificationVisible(true);
    
    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };
  
  const addToCart = (id: number) => {
    // This would call an API to add to cart in a real app
    setNotificationMessage('Game added to cart');
    setNotificationVisible(true);
    
    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Wishlist
      </Typography>
      
      {notificationVisible && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setNotificationVisible(false)}
        >
          {notificationMessage}
        </Alert>
      )}
      
      {wishlistItems.length > 0 ? (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/game/${item.id}`}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.image}
                    alt={item.title}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      <Link to={`/game/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.title}
                      </Link>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={item.rating} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({item.rating})
                      </Typography>
                    </Box>
                    <Chip 
                      label={item.category.charAt(0).toUpperCase() + item.category.slice(1)} 
                      size="small" 
                      sx={{ mb: 1 }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {item.publisher}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      {item.discountPrice ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            ${item.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6">
                          ${item.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/game/${item.id}`}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => removeFromWishlist(item.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCart />}
                    sx={{ mt: 2 }}
                    onClick={() => addToCart(item.id)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't added any games to your wishlist yet
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
          >
            Browse Games
          </Button>
        </Box>
      )}
    </Container>
  );
}
