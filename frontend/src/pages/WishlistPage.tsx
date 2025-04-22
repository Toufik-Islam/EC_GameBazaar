import { useState, useEffect } from 'react';
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
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Delete, ShoppingCart, Visibility } from '@mui/icons-material';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart, loading: cartLoading } = useCart();
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [itemProcessing, setItemProcessing] = useState<string | null>(null);
  
  const handleRemoveFromWishlist = async (gameId: string) => {
    try {
      setItemProcessing(gameId);
      await removeFromWishlist(gameId);
      setNotification({
        type: 'success',
        message: 'Game removed from wishlist'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to remove game from wishlist'
      });
    } finally {
      setItemProcessing(null);
    }
  };
  
  const handleAddToCart = async (gameId: string) => {
    try {
      setItemProcessing(gameId);
      await addToCart(gameId, 1);
      setNotification({
        type: 'success',
        message: 'Game added to cart'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to add game to cart'
      });
    } finally {
      setItemProcessing(null);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your wishlist
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/login"
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Wishlist
      </Typography>
      
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification && (
          <Alert onClose={closeNotification} severity={notification.type}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
      
      {wishlistLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : wishlist.games.length > 0 ? (
        <Grid container spacing={3}>
          {wishlist.games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/game/${game._id}`}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.images[0] || 'https://via.placeholder.com/300x200?text=Game+Image'}
                    alt={game.title}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      <Link to={`/game/${game._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {game.title}
                      </Link>
                    </Typography>
                    {/* Rating would come from the API in a real app */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={4.5} precision={0.5} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        (4.5)
                      </Typography>
                    </Box>
                    {game.genre?.map(g => (
                      <Chip 
                        key={g}
                        label={g} 
                        size="small" 
                        sx={{ mb: 1, mr: 0.5 }} 
                      />
                    ))}
                    <Typography variant="body2" color="text.secondary">
                      {game.publisher}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      {game.discountPrice ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ৳{game.price.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            ৳{game.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6">
                          ৳{game.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/game/${game._id}`}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveFromWishlist(game._id)}
                        disabled={itemProcessing === game._id || wishlistLoading}
                        size="small"
                      >
                        {itemProcessing === game._id && wishlistLoading ? 
                          <CircularProgress size={20} /> : <Delete />}
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={itemProcessing === game._id && cartLoading ? 
                      <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                    sx={{ mt: 2 }}
                    onClick={() => handleAddToCart(game._id)}
                    disabled={itemProcessing === game._id || cartLoading}
                  >
                    {itemProcessing === game._id && cartLoading ? 'Adding...' : 'Add to Cart'}
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
