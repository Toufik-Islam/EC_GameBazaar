
import { useState } from 'react';
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
  SelectChangeEvent
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
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

  const { user } = useAuth();
  const isLoggedIn = !!user;
  const cartItemCount = 0;

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
      navigate(`/?search=${searchQuery}`);
    }
  };

  const categories = [
    'Action', 'Adventure', 'RPG', 'Simulation', 'Strategy', 'Sports', 'Puzzle'
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
            <ListItemText primary="Profile" />
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
    <MenuItem key="profile" onClick={() => { handleMenuClose(); navigate('/profile'); }}>My Profile</MenuItem>,
    <MenuItem key="orders" onClick={() => { handleMenuClose(); navigate('/order-history'); }}>Order History</MenuItem>,
    <MenuItem key="wishlist" onClick={() => { handleMenuClose(); navigate('/wishlist'); }}>My Wishlist</MenuItem>,
    isAdmin() && <MenuItem key="admin" onClick={() => { handleMenuClose(); navigate('/admin-dashboard'); }}>Admin Dashboard</MenuItem>,
    <MenuItem key="settings" onClick={() => { handleMenuClose(); navigate('/profile?tab=settings'); }}>Account Settings</MenuItem>,
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

          <form onSubmit={handleSearch} style={{ flexGrow: 1 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search games…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Search>
          </form>

          <FormControl sx={{ minWidth: 120, mr: 2 }}>
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
