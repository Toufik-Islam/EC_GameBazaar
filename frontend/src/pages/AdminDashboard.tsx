
import { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Game {
  id: string;
  title: string;
  price: number;
  description: string;
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
  const { isAdmin } = useAuth();

  // Mock data - replace with real API calls
  const pendingOrders: Order[] = [
    {
      id: '1',
      customerName: 'John Doe',
      status: 'pending',
      items: [{ id: '1', title: 'Game 1', price: 59.99, description: 'Action game' }],
      total: 59.99
    }
  ];

  const completedOrders: Order[] = [
    {
      id: '2',
      customerName: 'Jane Smith',
      status: 'completed',
      items: [{ id: '2', title: 'Game 2', price: 49.99, description: 'RPG game' }],
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
    thumbnail: '',
    images: [] as string[]
  });

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

  const handleAddGame = () => {
    const newGameItem = {
      id: String(Date.now()),
      title: newGame.title,
      price: parseFloat(newGame.price),
      description: newGame.description,
      thumbnail: newGame.thumbnail,
      images: newGame.images
    };
    setGames([...games, newGameItem]);
    setNewGame({ title: '', price: '', description: '' });
    setOpenAddGame(false);
  };

  const handleRemoveGame = (gameId: string) => {
    setGames(games.filter(game => game.id !== gameId));
  };

  if (!isAdmin()) {
    return <Typography>Access Denied</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
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

          <Grid container spacing={2}>
            {games.map((game) => (
              <Grid item xs={12} key={game.id}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{game.title}</Typography>
                    <Typography color="text.secondary">${game.price}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveGame(game.id)}
                  >
                    Remove Game
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Dialog open={openAddGame} onClose={() => setOpenAddGame(false)}>
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
              <TextField
                margin="dense"
                label="Installation Tutorial URL"
                fullWidth
                variant="outlined"
                value={newGame.tutorialUrl}
                onChange={(e) => setNewGame({...newGame, tutorialUrl: e.target.value})}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Installation Guide (PDF)</Typography>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewGame({...newGame, installationGuide: file});
                    }
                  }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Game Manual (PDF)</Typography>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewGame({...newGame, gameManual: file});
                    }
                  }}
                />
              </Box>
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
              <Button onClick={handleAddGame} variant="contained">Add Game</Button>
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
