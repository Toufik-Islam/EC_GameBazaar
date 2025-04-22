import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge,
  InputBase,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useMediaQuery,
  useTheme,
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Avatar,
  ClickAwayListener,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ShoppingCart, 
  AccountCircle,
  Favorite,
  Menu as MenuIcon,
  Home,
  Category,
  SportsEsports,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import debounce from 'lodash.debounce';

interface GameSuggestion {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

// Styled suggestions dropdown
const SuggestionsDropdown = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1201, // Increased z-index to appear above the Select component
  marginTop: theme.spacing(1),
  left: 0,
  right: 0,
  maxHeight: '350px', // Increased height for better scrollability
  overflow: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}));

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const isLoggedIn = !!user;
  const cartItemCount = 0;

  // Fetch game suggestions based on search query
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/games/search/suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the fetchSuggestions function to avoid too many API calls
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  // Update suggestions when search query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedFetchSuggestions(searchQuery);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Cleanup debounce on unmount
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchQuery]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const categories = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
    'Sports', 'Racing', 'Puzzle', 'FPS', 'Fighting', 
    'Platformer', 'Survival', 'Horror', 'Stealth', 'Open World'
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem component={Link} to="/">
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem onClick={() => setDrawerOpen(false)}>
          <ListItemIcon><Category /></ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
        {isLoggedIn && isAdmin() && (
          <ListItem component={Link} to="/admin-dashboard">
            <ListItemIcon><AdminPanelSettings /></ListItemIcon>
            <ListItemText primary="Admin Dashboard" />
          </ListItem>
        )}
        {isLoggedIn && (
          <ListItem component={Link} to="/profile">
            <ListItemIcon><Person /></ListItemIcon>
            <ListItemText primary="Account Settings" />
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        {categories.map((category) => (
          <ListItem 
            key={category} 
            component={Link} 
            to={`/?category=${category.toLowerCase()}`}
            sx={{ pl: 4 }}
          >
            <ListItemIcon><SportsEsports /></ListItemIcon>
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const menuItems = isLoggedIn ? [
    <MenuItem key="account" onClick={() => { handleMenuClose(); navigate('/profile'); }}>Account Settings</MenuItem>,
    <MenuItem key="orders" onClick={() => { handleMenuClose(); navigate('/order-history'); }}>Order History</MenuItem>,
    <MenuItem key="wishlist" onClick={() => { handleMenuClose(); navigate('/wishlist'); }}>My Wishlist</MenuItem>,
    isAdmin() && <MenuItem key="admin" onClick={() => { handleMenuClose(); navigate('/admin-dashboard'); }}>Admin Dashboard</MenuItem>,
    <MenuItem key="logout" onClick={() => { handleMenuClose(); logout(); }}>Logout</MenuItem>
  ].filter(Boolean) : [
    <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }}>Login</MenuItem>,
    <MenuItem key="register" onClick={() => { handleMenuClose(); navigate('/register'); }}>Register</MenuItem>
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            Game Bazaar
          </Typography>

          <Box sx={{ flexGrow: 1, position: 'relative', ml: 2, mr: 2 }}>
            <form onSubmit={handleSearch}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search games…"
                  inputProps={{ 'aria-label': 'search games' }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                />
                {loading && (
                  <Box sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                    <CircularProgress size={20} color="inherit" />
                  </Box>
                )}
              </Search>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                <SuggestionsDropdown>
                  {suggestions.length > 0 ? (
                    suggestions.map(game => (
                      <MenuItem 
                        key={game._id} 
                        onClick={() => handleSuggestionClick(game._id)}
                        sx={{ py: 1 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Avatar 
                            src={game.thumbnail} 
                            alt={game.title}
                            variant="square"
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <Typography variant="body1">{game.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {game.discountPrice ? (
                                <>
                                  <Typography 
                                    variant="body2" 
                                    color="error"
                                    sx={{ mr: 1 }}
                                  >
                                    ${game.discountPrice.toFixed(2)}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ textDecoration: 'line-through' }}
                                  >
                                    ${game.price.toFixed(2)}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  ${game.price.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    searchQuery.length > 0 && !loading && (
                      <MenuItem disabled>
                        <Typography variant="body2">No games found</Typography>
                      </MenuItem>
                    )
                  )}
                  {searchQuery.length > 0 && suggestions.length > 0 && (
                    <MenuItem 
                      onClick={() => {
                        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
                        setShowSuggestions(false);
                      }}
                      sx={{ 
                        borderTop: '1px solid', 
                        borderColor: 'divider',
                        justifyContent: 'center',
                        py: 1
                      }}
                    >
                      <Typography variant="body2" color="primary">
                        View all results for "{searchQuery}"
                      </Typography>
                    </MenuItem>
                  )}
                </SuggestionsDropdown>
              </ClickAwayListener>
            )}
          </Box>

          <FormControl sx={{ minWidth: 120, mr: 2, display: { xs: 'none', md: 'block' } }}>
            <Select
              value=""
              displayEmpty
              onChange={(e) => navigate(`/?category=${e.target.value.toLowerCase()}`)}
              sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
            >
              <MenuItem value="" disabled>Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex' }}>
            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {isLoggedIn && (
              <IconButton color="inherit" component={Link} to="/wishlist">
                <Favorite />
              </IconButton>
            )}

            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItems}
      </Menu>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
