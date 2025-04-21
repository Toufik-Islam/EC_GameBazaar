import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Slider, 
  Pagination,
  IconButton,
  useMediaQuery,
  useTheme,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { gameEvents } from './AdminDashboard';

// Featured banners
const FEATURED_BANNERS = [
  {
    id: 1,
    title: 'Summer Sale',
    description: 'Get up to 70% off on selected games',
    image: 'https://via.placeholder.com/1200x300?text=Summer+Sale+Banner',
    link: '/?sale=summer'
  },
  {
    id: 2,
    title: 'New Releases',
    description: 'Check out the newest games',
    image: 'https://via.placeholder.com/1200x300?text=New+Releases+Banner',
    link: '/?sort=newest'
  }
];

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  const [games, setGames] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingGameId, setProcessingGameId] = useState<string | null>(null);
  
  // Fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/games');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch games on component mount, when location changes, or when game data is updated
  useEffect(() => {
    fetchGames();
    
    // Subscribe to game changes from AdminDashboard
    const unsubscribe = gameEvents.subscribe(() => {
      fetchGames();
    });
    
    return () => {
      unsubscribe();
    };
  }, [location.pathname]);
  
  // Filter and sort games
  const getFilteredGames = () => {
    if (games.length === 0) return [];
    
    let filteredGames = [...games];
    
    // Apply search filter
    if (searchQuery) {
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    setSortBy(event.target.value);
  };
  
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
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
      
      {/* Featured Banner - Only show on home with no filters */}
      {!searchQuery && !categoryFilter && (
        <Box sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
          <Box
            component="img"
            src={FEATURED_BANNERS[0].image}
            alt={FEATURED_BANNERS[0].title}
            sx={{
              width: '100%',
              height: isMobile ? '150px' : '300px',
              objectFit: 'cover',
            }}
          />
        </Box>
      )}
      
      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        {categoryFilter 
          ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Games` 
          : (searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Games')}
      </Typography>
      
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
        
        <Box sx={{ width: 300, ml: isMobile ? 0 : 2 }}>
          <Typography id="price-range-slider" gutterBottom>
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={10}
            marks
            aria-labelledby="price-range-slider"
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
                      : 'https://via.placeholder.com/300x200?text=Game+Image'}
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
                    <Rating value={4} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      (4.0)
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
                            ${game.price.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            ${game.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6">
                          ${game.price.toFixed(2)}
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
            {['Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Sports', 'Puzzle'].map((category) => (
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
