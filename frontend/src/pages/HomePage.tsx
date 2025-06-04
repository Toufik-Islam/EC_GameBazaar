import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  Rating, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Pagination,
  IconButton,
  useMediaQuery,
  useTheme,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite, FavoriteBorder, ShoppingCart, Refresh } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { gameEvents } from '../services/events';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const saleFilter = searchParams.get('sale') || '';
  const sortParam = searchParams.get('sort') || '';
  
  const [games, setGames] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingGameId, setProcessingGameId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Fetch games from API with memoized callback to prevent unnecessary re-renders
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for server-side filtering when possible
      let url = '/api/games';
      const apiParams = new URLSearchParams();
      
      if (searchQuery) {
        apiParams.append('search', searchQuery);
      }
      
      if (categoryFilter) {
        // Special handling for "open world" category with space
        const formattedCategory = categoryFilter === "open world" ? 
          "Open World" : 
          categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
        
        // Use a properly capitalized genre name for backend filtering
        apiParams.append('genre', formattedCategory);
      }
      
      // Use specific endpoint for sale games
      if (saleFilter) {
        url = '/api/games/sale';
      }
      
      // Use specific endpoint for featured games when no other filters are applied
      if (!searchQuery && !categoryFilter && !saleFilter && sortBy === 'featured') {
        url = '/api/games/featured';
      }
      
      // Add query parameters if any exist
      if (apiParams.toString()) {
        url += `?${apiParams.toString()}`;
      }
      
      console.log('Fetching games from:', url);  // Debug: Log the URL being used
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
        // Set lastRefresh timestamp whenever we successfully fetch new data
        setLastRefresh(new Date());
      } else {
        // If we have a category filter and still get an error, fetch all games and filter client-side
        if (categoryFilter) {
          console.log('Falling back to client-side filtering for category:', categoryFilter);
          const allGamesResponse = await fetch('/api/games');
          const allGamesData = await allGamesResponse.json();
          
          if (allGamesData.success) {
            setGames(allGamesData.data);
            setLastRefresh(new Date());
          } else {
            setError('Failed to fetch games');
          }
        } else {
          setError('Failed to fetch games');
        }
      }
    } catch (err) {
      // If we have a network error but a category filter, try client-side only
      if (categoryFilter) {
        try {
          console.log('Network error, trying client-side only filtering');
          const allGamesResponse = await fetch('/api/games');
          const allGamesData = await allGamesResponse.json();
          
          if (allGamesData.success) {
            setGames(allGamesData.data);
            setLastRefresh(new Date());
            // Don't set error since we recovered
          } else {
            setError('Error loading games');
          }
        } catch (fallbackErr) {
          setError('Error connecting to server');
          console.error('Error in fallback fetch:', fallbackErr);
        }
      } else {
        setError('Error connecting to server');
        console.error('Error fetching games:', err);
      }
    } finally {
      setLoading(false);
    }  }, [searchQuery, categoryFilter, saleFilter, sortBy]);
  
  // Update sortBy state when URL parameters change
  useEffect(() => {
    if (sortParam && sortParam !== sortBy) {
      setSortBy(sortParam);
    } else if (!sortParam && sortBy !== 'newest') {
      setSortBy('newest');
    }
  }, [sortParam]);
  
  // Fetch games on component mount, when relevant parameters change, or when game data is updated
  useEffect(() => {
    fetchGames();
    
    // Subscribe to game changes from AdminDashboard
    const unsubscribe = gameEvents.subscribe(() => {
      fetchGames();
    });
    
    return () => {
      unsubscribe();
    };
  }, [fetchGames, location.search]);
  
  // Filter and sort games
  const getFilteredGames = () => {
    if (games.length === 0) return [];
    
    let filteredGames = [...games];
    
    // Apply search filter
    if (searchQuery) {
      // Create a case-insensitive regex for starting with the query string
      const regex = new RegExp(`^${searchQuery}`, 'i');
      
      filteredGames = filteredGames.filter(game => 
        // Check if title starts with search query
        regex.test(game.title) ||
        // Fallback to includes() for publisher to keep some backward compatibility
        (game.publisher && game.publisher.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filteredGames = filteredGames.filter(game => 
        game.genre && game.genre.some((g: string) => 
          g.toLowerCase() === categoryFilter.toLowerCase()
        )
      );
    }
    
    // Apply price range filter
    filteredGames = filteredGames.filter(game => {
      const priceToCheck = game.discountPrice > 0 ? game.discountPrice : game.price;
      return priceToCheck >= priceRange[0] && priceToCheck <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filteredGames.sort((a, b) => {
          const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filteredGames.sort((a, b) => {
          const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
          const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filteredGames.sort((a, b) => 
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      case 'rating':
        // If rating is added to the backend model, sort by it
        // For now, default to featured
        break;
      case 'popularity':
        // If downloads/popularity is added to the backend model, sort by it
        // For now, default to featured
        break;
      default: // 'featured'
        // Keep original order
        break;
    }
    
    return filteredGames;
  };
  
  const filteredGames = getFilteredGames();
  
  // Pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const pageCount = Math.ceil(filteredGames.length / gamesPerPage);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    
    // Update URL to reflect sort option for shareable URLs and browser history
    const newParams = new URLSearchParams(location.search);
    if (newSortBy !== 'newest') {
      newParams.set('sort', newSortBy);
    } else {
      newParams.delete('sort');
    }
    
    // Update URL without forcing a page reload
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };
    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinPrice = Number(event.target.value);
    setPriceRange([newMinPrice, priceRange[1]]);
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxPrice = Number(event.target.value);
    setPriceRange([priceRange[0], newMaxPrice]);
  };
  
  const handleToggleWishlist = async (gameId: string) => {
    if (!user) {
      alert('Please login to use wishlist features');
      return;
    }
    
    setProcessingGameId(gameId);
    try {
      if (isInWishlist(gameId)) {
        await removeFromWishlist(gameId);
      } else {
        await addToWishlist(gameId);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setProcessingGameId(null);
    }
  };
  
  const handleAddToCart = async (gameId: string) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    
    setProcessingGameId(gameId);
    try {
      await addToCart(gameId, 1);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setProcessingGameId(null);
    }
  };
  
  // Manual refresh function to force data reload
  const handleManualRefresh = () => {
    fetchGames();
  };
  
  if (loading && games.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      {!searchQuery && !categoryFilter && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: 4,
            p: 6,
            mb: 6,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              animation: 'float 6s ease-in-out infinite',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.95)', // White text for better contrast on purple background
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', // Add shadow for better readability
                mb: 2,
                animation: 'fadeInUp 1s ease-out',
              }}
            >
              🎮 Welcome to Game Bazaar
            </Typography>            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.85)', // Light color for better contrast on purple background
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                mb: 4,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
                animation: 'fadeInUp 1s ease-out 0.2s both',
              }}
            >
              Discover the latest and greatest games at unbeatable prices. Your next adventure awaits!
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 1s ease-out 0.4s both',
            }}>              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/?sale=true"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  background: saleFilter 
                    ? 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transform: saleFilter ? 'translateY(-2px)' : 'none',
                  boxShadow: saleFilter 
                    ? '0 8px 25px rgba(255, 71, 87, 0.4), 0 0 20px rgba(255, 71, 87, 0.3)' 
                    : 'none',
                  animation: saleFilter ? 'hotDealsGlow 2s infinite' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: saleFilter 
                      ? 'linear-gradient(135deg, #ff3742 0%, #ff4757 100%)'
                      : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: saleFilter 
                      ? '0 12px 30px rgba(255, 71, 87, 0.5), 0 0 25px rgba(255, 71, 87, 0.4)'
                      : '0 8px 25px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                🔥 Hot Deals
              </Button>              <Button 
                variant="contained"
                size="large"
                component={Link}
                to="/?sort=featured"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  background: sortBy === 'featured' 
                    ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: sortBy === 'featured' ? '#2c3e50' : 'white',
                  transform: sortBy === 'featured' ? 'translateY(-2px)' : 'none',
                  boxShadow: sortBy === 'featured' 
                    ? '0 8px 25px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3)' 
                    : 'none',
                  animation: sortBy === 'featured' ? 'activeGlow 2s infinite' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: sortBy === 'featured' ? 700 : 600,
                  '&:hover': {
                    background: sortBy === 'featured' 
                      ? 'linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)'
                      : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: sortBy === 'featured' 
                      ? '0 12px 30px rgba(255, 215, 0, 0.5), 0 0 25px rgba(255, 215, 0, 0.4)'
                      : '0 8px 25px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                ⭐ Featured Games
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
        {/* Page Title with Refresh Option */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        background: '#ffffff',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        p: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#2c3e50', // Dark color for better contrast on light glassmorphism background
          }}
        >
          {searchQuery ? `Search Results for "${searchQuery}"` :
           categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Games` :
           saleFilter ? '🔥 Games on Sale' :
           sortBy === 'featured' ? '⭐ Featured Games' :
           sortBy === 'price-low' ? '💰 Games: Price Low to High' :
           sortBy === 'price-high' ? '💎 Games: Price High to Low' :
           sortBy === 'rating' ? '🌟 Highest Rated Games' :
           sortBy === 'popularity' ? '🔥 Popular Games' :
           '🆕 Newest Games'}
        </Typography>        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Button 
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />} 
            onClick={handleManualRefresh}
            disabled={loading}
            size="small"
            sx={{
              borderRadius: 2,
              background: 'rgba(102, 126, 234, 0.1)',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.2)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Sorting */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: 2,
        background: '#ffffff',
        backdropFilter: 'blur(8px)',
        borderRadius: 3,
        p: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(102, 126, 234, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(102, 126, 234, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            }}
          >
            <MenuItem value="featured">Featured</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
            <MenuItem value="popularity">Popularity</MenuItem>
          </Select>
        </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: isMobile ? 0 : 2 }}>          <TextField
            label="Min Price (৳)"
            type="number"
            size="small"
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            inputProps={{ min: 0, step: 100 }}
            sx={{ 
              width: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              }
            }}
          />
          <Typography variant="body2" color="text.secondary">
            to
          </Typography>
          <TextField
            label="Max Price (৳)"
            type="number"
            size="small"
            value={priceRange[1]}
            onChange={handleMaxPriceChange}
            inputProps={{ min: 0, step: 100 }}
            sx={{ 
              width: 140,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              }
            }}
          />
        </Box>
      </Box>
        {/* Games Grid */}
      {currentGames.length > 0 ? (
        <Grid container spacing={3}>
          {currentGames.map((game) => (
            <Grid item key={game._id} xs={12} sm={6} md={4}>              <Card 
                className="game-card" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  background: '#ffffff',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 0,
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.08)',
                    '&::before': {
                      opacity: 1,
                    }
                  }
                }}
              >
                {game.discountPrice > 0 && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(255, 71, 87, 0.4)',
                    }}
                  >
                    {Math.round(((game.price - game.discountPrice) / game.price) * 100)}% OFF
                  </Box>
                )}
                <Link to={`/game/${game._id}`} style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={game.images && game.images.length > 0 
                      ? game.images[0] 
                      : 'https://placehold.co/300x200?text=Game+Image'}
                    alt={game.title}
                    sx={{
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        flex: 1,
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <Link to={`/game/${game._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {game.title}
                      </Link>
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleWishlist(game._id)}
                      disabled={processingGameId === game._id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.9)',
                          transform: 'scale(1.1)',
                        }
                      }}
                    >
                      {processingGameId === game._id ? (
                        <CircularProgress size={20} />
                      ) : isInWishlist(game._id) ? (
                        <Favorite sx={{ color: '#ff4757' }} />
                      ) : (
                        <FavoriteBorder sx={{ color: '#667eea' }} />
                      )}
                    </IconButton>
                  </Box>                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating 
                      value={game.averageRating || 0} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#ffd700',
                        },
                        '& .MuiRating-iconHover': {
                          color: '#ffd700',
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {game.numReviews > 0 
                        ? `(${game.averageRating?.toFixed(1) || '0.0'}) ${game.numReviews} ${game.numReviews === 1 ? 'review' : 'reviews'}`
                        : '(No reviews yet)'}
                    </Typography>
                  </Box>
                  
                  {game.genre && game.genre.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {game.genre.slice(0, 3).map((genre: string) => (
                        <Chip 
                          key={genre}
                          label={genre} 
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            color: '#667eea',
                            fontWeight: 500,
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                            }
                          }}
                        />
                      ))}
                      {game.genre.length > 3 && (
                        <Chip 
                          label={`+${game.genre.length - 3}`}
                          size="small"
                          sx={{
                            background: 'rgba(0, 0, 0, 0.05)',
                            color: 'text.secondary',
                          }}
                        />
                      )}
                    </Box>
                  )}
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      fontWeight: 500,
                    }}
                  >
                    🎮 Publisher: {game.publisher || 'Unknown'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box>
                      {game.discountPrice > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              textDecoration: 'line-through',
                              fontSize: '0.875rem',
                            }}
                          >
                            ৳{game.price.toFixed(2)}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{
                              color: '#ff4757',
                              fontWeight: 700,
                              fontSize: '1.25rem',
                            }}
                          >
                            ৳{game.discountPrice.toFixed(2)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography 
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#2c3e50',
                          }}
                        >
                          ৳{game.price.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={processingGameId === game._id ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
                      onClick={() => handleAddToCart(game._id)}
                      disabled={processingGameId === game._id}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                        }
                      }}
                    >
                      {processingGameId === game._id ? 'Adding...' : '🛒 Add'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5">No games found</Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your filters or search criteria
          </Typography>
        </Box>
      )}
      
      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pageCount} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
        {/* Categories Section */}
      {!searchQuery && !categoryFilter && (
        <Box sx={{ mt: 8 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🎯 Browse by Category
          </Typography>
          <Grid container spacing={3}>
            {[
              { name: 'Action', icon: '⚔️', color: '#ff4757' },
              { name: 'Adventure', icon: '🗺️', color: '#2ed573' },
              { name: 'RPG', icon: '🐉', color: '#5352ed' },
              { name: 'Strategy', icon: '🧠', color: '#ff6b6b' },
              { name: 'Simulation', icon: '🏗️', color: '#ffa502' },
              { name: 'Sports', icon: '⚽', color: '#2ecc71' },
              { name: 'Racing', icon: '🏎️', color: '#e74c3c' },
              { name: 'Puzzle', icon: '🧩', color: '#9b59b6' },
              { name: 'FPS', icon: '🎯', color: '#34495e' },
              { name: 'Fighting', icon: '👊', color: '#e67e22' },
              { name: 'Platformer', icon: '🦘', color: '#1abc9c' },
              { name: 'Survival', icon: '🏕️', color: '#95a5a6' },
              { name: 'Horror', icon: '👻', color: '#2c3e50' },
              { name: 'Stealth', icon: '🥷', color: '#8e44ad' },
              { name: 'Open World', icon: '🌍', color: '#27ae60' }
            ].map((category) => (
              <Grid item key={category.name} xs={6} sm={4} md={3} lg={2}>
                <Card 
                  component={Link} 
                  to={`/?category=${category.name.toLowerCase()}`}
                  sx={{ 
                    height: 120, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textDecoration: 'none',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}25 100%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.05)',
                      boxShadow: `0 8px 25px ${category.color}30`,
                      '&::before': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        mb: 1,
                        fontSize: '2rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    >
                      {category.icon}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      align="center" 
                      sx={{
                        fontWeight: 600,
                        color: category.color,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {category.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
