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
import { Delete, Edit, Search } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { gameEvents } from '../services/events';

// Interface definitions
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
  featured?: boolean;
  onSale?: boolean;
  discountPrice?: number;
}

interface OrderItem {
  game: {
    _id: string;
    title: string;
    images?: string[];
  } | null;
  quantity: number;
  price: number;
}

interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  user: OrderUser;
  orderItems: OrderItem[];
  totalPrice: number;
  status: string;
  isPaid: boolean;
  paidAt: string;
  createdAt: string;
  approvedAt?: string;
}

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  blogType: string;
  frontpageImage: string;
  images: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: string;
  tags: string[];
  views: number;
  likes: string[];
  comments: any[];
  featured: boolean;
  readTime: number;
  slug: string;
  relatedGames?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [openAddGame, setOpenAddGame] = useState(false);
  const [openEditGame, setOpenEditGame] = useState(false);
  const [openAddBlog, setOpenAddBlog] = useState(false);
  const [openEditBlog, setOpenEditBlog] = useState(false);
  const { isAdmin, token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);// State for real order data
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
    // Search states for orders and games
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [completedSearchTerm, setCompletedSearchTerm] = useState('');const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Load appropriate data when tab changes
    if (newValue === 1) {
      fetchPendingOrders();
    } else if (newValue === 2) {
      fetchCompletedOrders();
    } else if (newValue === 3) {
      fetchBlogs();
    }
  };

  // Search handlers for orders
  const handlePendingSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchTerm(e.target.value);
  };

  const handleCompletedSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompletedSearchTerm(e.target.value);
  };
  // Filter functions for orders
  const filteredPendingOrders = pendingOrders.filter(order => 
    order._id.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    order.orderItems.some(item => 
      item.game && item.game.title.toLowerCase().includes(pendingSearchTerm.toLowerCase())
    )
  );
  const filteredCompletedOrders = completedOrders.filter(order => 
    order._id.toLowerCase().includes(completedSearchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(completedSearchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(completedSearchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(completedSearchTerm.toLowerCase()) ||
    order.orderItems.some(item => 
      item.game && item.game.title.toLowerCase().includes(completedSearchTerm.toLowerCase())
    )  );

  const [games, setGames] = useState<Game[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Filter games based on search query
  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (game.genre && game.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))) ||
    (game.platform && game.platform.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
    (game.developer && game.developer.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (game.publisher && game.publisher.toLowerCase().includes(searchQuery.toLowerCase()))
  );
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
    featured: false,    onSale: false,
    discountPrice: ''
  });  const [newBlog, setNewBlog] = useState({
    title: '',
    description: '',
    content: '',
    blogType: '',
    frontpageImage: '',
    images: [] as string[],
    status: 'draft',
    tags: [] as string[],
    featured: false,
    relatedGames: [] as string[],
    readTime: 5
  });
  // Fetch pending orders
  const fetchPendingOrders = useCallback(async () => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      console.log('Fetching pending orders...', { token: token ? 'present' : 'missing', userId: user?.id });
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Add user ID header for development mode
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }

      const response = await fetch('/api/orders/pending', {
        method: 'GET',
        headers
      });

      // Get the response data, handling both success and error cases
      const data = await response.json();
      console.log('Pending orders API response:', { 
        status: response.status, 
        ok: response.ok, 
        data 
      });
      
      if (!response.ok) {
        const errorMsg = data.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (data.success) {
        setPendingOrders(data.data || []);
        console.log(`Successfully loaded ${data.count || 0} pending orders`);
      } else {
        setOrderError(data.message || 'Failed to fetch pending orders');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching pending orders:', errorMessage);
      
      // Display a more user-friendly error
      setOrderError(`Error fetching pending orders: ${errorMessage}`);
    } finally {
      setOrderLoading(false);
    }
  }, [token, user?.id]);
  // Fetch completed/processed orders
  const fetchCompletedOrders = useCallback(async () => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      console.log('Fetching completed orders...', { token: token ? 'present' : 'missing', userId: user?.id });
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Add user ID header for development mode
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }

      const response = await fetch('/api/orders', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('All orders API response:', { 
        status: response.status, 
        ok: response.ok, 
        totalOrders: data.count,
        data: data.data?.length ? `${data.data.length} orders` : 'no orders'
      });
      
      if (data.success) {
        // Filter for non-pending orders (completed, shipped, delivered)
        const processed = data.data.filter(
          (order: Order) => order.status !== 'pending' && order.status !== 'cancelled'
        );
        setCompletedOrders(processed);
        console.log(`Successfully loaded ${processed.length} processed orders from ${data.count} total orders`);
      } else {
        setOrderError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching completed orders:', errorMessage);
      setOrderError('Error fetching completed orders');
    } finally {
      setOrderLoading(false);
    }
  }, [token, user?.id]);

  // Approve order
  const approveOrder = async (orderId: string) => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      console.log(`Approving order ${orderId}...`);
      
      // Make sure we have access to the user object
      if (!user) {
        console.error('Cannot approve order: Admin user information is not available');
        setOrderError('Admin information not available. Please try again or refresh the page.');
        setOrderLoading(false);
        return;
      }
      
      // Use the same approach as when orders are created - get user info directly from auth context
      const adminInfo = {
        adminName: user.name,
        adminEmail: user.email
      };
      
      console.log('Admin info for approval:', adminInfo);
      
      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminInfo)
      });

      const data = await response.json();
      console.log('Order approval response:', data);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}. Message: ${data.message || 'Unknown error'}`);
      }
      
      if (data.success) {
        setSuccess('Order approved successfully');
        
        // Remove the approved order from pending and add to completed
        setPendingOrders(pendingOrders.filter(order => order._id !== orderId));
        
        // Refresh both lists to ensure data is current
        fetchPendingOrders();
        fetchCompletedOrders();
      } else {
        setOrderError(data.message || 'Failed to approve order');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error approving order:', errorMessage);
      setOrderError(`Error approving order: ${errorMessage}`);
    } finally {
      setOrderLoading(false);
    }
  };

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
      }    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch blogs from the API
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs');
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);  // Load games on component mount
  useEffect(() => {
    fetchGames();
    
    // Subscribe to game changes from other components
    const unsubscribe = gameEvents.subscribe(() => {
      fetchGames();
    });
    
    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }, [fetchGames]);

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  // Load orders when component mounts and user is authenticated
  useEffect(() => {
    if (isAdmin() && token) {
      // Load pending orders by default when component mounts
      console.log('Admin dashboard mounted, loading initial data...');
      fetchPendingOrders();
    }
  }, [token, fetchPendingOrders]); // Remove isAdmin from deps since it's a function
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
  };  const handleBlogImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFrontpage: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Check image count limit for additional images
      if (!isFrontpage && newBlog.images.length >= 10) {
        setError('Maximum 10 additional images allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (isFrontpage) {
          setNewBlog(prev => ({ ...prev, frontpageImage: base64 }));
        } else {
          setNewBlog(prev => ({ 
            ...prev, 
            images: [...prev.images, base64].slice(0, 10) 
          }));
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
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

  const handleRemoveBlogImage = (index: number) => {
    setNewBlog(prev => ({
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

  // Blog management functions
  const handleAddBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Adding blog with data:', newBlog);
      console.log('User context:', { user, token: token ? 'present' : 'missing' });
        // Enhanced validation with specific error messages
      const validationErrors = [];
      
      if (!newBlog.title || newBlog.title.trim() === '') {
        validationErrors.push('Title is required');
      } else if (newBlog.title.length > 200) {
        validationErrors.push('Title cannot exceed 200 characters');
      }
      
      if (!newBlog.description || newBlog.description.trim() === '') {
        validationErrors.push('Description is required');
      } else if (newBlog.description.length > 500) {
        validationErrors.push('Description cannot exceed 500 characters');
      }
      
      if (!newBlog.content || newBlog.content.trim() === '') {
        validationErrors.push('Content is required');
      } else if (newBlog.content.length < 100) {
        validationErrors.push('Content must be at least 100 characters long');
      }
      
      if (!newBlog.blogType || newBlog.blogType.trim() === '') {
        validationErrors.push('Blog type is required');
      }
      
      if (!newBlog.frontpageImage || newBlog.frontpageImage.trim() === '') {
        validationErrors.push('Frontpage image is required');
      }
      
      // Validate image count
      if (newBlog.images.length > 10) {
        validationErrors.push('Maximum 10 additional images allowed');
      }
      
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setLoading(false);
        return;
      }
      
      // Format the data according to backend model requirements
      const blogData = {
        title: newBlog.title.trim(),
        description: newBlog.description.trim(),
        content: newBlog.content.trim(),
        blogType: newBlog.blogType,
        frontpageImage: newBlog.frontpageImage,
        images: newBlog.images,
        status: newBlog.status,
        tags: newBlog.tags.filter(tag => tag.trim() !== ''),
        featured: newBlog.featured,
        relatedGames: newBlog.relatedGames.filter(game => game.trim() !== ''),
        readTime: newBlog.readTime
        // Note: author is set automatically by backend from the JWT token
      };

      console.log('Sending blog data:', blogData);

      // Send data to the backend
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData),
        credentials: 'include'
      });

      const data = await response.json();
      
      console.log('Blog creation response:', data);

      if (data.success) {
        // Add the new blog to the state
        setBlogs(prevBlogs => [...prevBlogs, data.data]);
        setSuccess('Blog created successfully!');
          // Reset form
        setNewBlog({
          title: '',
          description: '',
          content: '',
          blogType: '',
          frontpageImage: '',
          images: [],
          status: 'draft',
          tags: [],
          featured: false,
          relatedGames: [],
          readTime: 5
        });
        setOpenAddBlog(false);      } else {        // Handle validation errors array from backend
        if (data.errors && Array.isArray(data.errors)) {
          // Display validation errors in a more readable format
          const formattedErrors = data.errors.map((err: string) => `• ${err}`).join('\n');
          setError(`Validation Error:\n${formattedErrors}`);
        } else {
          setError(data.message || 'Failed to create blog');
        }
      }
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
      // Format the blog data for the form
    setNewBlog({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      blogType: blog.blogType,
      frontpageImage: blog.frontpageImage,
      images: blog.images || [],
      status: blog.status,
      tags: blog.tags || [],
      featured: blog.featured || false,
      relatedGames: blog.relatedGames || [],
      readTime: blog.readTime || 5
    });
    
    setOpenEditBlog(true);
  };
  const handleUpdateBlog = async () => {
    if (!selectedBlog) return;
    
    try {
      setLoading(true);
      setError(null);
        // Client-side validation
      const validationErrors = [];
      
      if (!newBlog.title) {
        validationErrors.push('Title is required');
      } else if (newBlog.title.length > 200) {
        validationErrors.push('Title must be 200 characters or less');
      }
      
      if (!newBlog.description) {
        validationErrors.push('Description is required');
      } else if (newBlog.description.length > 500) {
        validationErrors.push('Description must be 500 characters or less');
      }
      
      if (!newBlog.content) {
        validationErrors.push('Content is required');
      } else if (newBlog.content.length < 100) {
        validationErrors.push('Content must be at least 100 characters');
      }
      
      if (!newBlog.blogType) {
        validationErrors.push('Blog type is required');
      }
      
      if (!newBlog.frontpageImage) {
        validationErrors.push('Frontpage image is required');
      }
      
      // Validate image count
      if (newBlog.images.length > 10) {
        validationErrors.push('Maximum 10 additional images allowed');
      }
      
      if (validationErrors.length > 0) {
        setError(`Validation Error: ${validationErrors.join(', ')}`);
        setLoading(false);
        return;
      }
        // Format the data according to backend model requirements
      const blogData = {
        title: newBlog.title,
        description: newBlog.description,
        content: newBlog.content,
        blogType: newBlog.blogType,
        frontpageImage: newBlog.frontpageImage,
        images: newBlog.images,
        status: newBlog.status,
        tags: newBlog.tags,
        featured: newBlog.featured,
        relatedGames: newBlog.relatedGames,
        readTime: newBlog.readTime
      };

      // Send data to the backend
      const response = await fetch(`/api/blogs/${selectedBlog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData),
        credentials: 'include'
      });

      const data = await response.json();      if (data.success) {
        // Update the blog in the state
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === selectedBlog._id ? data.data : blog
          )
        );
        setSuccess('Blog updated successfully!');
          // Reset form and close modal
        setNewBlog({
          title: '',
          description: '',
          content: '',
          blogType: '',
          frontpageImage: '',
          images: [],
          status: 'draft',
          tags: [],
          featured: false,
          relatedGames: [],
          readTime: 5
        });
        setSelectedBlog(null);
        setOpenEditBlog(false);      } else {        // Handle validation errors array from backend
        if (data.errors && Array.isArray(data.errors)) {
          // Display validation errors in a more readable format
          const formattedErrors = data.errors.map((err: string) => `• ${err}`).join('\n');
          setError(`Validation Error:\n${formattedErrors}`);
        } else {
          setError(data.message || 'Failed to update blog');
        }
      }
    } catch (err) {
      console.error('Error updating blog:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlog = async (blogId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove the blog from the state
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
        setSuccess('Blog removed successfully!');
      } else {
        setError(data.message || 'Failed to remove blog');
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

  // Available blog types from the backend model
  const availableBlogTypes = [
    'Game News', 'Gaming Tips', 'Installation Troubleshooting', 
    'Game Reviews', 'Industry Updates', 'Hardware & Tech', 
    'Game Guides', 'Gaming Culture'
  ];

  const availableBlogStatuses = ['draft', 'published', 'archived'];

  if (!isAdmin()) {
    return <Typography>Access Denied</Typography>;
  }
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">        {/* Header Section */}
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: '#2c3e50',
              mb: 1
            }}
          >
            🛠️ Admin Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#5a6c7d' }}>
            Manage games, orders, and content
          </Typography>
        </Paper>

        {/* Quick Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                background: ' rgba(118, 75, 162, 0.1) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                {games.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5a6c7d', fontWeight: 600 }}>
                Total Games
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 193, 7, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffc107', mb: 1 }}>
                {pendingOrders.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5a6c7d', fontWeight: 600 }}>
                Pending Orders
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                {completedOrders.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5a6c7d', fontWeight: 600 }}>
                Completed Orders
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(123, 31, 162, 0.1) 100%)',
                border: '1px solid rgba(156, 39, 176, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                {blogs.length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5a6c7d', fontWeight: 600 }}>
                Published Blogs
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      {/* Notifications */}      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" className="high-contrast-text">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" className="high-contrast-text">
          {success}
        </Alert>
      </Snackbar>

        {/* Tabs Navigation */}
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  },
                  '&.Mui-selected': {
                    color: '#667eea',
                    fontWeight: 700,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }
              }}
            >
              <Tab label="🎮 Game Management" />
              <Tab label="📦 Pending Orders" />
              <Tab label="✅ Processed Orders" />
              <Tab label="📝 Blog Management" />
            </Tabs>
          </Box>
        </Paper>      {tabValue === 0 && (
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              🎮 Game Management
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenAddGame(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
            >              ➕ Add New Game
            </Button>
          </Box>          {/* Search Box */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="🔍 Search games by title, genre, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#667eea',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                  }
                }
              }}            />
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
          )}

          {!loading && filteredGames.length === 0 && searchQuery && (
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#5a6c7d', mb: 1 }}>
                🔍 No games found
              </Typography>
              <Typography variant="body2" sx={{ color: '#7a8b9c' }}>
                No games match your search criteria. Try adjusting your search terms.
              </Typography>
            </Paper>
          )}

          {!loading && filteredGames.length === 0 && !searchQuery && games.length === 0 && (
            <Paper
              elevation={0}
              className="glassmorphism"
              sx={{
                p: 4,
                borderRadius: 3,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: '#5a6c7d', mb: 1 }}>
                🎮 No games yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#7a8b9c' }}>
                Start by adding your first game to the catalog.
              </Typography>
            </Paper>
          )}

          <Grid container spacing={3}>
            {filteredGames.map((game) => (
              <Grid item xs={12} md={6} lg={4} key={game._id}>
                <Paper 
                  elevation={0}
                  className="glassmorphism"
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                      {game.title}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 700 }}>
                      ৳{game.price}
                    </Typography>
                    {game.genre && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>                        {game.genre.map(g => (
                          <Chip 
                            key={g} 
                            label={g} 
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              color: '#667eea',
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditGame(game)}
                      startIcon={<Edit />}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#667eea',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#5a6fd8',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleRemoveGame(game._id)}
                      startIcon={<Delete />}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#ff4757',
                        color: '#ff4757',
                        '&:hover': {
                          borderColor: '#ff3742',
                          backgroundColor: 'rgba(255, 71, 87, 0.08)',
                        }
                      }}
                    >
                      Delete
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
                            startAdornment: <InputAdornment position="start">৳</InputAdornment>,
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
                            startAdornment: <InputAdornment position="start">৳</InputAdornment>,
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
              </Button>            </DialogActions>
          </Dialog>
        </Paper>
      )}
        {tabValue === 1 && (
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
            📦 Pending Orders
          </Typography>
            {/* Search field for pending orders */}
          <Paper 
            elevation={0}
            className="glassmorphism"
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <TextField
              fullWidth
              placeholder="🔍 Search pending orders by ID, customer name, email, or game title..."
              variant="outlined"
              size="small"
              value={pendingSearchTerm}
              onChange={handlePendingSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#667eea',
                  }
                }
              }}            />
          </Paper>

          {orderError && <Alert severity="error" sx={{ mb: 2 }} className="high-contrast-text">{orderError}</Alert>}
          
          {orderLoading ? (
            <CircularProgress />
          ) : filteredPendingOrders.length === 0 ? (
            pendingSearchTerm ? (
              <Alert severity="info" className="high-contrast-text">No pending orders match your search criteria</Alert>
            ) : (
              <Alert severity="info" className="high-contrast-text">No pending orders found</Alert>
            )
          ) : (            <List>
              {filteredPendingOrders.map((order) => (
                <Paper 
                  key={order._id} 
                  elevation={0}
                  className="glassmorphism"
                  sx={{ 
                    mb: 3, 
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                    }
                  }}
                >
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          Order #{order._id.substring(0, 8)} - {order.user.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Email: {order.user.email}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Ordered on: {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Paid on: {new Date(order.paidAt).toLocaleString()}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Total: ৳{order.totalPrice.toFixed(2)}
                          </Typography>
                        </>
                      }
                    />
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Order Items:</Typography>
                    <List dense sx={{ width: '100%' }}>
                      {order.orderItems.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={item.game?.title || 'Unknown Game (Data Missing)'}
                            secondary={`Quantity: ${item.quantity} x ${item.price.toFixed(2)}/=`}
                          />
                        </ListItem>
                      ))}
                    </List>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 3 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => approveOrder(order._id)}
                        disabled={orderLoading}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '1rem',
                          background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #4caf50, #388e3c)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
                          }
                        }}
                      >
                        {orderLoading ? <CircularProgress size={24} color="inherit" /> : '✅ Approve Order'}
                      </Button>
                    </Box>
                  </ListItem>
                </Paper>
              ))}            </List>
          )}
        </Paper>
      )}
        {tabValue === 2 && (
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>
            ✅ Processed Orders
          </Typography>
            {/* Search field for processed orders */}
          <Paper 
            elevation={0}
            className="glassmorphism"
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <TextField
              fullWidth
              placeholder="🔍 Search processed orders by ID, customer name, email, status, or game title..."
              variant="outlined"
              size="small"
              value={completedSearchTerm}
              onChange={handleCompletedSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#667eea',
                  }
                }
              }}
            />          </Paper>

          {orderError && <Alert severity="error" sx={{ mb: 2 }} className="high-contrast-text">{orderError}</Alert>}
          
          {orderLoading ? (
            <CircularProgress />
          ) : filteredCompletedOrders.length === 0 ? (
            completedSearchTerm ? (
              <Alert severity="info" className="high-contrast-text">No processed orders match your search criteria</Alert>
            ) : (
              <Alert severity="info" className="high-contrast-text">No processed orders found</Alert>
            )
          ) : (            <List>
              {filteredCompletedOrders.map((order) => (
                <Paper 
                  key={order._id} 
                  elevation={0}
                  className="glassmorphism"
                  sx={{ 
                    mb: 3, 
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                    }
                  }}
                >
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          Order #{order._id.substring(0, 8)} - {order.user.name}
                        </Typography>
                      }
                      secondary={
                        <>                          <Typography component="span" variant="body2" color="text.primary">
                            Status: <Chip label={order.status} color={
                              order.status === 'completed' ? 'primary' :
                              order.status === 'shipped' ? 'secondary' :
                              order.status === 'delivered' ? 'success' : 'default'
                            } size="small" />
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Email: {order.user.email}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.primary">
                            Ordered on: {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                          <br />
                          {order.approvedAt && (
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                Approved on: {new Date(order.approvedAt).toLocaleString()}
                              </Typography>
                              <br />
                            </>
                          )}
                          <Typography component="span" variant="body2" color="text.primary">
                            Total: ৳{order.totalPrice.toFixed(2)}
                          </Typography>
                        </>
                      }
                    />
                      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Order Items:</Typography>
                    <List dense sx={{ width: '100%' }}>
                      {order.orderItems.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={item.game?.title || 'Unknown Game (Data Missing)'}
                            secondary={`Quantity: ${item.quantity} x ${item.price.toFixed(2)}/=`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </ListItem>
                </Paper>
              ))}            </List>
          )}
        </Paper>
      )}      {tabValue === 3 && (
        <Paper
          elevation={0}
          className="glassmorphism"
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              📝 Blog Management
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenAddBlog(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              ➕ Add New Blog
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
          )}          <Grid container spacing={3}>
            {blogs.map((blog) => (
              <Grid item xs={12} key={blog._id}>
                <Paper 
                  elevation={0}
                  className="glassmorphism"
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                    }
                  }}
                >
                  <Box>
                    <Typography variant="h6">{blog.title}</Typography>
                    <Typography color="text.secondary">{blog.blogType}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {blog.status} | Views: {blog.views} | Likes: {blog.likes.length}
                    </Typography>
                    {blog.tags && blog.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {blog.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Box>
                    )}
                  </Box>                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={() => handleEditBlog(blog)}
                      startIcon={<Edit />}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#667eea',
                        color: '#667eea',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                          borderColor: '#5a6fd8',
                          backgroundColor: 'rgba(102, 126, 234, 0.08)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      Edit Blog
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleRemoveBlog(blog._id)}
                      startIcon={<Delete />}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#ff4757',
                        color: '#ff4757',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                          borderColor: '#ff3742',
                          backgroundColor: 'rgba(255, 71, 87, 0.08)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      Remove Blog
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>            {/* Add Blog Dialog */}
          <Dialog open={openAddBlog} onClose={() => setOpenAddBlog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add New Blog</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={newBlog.title}
                onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                helperText={`${newBlog.title.length}/200 characters`}
                error={newBlog.title.length > 200}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={newBlog.description}
                onChange={(e) => setNewBlog({...newBlog, description: e.target.value})}
                helperText={`${newBlog.description.length}/500 characters`}
                error={newBlog.description.length > 500}
              />
              <TextField
                margin="dense"
                label="Content"
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={newBlog.content}
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                helperText={`${newBlog.content.length} characters (minimum 100 required)`}
                error={newBlog.content.length > 0 && newBlog.content.length < 100}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Blog Type</InputLabel>
                <Select
                  value={newBlog.blogType}
                  onChange={(e) => setNewBlog({...newBlog, blogType: e.target.value})}
                >
                  {availableBlogTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={newBlog.status}
                  onChange={(e) => setNewBlog({...newBlog, status: e.target.value})}
                >
                  {availableBlogStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Frontpage Image (Required)</Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleBlogImageUpload(e, true)}
                />
                {newBlog.frontpageImage && (
                  <Box sx={{ mt: 1 }}>
                    <img src={newBlog.frontpageImage} alt="Frontpage" style={{ height: 100 }} />
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
                  onChange={(e) => handleBlogImageUpload(e, false)}
                  disabled={newBlog.images.length >= 10}
                />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {newBlog.images.map((img, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt={`Blog ${index + 1}`} style={{ height: 100 }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveBlogImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <TextField
                margin="dense"
                label="Tags (comma-separated)"
                fullWidth
                variant="outlined"
                value={newBlog.tags.join(', ')}
                onChange={(e) => setNewBlog({...newBlog, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
              />
              
              <TextField
                margin="dense"
                label="Read Time (minutes)"
                type="number"
                fullWidth
                variant="outlined"
                value={newBlog.readTime}
                onChange={(e) => setNewBlog({...newBlog, readTime: parseInt(e.target.value) || 5})}
              />
              
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={newBlog.featured}
                    onChange={(e) => setNewBlog({...newBlog, featured: e.target.checked})}
                    name="featured"
                  />
                  <Typography>Featured Blog</Typography>
                </Box>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddBlog(false)}>Cancel</Button>
              <Button 
                onClick={handleAddBlog} 
                variant="contained" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Blog'}
              </Button>
            </DialogActions>
          </Dialog>            {/* Edit Blog Dialog */}
          <Dialog open={openEditBlog} onClose={() => setOpenEditBlog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Blog</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={newBlog.title}
                onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                helperText={`${newBlog.title.length}/200 characters`}
                error={newBlog.title.length > 200}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={newBlog.description}
                onChange={(e) => setNewBlog({...newBlog, description: e.target.value})}
                helperText={`${newBlog.description.length}/500 characters`}
                error={newBlog.description.length > 500}
              />
              <TextField
                margin="dense"
                label="Content"
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                value={newBlog.content}
                onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                helperText={`${newBlog.content.length} characters (minimum 100 required)`}
                error={newBlog.content.length > 0 && newBlog.content.length < 100}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Blog Type</InputLabel>
                <Select
                  value={newBlog.blogType}
                  onChange={(e) => setNewBlog({...newBlog, blogType: e.target.value})}
                >
                  {availableBlogTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  value={newBlog.status}
                  onChange={(e) => setNewBlog({...newBlog, status: e.target.value})}
                >
                  {availableBlogStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Frontpage Image (Required)</Typography>
                <input
                  accept="image/*"
                  type="file"
                  onChange={(e) => handleBlogImageUpload(e, true)}
                />
                {newBlog.frontpageImage && (
                  <Box sx={{ mt: 1 }}>
                    <img src={newBlog.frontpageImage} alt="Frontpage" style={{ height: 100 }} />
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
                  onChange={(e) => handleBlogImageUpload(e, false)}
                  disabled={newBlog.images.length >= 10}
                />
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {newBlog.images.map((img, index) => (
                    <Grid item key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={img} alt={`Blog ${index + 1}`} style={{ height: 100 }} />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 0, right: 0 }}
                          onClick={() => handleRemoveBlogImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <TextField
                margin="dense"
                label="Tags (comma-separated)"
                fullWidth
                variant="outlined"
                value={newBlog.tags.join(', ')}
                onChange={(e) => setNewBlog({...newBlog, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
              />
              
              <TextField
                margin="dense"
                label="Read Time (minutes)"
                type="number"
                fullWidth
                variant="outlined"
                value={newBlog.readTime}
                onChange={(e) => setNewBlog({...newBlog, readTime: parseInt(e.target.value) || 5})}
              />
              
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={newBlog.featured}
                    onChange={(e) => setNewBlog({...newBlog, featured: e.target.checked})}
                    name="featured"
                  />
                  <Typography>Featured Blog</Typography>
                </Box>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditBlog(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateBlog} 
                variant="contained" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Blog'}
              </Button>            </DialogActions>
          </Dialog>
        </Paper>
      )}
      </Container>
    </Box>
  );
}
