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
  CircularProgress,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Delete, 
  ShoppingCart, 
  Visibility, 
  FavoriteRounded, 
  LocalOffer,
  Star
} from '@mui/icons-material';
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 4,
            maxWidth: 400,
            width: '100%',
            mx: 2
          }}
        >
          <FavoriteRounded sx={{ fontSize: 64, color: '#ff6b6b', mb: 2 }} />
          <Typography 
            variant="h4" 
            gutterBottom 
            className="gradient-text"
            sx={{ fontWeight: 700 }}
          >
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please login to view and manage your wishlist
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/login"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }
    return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            className="glassmorphism"
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              textAlign: 'center'
            }}
          >
            <FavoriteRounded sx={{ fontSize: 48, color: '#ff6b6b', mb: 2 }} />            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                color: '#2c3e50', // Dark color for better contrast
              }}
            >
              My Wishlist
            </Typography>
            <Typography variant="h6" sx={{ color: '#5a6c7d' }}>
              Your favorite games collection
            </Typography>
          </Paper>
        </Fade>        {/* Notification */}
        {notification !== null && (
          <Snackbar 
            open={true} 
            autoHideDuration={6000} 
            onClose={closeNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={closeNotification} severity={notification.type} className="high-contrast-text">
              {notification.message}
            </Alert>
          </Snackbar>
        )}
        
        {wishlistLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}
            >
              <CircularProgress size={48} sx={{ color: '#667eea' }} />
              <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading your wishlist...
              </Typography>
            </Paper>
          </Box>
        ) : wishlist?.games && wishlist.games.length > 0 ? (
          <Grid container spacing={3}>
            {wishlist.games.filter(game => game).map((game, index) => (
              <Grid item xs={12} sm={6} md={4} key={game._id}>
                <Zoom in timeout={600 + index * 100}>
                  <Card 
                    elevation={0}
                    className="glassmorphism"
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <Link to={`/game/${game._id}`}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={(game.images && game.images[0]) || 'https://via.placeholder.com/300x200?text=Game+Image'}
                          alt={game.title || 'Game Image'}
                          sx={{
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      </Link>
                      {game.discountPrice && (
                        <Chip
                          label={`${Math.round(((game.price - game.discountPrice) / game.price) * 100)}% OFF`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h2"
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >                        <Link                          to={`/game/${game._id}`} 
                          style={{ 
                            color: 'inherit', 
                            textDecoration: 'none'
                          }}
                        >
                          {game.title || 'Unknown Game'}
                        </Link>
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating value={4.5} precision={0.5} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (4.5)
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        {game.genre?.slice(0, 2).map(g => (
                          <Chip
                            key={g}
                            label={g} 
                            size="small" 
                            sx={{ 
                              mb: 0.5, 
                              mr: 0.5,
                              background: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              fontWeight: 500
                            }} 
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {game.publisher}
                      </Typography>
                      
                      <Divider sx={{ mb: 2, opacity: 0.3 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          {game.discountPrice ? (
                            <>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ textDecoration: 'line-through', fontSize: '0.9rem' }}
                              >
                                ৳{(game.price || 0).toFixed(2)}
                              </Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: '#ff6b6b',
                                  fontWeight: 700
                                }}
                              >
                                ৳{(game.discountPrice || 0).toFixed(2)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              ৳{(game.price || 0).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          <IconButton 
                            color="primary" 
                            component={Link} 
                            to={`/game/${game._id}`}
                            size="small"
                            sx={{
                              mr: 1,
                              '&:hover': {
                                background: 'rgba(102, 126, 234, 0.1)',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveFromWishlist(game._id)}
                            disabled={itemProcessing === game._id || wishlistLoading}
                            size="small"
                            sx={{
                              '&:hover': {
                                background: 'rgba(255, 107, 107, 0.1)',
                                transform: 'scale(1.1)'
                              }
                            }}
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
                        onClick={() => handleAddToCart(game._id)}
                        disabled={itemProcessing === game._id || cartLoading}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          py: 1.2,
                          borderRadius: 2,
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                          },
                          '&:disabled': {
                            background: 'rgba(102, 126, 234, 0.3)'
                          }
                        }}
                      >
                        {itemProcessing === game._id && cartLoading ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                borderRadius: 4
              }}
            >
              <FavoriteRounded sx={{ fontSize: 80, color: '#ff6b6b', mb: 3, opacity: 0.7 }} />
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Your wishlist is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                Discover amazing games and add them to your wishlist
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/"
                size="large"
                startIcon={<Star />}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'                  }
                }}
              >
                Browse Games
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
