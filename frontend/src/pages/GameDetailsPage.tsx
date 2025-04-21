import { useState, useEffect, useRef } from 'react';
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
  CardActions,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Collapse,
  Stack
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
  ThumbUp,
  ThumbUpOutlined,
  Reply,
  MoreVert,
  Delete,
  Edit,
  Send,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Reply {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  comment: string;
  createdAt: string;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
}

interface GameDetails {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  description: string;
  genre?: string[];
  platform?: string[];
  publisher?: string;
  developer?: string;
  releaseDate?: string;
  rating?: string;
  stock?: number;
  images?: string[];
  systemRequirements?: string;
  installationTutorial?: string;
  featured?: boolean;
  onSale?: boolean;
  averageRating?: number;
  numReviews?: number;
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
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // New state for reply functionality
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<{[key: string]: boolean}>({});
  
  // Menu state for review options
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  
  // Edit review state
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] =useState<number | null>(null);
  
  // Context hooks
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  
  // Refs for scrolling to reviews tab
  const reviewsTabRef = useRef<HTMLDivElement>(null);
  
  // Fetch game details by ID
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setGame(data.data);
          
          // Fetch reviews for this game
          fetchReviews(id);
        } else {
          setError('Failed to fetch game details');
        }
      } catch (err) {
        console.error('Error fetching game details:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameDetails();
  }, [id]);
  
  // Fetch reviews function
  const fetchReviews = async (gameId: string) => {
    try {
      const reviewsResponse = await fetch(`/api/reviews?game=${gameId}`);
      const reviewsData = await reviewsResponse.json();
      if (reviewsData.success) {
        setReviews(reviewsData.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !game) {
      setNotification({
        type: 'error',
        message: 'Please login to submit a review'
      });
      return;
    }
    
    if (!reviewRating || !reviewText.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide both rating and review text'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          game: game._id,
          rating: reviewRating,
          comment: reviewText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Review submitted successfully!'
        });
        
        // Add the new review to the list
        if (data.data) {
          setReviews(prev => [data.data, ...prev]);
        }
        
        // Reset form
        setReviewText('');
        setReviewRating(null);
        
        // Refresh game data to update average rating
        const gameResponse = await fetch(`/api/games/${id}`);
        const gameData = await gameResponse.json();
        if (gameData.success) {
          setGame(gameData.data);
        }
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to submit review'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !editReviewId || !editReviewRating) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${editReviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: editReviewRating,
          comment: editReviewText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Review updated successfully!'
        });
        
        // Update the review in the list
        setReviews(prev => 
          prev.map(review => 
            review._id === editReviewId ? data.data : review
          )
        );
        
        // Exit edit mode
        setIsEditing(false);
        setEditReviewId(null);
        setEditReviewText('');
        setEditReviewRating(null);
        
        // Refresh game data to update average rating
        const gameResponse = await fetch(`/api/games/${id}`);
        const gameData = await gameResponse.json();
        if (gameData.success) {
          setGame(gameData.data);
        }
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to update review'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Review deleted successfully!'
        });
        
        // Remove the review from the list
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        
        // Close menu
        handleCloseMenu();
        
        // Refresh game data to update average rating
        const gameResponse = await fetch(`/api/games/${id}`);
        const gameData = await gameResponse.json();
        if (gameData.success) {
          setGame(gameData.data);
        }
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to delete review'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      setNotification({
        type: 'error',
        message: 'Please login to like reviews'
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the review in the list
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId ? data.data : review
          )
        );
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to like review'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleSubmitReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          comment: replyText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Reply added successfully!'
        });
        
        // Update the review in the list
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId ? data.data : review
          )
        );
        
        // Reset form
        setReplyText('');
        setReplyingTo(null);
        
        // Expand replies for this review
        setExpandedReplies(prev => ({
          ...prev,
          [reviewId]: true
        }));
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to add reply'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reply/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Reply deleted successfully!'
        });
        
        // Update the review in the list
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId ? data.data : review
          )
        );
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to delete reply'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    }
  };
  
  const handleAddToCart = async () => {
    if (!user || !game) {
      setNotification({
        type: 'error',
        message: 'Please login to add items to your cart'
      });
      return;
    }
    
    try {
      await addToCart(game._id, 1);
      setNotification({
        type: 'success',
        message: 'Game added to cart successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to add game to cart'
      });
    }
  };
  
  const toggleWishlist = async () => {
    if (!user || !game) {
      setNotification({
        type: 'error',
        message: 'Please login to use wishlist'
      });
      return;
    }
    
    try {
      if (isInWishlist(game._id)) {
        await removeFromWishlist(game._id);
        setNotification({
          type: 'success',
          message: 'Game removed from wishlist'
        });
      } else {
        await addToWishlist(game._id);
        setNotification({
          type: 'success',
          message: 'Game added to wishlist'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update wishlist'
      });
    }
  };
  
  // Handle menu opening for review options
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, reviewId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentReviewId(reviewId);
  };
  
  // Handle menu closing for review options
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setCurrentReviewId(null);
  };
  
  // Handle starting to edit a review
  const handleStartEditReview = () => {
    if (!currentReviewId) return;
    
    const review = reviews.find(r => r._id === currentReviewId);
    if (!review) return;
    
    setEditReviewId(currentReviewId);
    setEditReviewText(review.comment);
    setEditReviewRating(review.rating);
    setIsEditing(true);
    handleCloseMenu();
  };
  
  // Toggle reply form visibility
  const toggleReplyForm = (reviewId: string | null) => {
    setReplyingTo(replyingTo === reviewId ? null : reviewId);
    setReplyText('');
  };
  
  // Toggle replies visibility
  const toggleReplies = (reviewId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };
  
  // Cancel editing a review
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditReviewId(null);
    setEditReviewText('');
    setEditReviewRating(null);
  };
  
  // Check if the current user has liked a review
  const hasUserLikedReview = (reviewLikes: string[]) => {
    return user ? reviewLikes.includes(user.id) : false;
  };
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const closeNotification = () => {
    setNotification(null);
  };
  
  // Scroll to reviews tab
  const scrollToReviews = () => {
    setTabValue(2); // Set tab to reviews
    setTimeout(() => {
      reviewsTabRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !game) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Game not found'}
        </Typography>
        <Button variant="contained" href="/" sx={{ mt: 2 }}>
          Return to Home
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Notification */}
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
      
      {/* Game Title and Basic Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {game.title}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {game.genre && game.genre.map((genre, index) => (
            <Chip key={index} label={genre} />
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={scrollToReviews}>
            <Rating value={game.averageRating || 0} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({game.numReviews || 0} reviews)
            </Typography>
          </Box>
          {game.releaseDate && (
            <Typography variant="body2">
              Release Date: {new Date(game.releaseDate).toLocaleDateString()}
            </Typography>
          )}
          {game.publisher && (
            <Typography variant="body2">
              Publisher: {game.publisher}
            </Typography>
          )}
          {game.developer && (
            <Typography variant="body2">
              Developer: {game.developer}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Game Images and Purchase Info */}
      <Grid container spacing={4}>
        {/* Images Section */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={game.images && game.images.length > 0 
                ? game.images[selectedImage] 
                : 'https://via.placeholder.com/800x450?text=No+Image+Available'}
              alt={`${game.title} screenshot`}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 3,
              }}
            />
          </Box>
          
          {game.images && game.images.length > 1 && (
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
          )}
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
                startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                fullWidth
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
              
              <Button 
                variant="outlined" 
                size="large" 
                startIcon={wishlistLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  isInWishlist(game._id) ? <Favorite /> : <FavoriteBorder />
                )}
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                fullWidth
              >
                {wishlistLoading 
                  ? 'Processing...' 
                  : (isInWishlist(game._id) ? 'In Wishlist' : 'Add to Wishlist')
                }
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
            
            {/* Download Resources section removed as requested */}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs Section */}
      <Box sx={{ mt: 6 }} ref={reviewsTabRef}>
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
            {game.systemRequirements ? (
              <Typography variant="body1" paragraph component="div" sx={{ whiteSpace: 'pre-line' }}>
                {game.systemRequirements}
              </Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">
                System requirements information is not available for this game.
              </Typography>
            )}
          </TabPanel>
          
          {/* Reviews Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={game.averageRating || 0} precision={0.5} readOnly size="large" />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {game.averageRating ? game.averageRating.toFixed(1) : '0'} out of 5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {game.numReviews || 0} reviews
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Review List */}
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review._id} sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                          <Avatar src={review.user.avatar} alt={review.user.name} />
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle1">{review.user.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={review.rating} precision={0.5} size="small" readOnly />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Review Options Menu - only for the review owner or admin */}
                        {user && (user.id === review.user._id || user.role === 'admin') && (
                          <>
                            <IconButton size="small" onClick={(e) => handleOpenMenu(e, review._id)}>
                              <MoreVert />
                            </IconButton>
                            <Menu
                              anchorEl={menuAnchorEl}
                              open={Boolean(menuAnchorEl) && currentReviewId === review._id}
                              onClose={handleCloseMenu}
                            >
                              <MenuItem onClick={handleStartEditReview}>
                                <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                              </MenuItem>
                              <MenuItem onClick={() => handleDeleteReview(review._id)}>
                                <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                              </MenuItem>
                            </Menu>
                          </>
                        )}
                      </Box>
                      
                      {/* Review Content */}
                      {isEditing && editReviewId === review._id ? (
                        <Box component="form" onSubmit={handleUpdateReview} sx={{ mt: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography component="legend">Your Rating</Typography>
                            <Rating
                              name="edit-review-rating"
                              value={editReviewRating}
                              onChange={(event, newValue) => {
                                setEditReviewRating(newValue);
                              }}
                              precision={0.5}
                            />
                          </Box>
                          <TextField
                            label="Your Review"
                            multiline
                            rows={4}
                            fullWidth
                            value={editReviewText}
                            onChange={(e) => setEditReviewText(e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              type="submit" 
                              variant="contained"
                              disabled={!editReviewRating || !editReviewText.trim()}
                            >
                              Update Review
                            </Button>
                            <Button 
                              variant="outlined"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body1" paragraph>
                          {review.comment}
                        </Typography>
                      )}
                      
                      {/* Like and Reply buttons */}
                      {!isEditing && (
                        <CardActions sx={{ pt: 0, pb: 1 }}>
                          <Button 
                            startIcon={hasUserLikedReview(review.likes) ? <ThumbUp /> : <ThumbUpOutlined />}
                            onClick={() => handleLikeReview(review._id)}
                            size="small"
                          >
                            {review.likes.length > 0 ? review.likes.length : ''} Like
                          </Button>
                          <Button 
                            startIcon={<Reply />}
                            onClick={() => toggleReplyForm(review._id)}
                            size="small"
                          >
                            Reply
                          </Button>
                          {review.replies.length > 0 && (
                            <Button
                              onClick={() => toggleReplies(review._id)}
                              endIcon={expandedReplies[review._id] ? <ExpandLess /> : <ExpandMore />}
                              size="small"
                            >
                              {review.replies.length} {review.replies.length === 1 ? 'Reply' : 'Replies'}
                            </Button>
                          )}
                        </CardActions>
                      )}
                      
                      {/* Reply Form */}
                      {replyingTo === review._id && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <TextField
                            placeholder="Write a reply..."
                            size="small"
                            fullWidth
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Button 
                            variant="contained" 
                            onClick={() => handleSubmitReply(review._id)}
                            disabled={!replyText.trim()}
                          >
                            <Send />
                          </Button>
                        </Box>
                      )}
                      
                      {/* Replies */}
                      {review.replies.length > 0 && (
                        <Collapse in={expandedReplies[review._id]} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                            {review.replies.map((reply) => (
                              <Box key={reply._id} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Avatar src={reply.user.avatar} alt={reply.user.name} sx={{ width: 32, height: 32 }} />
                                    <Box sx={{ ml: 1 }}>
                                      <Typography variant="subtitle2">{reply.user.name}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(reply.createdAt)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  {/* Delete Reply Button - only for the reply owner or admin */}
                                  {user && (user.id === reply.user._id || user.role === 'admin') && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleDeleteReply(review._id, reply._id)}
                                      sx={{ p: 0.5 }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                                <Typography variant="body2">{reply.comment}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography color="text.secondary">
                  No reviews yet. Be the first to review this game!
                </Typography>
              )}
              
              {/* Submit Review Form */}
              {user && (
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
              )}
              
              {!user && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="body1">
                    Please <Button href="/login" variant="text" sx={{ mx: 1 }}>login</Button> 
                    to leave a review.
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Installation Tutorial Tab */}
          <TabPanel value={tabValue} index={3}>
            {game.installationTutorial ? (
              <Typography variant="body1" paragraph component="div" sx={{ whiteSpace: 'pre-line' }}>
                {game.installationTutorial}
              </Typography>
            ) : (
              <Box>
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
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}
