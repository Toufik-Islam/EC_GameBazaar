
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
  SelectChangeEvent
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite, FavoriteBorder, ShoppingCart } from '@mui/icons-material';

// Temporary game data - would be fetched from API in real app
const MOCK_GAMES = [
  {
    id: 1,
    title: 'Cyber Adventure 2077',
    price: 59.99,
    discountPrice: 49.99,
    rating: 4.5,
    image: 'https://via.placeholder.com/300x200?text=Cyber+Adventure',
    category: 'action',
    publisher: 'Game Studio X',
    downloads: 15000,
    releaseDate: '2023-05-15'
  },
  {
    id: 2,
    title: 'Fantasy Quest III',
    price: 39.99,
    discountPrice: null,
    rating: 4.8,
    image: 'https://via.placeholder.com/300x200?text=Fantasy+Quest',
    category: 'rpg',
    publisher: 'RPG Masters',
    downloads: 25000,
    releaseDate: '2022-11-30'
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
    downloads: 8000,
    releaseDate: '2023-02-10'
  },
  {
    id: 4,
    title: 'City Builder Pro',
    price: 24.99,
    discountPrice: null,
    rating: 4.2,
    image: 'https://via.placeholder.com/300x200?text=City+Builder',
    category: 'simulation',
    publisher: 'Sim Studios',
    downloads: 12000,
    releaseDate: '2023-01-05'
  },
  {
    id: 5,
    title: 'Racing Evolution',
    price: 49.99,
    discountPrice: 34.99,
    rating: 4.7,
    image: 'https://via.placeholder.com/300x200?text=Racing+Evolution',
    category: 'sports',
    publisher: 'Speed Games',
    downloads: 18000,
    releaseDate: '2022-12-15'
  },
  {
    id: 6,
    title: 'Puzzle Master',
    price: 19.99,
    discountPrice: null,
    rating: 4.3,
    image: 'https://via.placeholder.com/300x200?text=Puzzle+Master',
    category: 'puzzle',
    publisher: 'Brain Games Inc',
    downloads: 9000,
    releaseDate: '2023-03-20'
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
    downloads: 14000,
    releaseDate: '2022-10-25'
  },
  {
    id: 8,
    title: 'Zombie Survival',
    price: 34.99,
    discountPrice: null,
    rating: 4.1,
    image: 'https://via.placeholder.com/300x200?text=Zombie+Survival',
    category: 'action',
    publisher: 'Horror Studios',
    downloads: 11000,
    releaseDate: '2023-04-05'
  }
];

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
  
  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  const [games, setGames] = useState(MOCK_GAMES);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<number[]>([0, 60]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(6);
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  // Filter and sort games
  useEffect(() => {
    let filteredGames = [...MOCK_GAMES];
    
    // Apply search filter
    if (searchQuery) {
      filteredGames = filteredGames.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.publisher.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filteredGames = filteredGames.filter(game => 
        game.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Apply price range filter
    filteredGames = filteredGames.filter(game => {
      const priceToCheck = game.discountPrice || game.price;
      return priceToCheck >= priceRange[0] && priceToCheck <= priceRange[1];
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filteredGames.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filteredGames.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filteredGames.sort((a, b) => 
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      case 'rating':
        filteredGames.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filteredGames.sort((a, b) => b.downloads - a.downloads);
        break;
      default: // 'featured'
        // Keep original order (which is presumed to be "featured")
        break;
    }
    
    setGames(filteredGames);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, categoryFilter, sortBy, priceRange]);
  
  // Pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
  const pageCount = Math.ceil(games.length / gamesPerPage);
  
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
  
  const toggleWishlist = (gameId: number) => {
    if (wishlist.includes(gameId)) {
      setWishlist(wishlist.filter(id => id !== gameId));
    } else {
      setWishlist([...wishlist, gameId]);
    }
  };
  
  return (
    <Box>
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
            max={60}
            step={5}
            marks
            aria-labelledby="price-range-slider"
          />
        </Box>
      </Box>
      
      {/* Games Grid */}
      {currentGames.length > 0 ? (
        <Grid container spacing={3}>
          {currentGames.map((game) => (
            <Grid item key={game.id} xs={12} sm={6} md={4}>
              <Card className="game-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/game/${game.id}`}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={game.image}
                    alt={game.title}
                  />
                </Link>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ flex: 1 }}>
                      <Link to={`/game/${game.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {game.title}
                      </Link>
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleWishlist(game.id)}
                      color="secondary"
                    >
                      {wishlist.includes(game.id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={game.rating} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({game.rating})
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={game.category.charAt(0).toUpperCase() + game.category.slice(1)} 
                    size="small" 
                    sx={{ mb: 1 }} 
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Publisher: {game.publisher}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box>
                      {game.discountPrice ? (
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
                      startIcon={<ShoppingCart />}
                    >
                      Add
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
