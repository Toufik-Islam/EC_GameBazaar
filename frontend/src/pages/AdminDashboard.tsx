import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Checkbox,
  InputAdornment
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Create a simple event system to notify other components when games are changed
export const gameEvents = {
  listeners: new Set<() => void>(),
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  emit() {
    this.listeners.forEach(listener => listener());
  }
};

interface Game {
  _id: string;
  title: string;
  price: number;
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
}

interface Order {
  id: string;
  customerName: string;
  status: 'pending' | 'completed';
  items: Game[];
  total: number;
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [openAddGame, setOpenAddGame] = useState(false);
  const [openEditGame, setOpenEditGame] = useState(false);
  const { isAdmin, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Mock data for orders - replace with real API calls
  const pendingOrders: Order[] = [
    {
      id: '1',
      customerName: 'John Doe',
      status: 'pending',
      items: [{ _id: '1', title: 'Game 1', price: 59.99, description: 'Action game' }],
      total: 59.99
    }
  ];

  const completedOrders: Order[] = [
    {
      id: '2',
      customerName: 'Jane Smith',
      status: 'completed',
      items: [{ _id: '2', title: 'Game 2', price: 49.99, description: 'RPG game' }],
      total: 49.99
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState({
    title: '',
    price: '',
    description: '',
    genre: [] as string[],
    platform: [] as string[],
    developer: '',
    publisher: '',
    releaseDate: '',
    rating: '',
    stock: '',
    images: [] as string[],
    thumbnail: '',
    systemRequirements: '',
    installationTutorial: '',
    featured: false,
    onSale: false,
    discountPrice: ''
  });

  // Fetch games from the API
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.data);
      } else {
        setError('Failed to fetch games');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load games on component mount
  useEffect(() => {
    fetchGames();
    
    // Subscribe to game changes from other components
    return gameEvents.subscribe(() => {
      fetchGames();
    });
  }, [fetchGames]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isThumb: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (isThumb) {
          setNewGame(prev => ({ ...prev, thumbnail: base64 }));
        } else {
          setNewGame(prev => ({ 
            ...prev, 
            images: [...prev.images, base64].slice(0, 10) 
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewGame(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddGame = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!newGame.title || !newGame.description || !newGame.price || 
          !newGame.releaseDate || !newGame.genre.length || !newGame.platform.length ||
          !newGame.developer || !newGame.publisher || !newGame.rating || !newGame.stock) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Format the data according to backend model requirements
      const gameData = {
        title: newGame.title,
        description: newGame.description,
        price: parseFloat(newGame.price),
        releaseDate: new Date(newGame.releaseDate).toISOString(),
        genre: newGame.genre,
        platform: newGame.platform,
        developer: newGame.developer,
        publisher: newGame.publisher,
        rating: newGame.rating,
        stock: parseInt(newGame.stock || '0'),
        systemRequirements: newGame.systemRequirements,
        installationTutorial: newGame.installationTutorial,
        featured: newGame.featured,
        onSale: newGame.onSale,
        discountPrice: newGame.discountPrice ? parseFloat(newGame.discountPrice) : 0,
        images: newGame.thumbnail ? [newGame.thumbnail, ...newGame.images] : ['default.jpg']
      };

      console.log('Sending game data:', gameData);
      console.log('Using token:', token);

      // Send data to the backend
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gameData),
        credentials: 'include' // Include cookies
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        // Add the new game to the state and emit change event
        setGames(prevGames => [...prevGames, data.data]);
        gameEvents.emit(); // Notify other components of the change
        setSuccess('Game added successfully!');
        
        // Reset form
        setNewGame({
          title: '',
          price: '',
          description: '',
          genre: [],
          platform: [],
          developer: '',
          publisher: '',
          releaseDate: '',
          rating: '',
          stock: '',
          images: [],
          thumbnail: '',
          systemRequirements: '',
          installationTutorial: '',
          featured: false,
          onSale: false,
          discountPrice: ''
        });
        setOpenAddGame(false);
      } else {
        setError(data.message || 'Failed to add game');
      }
    } catch (err) {
      console.error('Error adding game:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    
    // Format the game data for the form
    setNewGame({
      title: game.title,
      price: game.price.toString(),
      description: game.description,
      genre: game.genre || [],
      platform: game.platform || [],
      developer: game.developer || '',
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : '',
      rating: game.rating || '',
      stock: game.stock ? game.stock.toString() : '',
      images: game.images ? [...game.images].slice(1) : [],
      thumbnail: game.images && game.images.length > 0 ? game.images[0] : '',
      systemRequirements: game.systemRequirements || '',
      installationTutorial: game.installationTutorial || '',
      featured: game.featured || false,
      onSale: game.onSale || false,
      discountPrice: game.discountPrice ? game.discountPrice.toString() : ''
    });
    
    setOpenEditGame(true);
  };

  const handleUpdateGame = async () => {
    if (!selectedGame) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!newGame.title || !newGame.description || !newGame.price || 
          !newGame.releaseDate || !newGame.genre.length || !newGame.platform.length ||
          !newGame.developer || !newGame.publisher || !newGame.rating || !newGame.stock) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Format the data according to backend model requirements
      const gameData = {
        title: newGame.title,
        description: newGame.description,
        price: parseFloat(newGame.price),
        releaseDate: new Date(newGame.releaseDate).toISOString(),
        genre: newGame.genre,
        platform: newGame.platform,
        developer: newGame.developer,
        publisher: newGame.publisher,
        rating: newGame.rating,
        stock: parseInt(newGame.stock || '0'),
        systemRequirements: newGame.systemRequirements,
        installationTutorial: newGame.installationTutorial,
        featured: newGame.featured,
        onSale: newGame.onSale,
        discountPrice: newGame.discountPrice ? parseFloat(newGame.discountPrice) : undefined,
        images: newGame.thumbnail ? [newGame.thumbnail, ...newGame.images] : ['default.jpg']
      };

      // Send data to the backend
      const response = await fetch(`/api/games/${selectedGame._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gameData),
        credentials: 'include' // Include cookies
      });

      const data = await response.json();

      if (data.success) {
        // Update the game in the state and emit change event
        setGames(prevGames => 
          prevGames.map(game => 
            game._id === selectedGame._id ? data.data : game
          )
        );
        gameEvents.emit(); // Notify other components of the change
        setSuccess('Game updated successfully!');
        
        // Reset form and close modal
        setNewGame({
          title: '',
          price: '',
          description: '',
          genre: [],
          platform: [],
          developer: '',
          publisher: '',
          releaseDate: '',
          rating: '',
          stock: '',
          images: [],
          thumbnail: '',
          systemRequirements: '',
          installationTutorial: '',
          featured: false,
          onSale: false,
          discountPrice: ''
        });
        setSelectedGame(null);
        setOpenEditGame(false);
      } else {
        setError(data.message || 'Failed to update game');
      }
    } catch (err) {
      console.error('Error updating game:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGame = async (gameId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove the game from the state and emit change event
        setGames(prevGames => prevGames.filter(game => game._id !== gameId));
        gameEvents.emit(); // Notify other components of the change
        setSuccess('Game removed successfully!');
      } else {
        setError(data.message || 'Failed to remove game');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Available genres and platforms from the backend model
  const availableGenres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
    'Sports', 'Racing', 'Puzzle', 'FPS', 'Fighting', 
    'Platformer', 'Survival', 'Horror', 'Stealth', 'Open World'
  ];

  const availablePlatforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
  
  const availableRatings = ['E', 'E10+', 'T', 'M', 'A'];

  if (!isAdmin()) {
    return <Typography>Access Denied</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Game Management" />
          <Tab label="Pending Orders" />
          <Tab label="Completed Orders" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Button 
            variant="contained" 
            onClick={() => setOpenAddGame(true)}
            sx={{ mb: 3 }}
          >
            Add New Game
          </Button>

          {loading && <CircularProgress />}

          <Grid container spacing={2}>
            {games.map((game) => (
              <Grid item xs={12} key={game._id}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{game.title}</Typography>
                    <Typography color="text.secondary">${game.price}</Typography>
                    {game.genre && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {game.genre.map(g => (
                          <Chip key={g} label={g} size="small" />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditGame(game)}
                      startIcon={<Edit />}
                    >
                      Edit Game
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveGame(game._id)}
                      startIcon={<Delete />}
                    >
                      Remove Game
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {/* Add Game Dialog */}
          <Dialog open={openAddGame} onClose={() => setOpenAddGame(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={newGame.title}
                onChange={(e) => setNewGame({...newGame, title: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
                value={newGame.price}
                onChange={(e) => setNewGame({...newGame, price: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.description}
                onChange={(e) => setNewGame({...newGame, description: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Publisher"
                fullWidth
                variant="outlined"
                value={newGame.publisher}
                onChange={(e) => setNewGame({...newGame, publisher: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Developer"
                fullWidth
                variant="outlined"
                value={newGame.developer}
                onChange={(e) => setNewGame({...newGame, developer: e.target.value})}
              />
              <TextField
                margin="dense"
                type="date"
                label="Release Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newGame.releaseDate}
                onChange={(e) => setNewGame({...newGame, releaseDate: e.target.value})}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Genre</InputLabel>
                <Select
                  multiple
                  value={newGame.genre}
                  onChange={(e) => setNewGame({...newGame, genre: e.target.value as string[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableGenres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Platform</InputLabel>
                <Select
                  multiple
                  value={newGame.platform}
                  onChange={(e) => setNewGame({...newGame, platform: e.target.value as string[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availablePlatforms.map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>ESRB Rating</InputLabel>
                <Select
                  value={newGame.rating}
                  onChange={(e) => setNewGame({...newGame, rating: e.target.value})}
                >
                  {availableRatings.map((rating) => (
                    <MenuItem key={rating} value={rating}>
                      {rating}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                label="Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={newGame.stock}
                onChange={(e) => setNewGame({...newGame, stock: e.target.value})}
              />
              
              <TextField
                margin="dense"
                label="System Requirements"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.systemRequirements}
                onChange={(e) => setNewGame({...newGame, systemRequirements: e.target.value})}
                helperText="Enter detailed system requirements"
              />
              
              <TextField
                margin="dense"
                label="Installation Tutorial"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.installationTutorial}
                onChange={(e) => setNewGame({...newGame, installationTutorial: e.target.value})}
                helperText="Enter step-by-step installation instructions"
              />
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl fullWidth component="fieldset" variant="outlined">
                  <Typography variant="subtitle1" gutterBottom>Game Display Options</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={newGame.featured}
                            onChange={(e) => setNewGame({...newGame, featured: e.target.checked})}
                            name="featured"
                          />
                          <Typography>Featured on Homepage</Typography>
                        </Box>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={newGame.onSale}
                            onChange={(e) => setNewGame({...newGame, onSale: e.target.checked})}
                            name="onSale"
                          />
                          <Typography>On Sale</Typography>
                        </Box>
                      </FormControl>
                    </Grid>
                    {newGame.onSale && (
                      <Grid item xs={12}>
                        <TextField
                          margin="dense"
                          label="Discount Price"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={newGame.discountPrice}
                          onChange={(e) => setNewGame({...newGame, discountPrice: e.target.value})}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          helperText="Enter the discounted price (must be lower than regular price)"
                        />
                      </Grid>
                    )}
                  </Grid>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Thumbnail Image (Required)</Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                {newGame.thumbnail && (
                  <Box sx={{ mt: 1 }}>
                    <img src={newGame.thumbnail} alt="Thumbnail" style={{ height: 100 }} />
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Images (Up to 10)
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={newGame.images.length >= 10}
                />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {newGame.images.map((img, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt={`Game ${index + 1}`} style={{ height: 100 }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddGame(false)}>Cancel</Button>
              <Button 
                onClick={handleAddGame} 
                variant="contained" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Game'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Edit Game Dialog */}
          <Dialog open={openEditGame} onClose={() => setOpenEditGame(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={newGame.title}
                onChange={(e) => setNewGame({...newGame, title: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
                value={newGame.price}
                onChange={(e) => setNewGame({...newGame, price: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.description}
                onChange={(e) => setNewGame({...newGame, description: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Publisher"
                fullWidth
                variant="outlined"
                value={newGame.publisher}
                onChange={(e) => setNewGame({...newGame, publisher: e.target.value})}
              />
              <TextField
                margin="dense"
                label="Developer"
                fullWidth
                variant="outlined"
                value={newGame.developer}
                onChange={(e) => setNewGame({...newGame, developer: e.target.value})}
              />
              <TextField
                margin="dense"
                type="date"
                label="Release Date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newGame.releaseDate}
                onChange={(e) => setNewGame({...newGame, releaseDate: e.target.value})}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Genre</InputLabel>
                <Select
                  multiple
                  value={newGame.genre}
                  onChange={(e) => setNewGame({...newGame, genre: e.target.value as string[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availableGenres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Platform</InputLabel>
                <Select
                  multiple
                  value={newGame.platform}
                  onChange={(e) => setNewGame({...newGame, platform: e.target.value as string[]})}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {availablePlatforms.map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>ESRB Rating</InputLabel>
                <Select
                  value={newGame.rating}
                  onChange={(e) => setNewGame({...newGame, rating: e.target.value})}
                >
                  {availableRatings.map((rating) => (
                    <MenuItem key={rating} value={rating}>
                      {rating}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                label="Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={newGame.stock}
                onChange={(e) => setNewGame({...newGame, stock: e.target.value})}
              />
              
              <TextField
                margin="dense"
                label="System Requirements"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.systemRequirements}
                onChange={(e) => setNewGame({...newGame, systemRequirements: e.target.value})}
                helperText="Enter detailed system requirements"
              />
              
              <TextField
                margin="dense"
                label="Installation Tutorial"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={newGame.installationTutorial}
                onChange={(e) => setNewGame({...newGame, installationTutorial: e.target.value})}
                helperText="Enter step-by-step installation instructions"
              />
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl fullWidth component="fieldset" variant="outlined">
                  <Typography variant="subtitle1" gutterBottom>Game Display Options</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={newGame.featured}
                            onChange={(e) => setNewGame({...newGame, featured: e.target.checked})}
                            name="featured"
                          />
                          <Typography>Featured on Homepage</Typography>
                        </Box>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={newGame.onSale}
                            onChange={(e) => setNewGame({...newGame, onSale: e.target.checked})}
                            name="onSale"
                          />
                          <Typography>On Sale</Typography>
                        </Box>
                      </FormControl>
                    </Grid>
                    {newGame.onSale && (
                      <Grid item xs={12}>
                        <TextField
                          margin="dense"
                          label="Discount Price"
                          type="number"
                          fullWidth
                          variant="outlined"
                          value={newGame.discountPrice}
                          onChange={(e) => setNewGame({...newGame, discountPrice: e.target.value})}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          helperText="Enter the discounted price (must be lower than regular price)"
                        />
                      </Grid>
                    )}
                  </Grid>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Thumbnail Image</Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                {newGame.thumbnail && (
                  <Box sx={{ mt: 1 }}>
                    <img src={newGame.thumbnail} alt="Thumbnail" style={{ height: 100 }} />
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Images (Up to 10)
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={newGame.images.length >= 10}
                />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {newGame.images.map((img, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt={`Game ${index + 1}`} style={{ height: 100 }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditGame(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateGame} 
                variant="contained" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Game'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {tabValue === 1 && (
        <List>
          {pendingOrders.map((order) => (
            <Paper key={order.id} sx={{ mb: 2, p: 2 }}>
              <ListItem>
                <ListItemText
                  primary={`Order #${order.id} - ${order.customerName}`}
                  secondary={`Total: $${order.total}`}
                />
                <Button variant="contained" color="primary">
                  Approve Order
                </Button>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {tabValue === 2 && (
        <List>
          {completedOrders.map((order) => (
            <Paper key={order.id} sx={{ mb: 2, p: 2 }}>
              <ListItem>
                <ListItemText
                  primary={`Order #${order.id} - ${order.customerName}`}
                  secondary={`Total: $${order.total}`}
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
}
