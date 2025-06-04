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
  borderRadius: 25,
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  '&:focus-within': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
    border: '1px solid rgba(102, 126, 234, 0.5)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  color: 'rgba(0, 0, 0, 0.6)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'rgba(0, 0, 0, 0.8)',
  width: '100%',
  fontWeight: 500,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.5)',
      opacity: 1,
    },
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

// Styled suggestions dropdown
const SuggestionsDropdown = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1201,  marginTop: theme.spacing(1),
  left: 0,
  right: 0,
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  maxHeight: '350px', // Increased height for better scrollability
  overflow: 'auto',
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
    <Box 
      sx={{ 
        width: 250,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        height: '100%',
      }} 
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >      <List>
        <ListItem component={Link} to="/" sx={{ py: 2 }}>
          <ListItemIcon><Home sx={{ color: '#667eea' }} /></ListItemIcon>
          <ListItemText 
            primary="Home" 
            sx={{ 
              '& .MuiListItemText-primary': { 
                color: '#2c3e50', 
                fontWeight: 600,
                fontSize: '1.1rem' 
              } 
            }} 
          />
        </ListItem>
        <ListItem component={Link} to="/blog" sx={{ py: 2 }}>
          <ListItemIcon><SportsEsports sx={{ color: '#667eea' }} /></ListItemIcon>
          <ListItemText 
            primary="Blog" 
            sx={{ 
              '& .MuiListItemText-primary': { 
                color: '#2c3e50', 
                fontWeight: 600,
                fontSize: '1.1rem' 
              } 
            }} 
          />
        </ListItem>
        <ListItem onClick={() => setDrawerOpen(false)} sx={{ py: 2 }}>
          <ListItemIcon><Category sx={{ color: '#667eea' }} /></ListItemIcon>
          <ListItemText 
            primary="Categories" 
            sx={{ 
              '& .MuiListItemText-primary': { 
                color: '#2c3e50', 
                fontWeight: 600,
                fontSize: '1.1rem' 
              } 
            }} 
          />
        </ListItem>
        {isLoggedIn && isAdmin() && (
          <ListItem component={Link} to="/admin-dashboard" sx={{ py: 2 }}>
            <ListItemIcon><AdminPanelSettings sx={{ color: '#667eea' }} /></ListItemIcon>
            <ListItemText 
              primary="Admin Dashboard" 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  fontSize: '1.1rem' 
                } 
              }} 
            />
          </ListItem>
        )}
        {isLoggedIn && (
          <ListItem component={Link} to="/profile" sx={{ py: 2 }}>
            <ListItemIcon><Person sx={{ color: '#667eea' }} /></ListItemIcon>
            <ListItemText 
              primary="Account Settings" 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: '#2c3e50', 
                  fontWeight: 600,
                  fontSize: '1.1rem' 
                } 
              }} 
            />
          </ListItem>
        )}
      </List>
      <Divider sx={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />
      <List>
        {categories.map((category) => (
          <ListItem 
            key={category} 
            component={Link} 
            to={`/?category=${category.toLowerCase()}`}
            sx={{ 
              pl: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                borderRadius: 1,
                mx: 1,
              }
            }}
          >
            <ListItemIcon><SportsEsports sx={{ color: '#764ba2', fontSize: '1.2rem' }} /></ListItemIcon>
            <ListItemText 
              primary={category} 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: '#2c3e50', 
                  fontWeight: 500,
                  fontSize: '1rem' 
                } 
              }} 
            />
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
        <Toolbar>          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                color: '#2c3e50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)',
                  color: '#667eea',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}<Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              fontSize: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                filter: 'brightness(1.2)',
              }
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
          </Box>          <FormControl sx={{ minWidth: 120, mr: 2, display: { xs: 'none', md: 'block' } }}>
            <Select
              value=""
              displayEmpty
              onChange={(e) => navigate(`/?category=${e.target.value.toLowerCase()}`)}
              sx={{ 
                color: '#2c3e50', 
                fontWeight: 600,
                '& .MuiSelect-icon': { color: '#2c3e50' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(44, 62, 80, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#666' }}>Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category} sx={{ color: '#2c3e50' }}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            component={Link} 
            to="/blog"
            sx={{ 
              mr: 2, 
              display: { xs: 'none', md: 'block' },
              color: '#2c3e50',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                transform: 'translateY(-1px)',
                color: '#667eea',
              }
            }}
          >
            Blog
          </Button>          <Box sx={{ display: 'flex' }}>
            <IconButton 
              component={Link} 
              to="/cart"
              sx={{ 
                color: '#2c3e50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)',
                  color: '#667eea',
                }
              }}
            >
              <Badge 
                badgeContent={cartItemCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff4757',
                    color: 'white',
                    fontWeight: 600,
                  }
                }}
              >
                <ShoppingCart />
              </Badge>
            </IconButton>

            {isLoggedIn && (
              <IconButton 
                component={Link} 
                to="/wishlist"
                sx={{ 
                  color: '#2c3e50',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)',
                    color: '#667eea',
                  }
                }}
              >
                <Favorite />
              </IconButton>
            )}

            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ 
                color: '#2c3e50',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)',
                  color: '#667eea',
                }
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>      <Menu
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
        sx={{
          '& .MuiPaper-root': {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            mt: 1,
          },
          '& .MuiMenuItem-root': {
            color: '#2c3e50',
            fontWeight: 500,
            fontSize: '1rem',
            py: 1.5,
            px: 3,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.08)',
              color: '#667eea',
            }
          }
        }}
      >
        {menuItems}
      </Menu>      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
