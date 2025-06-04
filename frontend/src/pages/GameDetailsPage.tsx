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
  Stack,
  Modal,
  Backdrop,
  Fade,
  Container,
  Badge
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
  ExpandLess,
  Close,
  ZoomIn,
  Star,
  LocalOffer,
  Verified,
  Download,
  PlayArrow,
  Gamepad
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
  
  // Zoom modal state
  const [zoomModal, setZoomModal] = useState({
    open: false,
    imageUrl: '',
    imageTitle: ''
  });
  
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
  
  // Zoom modal handlers
  const handleImageClick = (imageUrl: string, imageTitle: string) => {
    setZoomModal({
      open: true,
      imageUrl,
      imageTitle
    });
  };

  const handleCloseZoom = () => {
    setZoomModal({
      open: false,
      imageUrl: '',
      imageTitle: ''
    });
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
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <Box className="glassmorphism" sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 4,
          animation: 'floating 3s ease-in-out infinite'
        }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" className="gradient-text">
            Loading game details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !game) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box className="glassmorphism" sx={{ 
          p: 6, 
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid rgba(255,0,0,0.2)'
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Game not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  const discountPercentage = game.discountPrice 
    ? Math.round(((game.price - game.discountPrice) / game.price) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>      {/* Hero Section */}
      <Box className="glassmorphism" sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        background: '#ffffff',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <Grid container spacing={4}>
          {/* Game Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              {/* Main Image */}
              <Paper 
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }} 
                onClick={() => setZoomModal({
                  open: true,
                  imageUrl: game.images?.[selectedImage] || '/api/placeholder/600/400',
                  imageTitle: game.title
                })}
              >
                <Box
                  component="img"
                  src={game.images?.[selectedImage] || '/api/placeholder/600/400'}
                  alt={game.title}
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <ZoomIn />
                </IconButton>
                {game.onSale && (
                  <Chip
                    label={`${discountPercentage}% OFF`}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: '#ff4444',
                      color: 'white',
                      fontWeight: 'bold',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
              </Paper>

              {/* Thumbnail Images */}
              {game.images && game.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                  {game.images.map((image, index) => (
                    <Paper
                      key={index}
                      elevation={selectedImage === index ? 8 : 2}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === index ? '3px solid #1976d2' : 'none',
                        minWidth: 80,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Box
                        component="img"
                        src={image}
                        alt={`${game.title} ${index + 1}`}
                        sx={{
                          width: 80,
                          height: 60,
                          objectFit: 'cover'
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Game Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Title and Rating */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" component="h1" className="gradient-text" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {game.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Rating 
                    value={game.averageRating || 0} 
                    readOnly 
                    precision={0.1}
                    sx={{ 
                      '& .MuiRating-iconFilled': {
                        color: '#ffd700'
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({game.numReviews || 0} reviews)
                  </Typography>
                  {game.featured && (
                    <Chip
                      icon={<Star />}
                      label="Featured"
                      size="small"
                      sx={{
                        bgcolor: 'gold',
                        color: 'black',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Price Section */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  {game.discountPrice ? (
                    <>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        color: '#4caf50'
                      }}>
                        ৳{game.discountPrice}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        textDecoration: 'line-through',
                        color: 'text.secondary'
                      }}>
                        ৳{game.price}
                      </Typography>
                      <Chip
                        label={`Save ${discountPercentage}%`}
                        size="small"
                        sx={{
                          bgcolor: '#ff4444',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </>
                  ) : (
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}>
                      ৳{game.price}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Free shipping • Digital download
                </Typography>
              </Box>

              {/* Game Details */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  {game.genre && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Genres</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {game.genre.map((g, index) => (
                          <Chip
                            key={index}
                            label={g}
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #1976d2)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {game.platform && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Platforms</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {game.platform.map((p, index) => (
                          <Chip
                            key={index}
                            label={p}
                            size="small"
                            icon={<Computer />}
                            variant="outlined"
                            sx={{
                              borderColor: '#1976d2',
                              color: '#1976d2',
                              '&:hover': {
                                bgcolor: 'rgba(25, 118, 210, 0.1)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {game.developer && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Developer</Typography>
                      <Typography variant="body2">{game.developer}</Typography>
                    </Grid>
                  )}
                  {game.publisher && (
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Publisher</Typography>
                      <Typography variant="body2">{game.publisher}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 'auto' }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isInWishlist(game._id) ? (
                      <Favorite sx={{ color: '#ff4444' }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Share />}
                    sx={{ flex: 1 }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    sx={{ flex: 1 }}
                  >
                    Download
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>      {/* Tabs Section */}
      <Paper 
        elevation={0}
        className="glassmorphism"
        sx={{ 
          borderRadius: 4,
          background: '#ffffff',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              '&.Mui-selected': {
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              height: 3
            }
          }}
        >
          <Tab label="Description" />
          <Tab label="System Requirements" />
          <Tab label="Reviews" />
          <Tab label="Installation Guide" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
            {game.description}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {game.systemRequirements ? (
            <Box>
              <Typography variant="h6" gutterBottom className="gradient-text">
                System Requirements
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {game.systemRequirements}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              System requirements not available for this game.
            </Typography>
          )}
        </TabPanel>        <TabPanel value={tabValue} index={2}>
          <Box ref={reviewsTabRef}>
            <Typography variant="h6" gutterBottom className="gradient-text">
              Customer Reviews ({reviews.length})
            </Typography>
            
            {/* Review Summary */}
            {game.averageRating && game.numReviews && game.numReviews > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {game.averageRating.toFixed(1)}
                  </Typography>
                  <Rating 
                    value={game.averageRating} 
                    readOnly 
                    precision={0.1}
                    sx={{ '& .MuiRating-iconFilled': { color: '#ffd700' } }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on {game.numReviews} review{game.numReviews !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}

            {/* Add Review Form */}
            {user ? (
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Write a Review
                </Typography>
                <form onSubmit={isEditing ? handleUpdateReview : handleSubmitReview}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend" gutterBottom>
                      Rating *
                    </Typography>
                    <Rating
                      value={isEditing ? editReviewRating : reviewRating}
                      onChange={(event, newValue) => {
                        if (isEditing) {
                          setEditReviewRating(newValue);
                        } else {
                          setReviewRating(newValue);
                        }
                      }}
                      size="large"
                      sx={{ '& .MuiRating-iconFilled': { color: '#ffd700' } }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Share your experience with this game..."
                    value={isEditing ? editReviewText : reviewText}
                    onChange={(e) => {
                      if (isEditing) {
                        setEditReviewText(e.target.value);
                      } else {
                        setReviewText(e.target.value);
                      }
                    }}
                    sx={{ mb: 2 }}
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={(!reviewRating && !isEditing) || (!editReviewRating && isEditing)}
                      sx={{
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        '&:hover': { background: 'linear-gradient(45deg, #1565c0, #1976d2)' }
                      }}
                    >
                      {isEditing ? 'Update Review' : 'Submit Review'}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </form>
              </Paper>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Please log in to write a review
              </Alert>
            )}            {/* Reviews List */}
            <Box>
              {reviews.length === 0 ? (
                <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews yet. Be the first to review this game!
                  </Typography>
                </Paper>
              ) : (
                reviews.map((review) => (
                  <Card key={review._id} elevation={0} sx={{ mb: 3, border: '1px solid rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      {/* Review Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={review.user.avatar}>
                            {review.user.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {review.user.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating 
                                value={review.rating} 
                                readOnly 
                                size="small"
                                sx={{ '& .MuiRating-iconFilled': { color: '#ffd700' } }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Review Options Menu */}
                        {user && user.id === review.user._id && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, review._id)}
                          >
                            <MoreVert />
                          </IconButton>
                        )}
                      </Box>

                      {/* Review Content */}
                      <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {review.comment}
                      </Typography>

                      {/* Review Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Button
                          size="small"
                          startIcon={hasUserLikedReview(review.likes) ? <ThumbUp /> : <ThumbUpOutlined />}
                          onClick={() => handleLikeReview(review._id)}
                          disabled={!user}
                          color={hasUserLikedReview(review.likes) ? 'primary' : 'inherit'}
                        >
                          {review.likes.length} {review.likes.length === 1 ? 'Like' : 'Likes'}
                        </Button>
                        
                        <Button
                          size="small"
                          startIcon={<Reply />}
                          onClick={() => toggleReplyForm(review._id)}
                          disabled={!user}
                        >
                          Reply
                        </Button>
                        
                        {review.replies.length > 0 && (
                          <Button
                            size="small"
                            startIcon={expandedReplies[review._id] ? <ExpandLess /> : <ExpandMore />}
                            onClick={() => toggleReplies(review._id)}
                          >
                            {review.replies.length} {review.replies.length === 1 ? 'Reply' : 'Replies'}
                          </Button>
                        )}
                      </Box>

                      {/* Reply Form */}
                      {replyingTo === review._id && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSubmitReply(review._id)}
                              disabled={!replyText.trim()}
                            >
                              <Send sx={{ mr: 1 }} />
                              Reply
                            </Button>
                            <Button
                              size="small"
                              onClick={() => toggleReplyForm(null)}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* Replies */}
                      {expandedReplies[review._id] && review.replies.length > 0 && (
                        <Box sx={{ pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                          {review.replies.map((reply) => (
                            <Box key={reply._id} sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.01)', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar src={reply.user.avatar} sx={{ width: 24, height: 24 }}>
                                    {reply.user.name[0]}
                                  </Avatar>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {reply.user.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(reply.createdAt)}
                                  </Typography>
                                </Box>
                                
                                {user && user.id === reply.user._id && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteReply(review._id, reply._id)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {reply.comment}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>

            {/* Review Options Menu */}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleStartEditReview}>
                <Edit sx={{ mr: 1 }} />
                Edit Review
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  if (currentReviewId) {
                    handleDeleteReview(currentReviewId);
                  }
                }}
                sx={{ color: 'error.main' }}
              >
                <Delete sx={{ mr: 1 }} />
                Delete Review
              </MenuItem>
            </Menu>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {game.installationTutorial ? (
            <Box>
              <Typography variant="h6" gutterBottom className="gradient-text">
                Installation Guide
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {game.installationTutorial}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Installation guide not available for this game.
            </Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Image Zoom Modal */}
      <Modal
        open={zoomModal.open}
        onClose={() => setZoomModal({ ...zoomModal, open: false })}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { bgcolor: 'rgba(0,0,0,0.8)' }
        }}
      >
        <Fade in={zoomModal.open}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none'
          }}>
            <Box
              component="img"
              src={zoomModal.imageUrl}
              alt={zoomModal.imageTitle}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 2
              }}
            />
            <IconButton
              onClick={() => setZoomModal({ ...zoomModal, open: false })}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Fade>
      </Modal>      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type || 'info'}
          sx={{ width: '100%' }}
          className="high-contrast-text"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
  // The existing handleAddToCart and toggleWishlist functions are already defined above
  // We just need to reference them correctly in the JSX

  // ...existing code for reviews and other functionality...
}
