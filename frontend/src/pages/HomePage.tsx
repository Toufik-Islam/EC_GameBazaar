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
    }
  }, [searchQuery, categoryFilter, saleFilter, sortBy]);
  
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
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
        {/* Page Title with Refresh Option */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {categoryFilter 
            ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Games` 
            : (searchQuery ? `Search Results for "${searchQuery}"` : 
              sortBy === 'featured' ? 'Featured Games' :
              sortBy === 'price-low' ? 'Games: Price Low to High' :
              sortBy === 'price-high' ? 'Games: Price High to Low' :
              sortBy === 'rating' ? 'Highest Rated Games' :
              sortBy === 'popularity' ? 'Popular Games' :
              'Newest Games')}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Button 
            startIcon={<Refresh />} 
            onClick={handleManualRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Sorting */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="featured">Featured</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
            <MenuItem value="popularity">Popularity</MenuItem>
          </Select>
        </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: isMobile ? 0 : 2 }}>
          <TextField
            label="Min Price (৳)"
            type="number"
            size="small"
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            inputProps={{ min: 0, step: 100 }}
            sx={{ width: 140 }}
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
            sx={{ width: 140 }}
          />
        </Box>
      </Box>
      
      {/* Games Grid */}
      {currentGames.length > 0 ? (
        <Grid container spacing={3}>
          {currentGames.map((game) => (
            <Grid item key={game._id} xs={12} sm={6} md={4}>
              <Card className="game-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/game/${game._id}`}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.images && game.images.length > 0 
                      ? game.images[0] 
                      : 'https://placehold.co/300x200?text=Game+Image'}
                    alt={game.title}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ flex: 1 }}>
                      <Link to={`/game/${game._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {game.title}
                      </Link>
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleToggleWishlist(game._id)}
                      color="secondary"
                      disabled={processingGameId === game._id}
                    >
                      {processingGameId === game._id ? (
                        <CircularProgress size={20} />
                      ) : isInWishlist(game._id) ? (
                        <Favorite />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={game.averageRating || 0} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {game.numReviews > 0 
                        ? `(${game.averageRating?.toFixed(1) || '0.0'}) ${game.numReviews} ${game.numReviews === 1 ? 'review' : 'reviews'}`
                        : '(No reviews yet)'}
                    </Typography>
                  </Box>
                  
                  {game.genre && game.genre.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {game.genre.map((genre: string) => (
                        <Chip 
                          key={genre}
                          label={genre} 
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Publisher: {game.publisher || 'Unknown'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box>
                      {game.discountPrice > 0 ? (
                        <>
                          <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
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
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={processingGameId === game._id ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                      onClick={() => handleAddToCart(game._id)}
                      disabled={processingGameId === game._id}
                    >
                      {processingGameId === game._id ? 'Adding...' : 'Add'}
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
          <Typography variant="h4" gutterBottom>
            Browse by Category
          </Typography>
          <Grid container spacing={2}>
            {['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
              'Sports', 'Racing', 'Puzzle', 'FPS', 'Fighting', 
              'Platformer', 'Survival', 'Horror', 'Stealth', 'Open World'].map((category) => (
              <Grid item key={category} xs={6} sm={4} md={3} lg={2}>
                <Card 
                  component={Link} 
                  to={`/?category=${category.toLowerCase()}`}
                  sx={{ 
                    height: 100, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Typography variant="h6" align="center" color="textPrimary">
                    {category}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
