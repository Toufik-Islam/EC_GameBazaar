import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Search,
  FileDownload,
  FilterList,
  GetApp,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Define TypeScript interfaces for our data
interface OrderItem {
  game: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    discountPrice?: number;
  };
  quantity: number;
  price: number;
}

interface ApprovedBy {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  isPaid: boolean;
  paidAt?: string;
  approvedAt?: string;
  approvedBy?: ApprovedBy;
  totalPrice: number;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    email_address?: string;
  };
  orderItems: OrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, token } = useAuth();

  // Fetch user's orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) {
        setError("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch your orders');
        }

        if (data.success) {
          console.log('Fetched orders:', data.data);
          setOrders(data.data);
        } else {
          setError(data.message || 'Something went wrong');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const handleAccordionChange = (orderId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedOrder(isExpanded ? orderId : false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderItems.some(item => item.game.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format payment method for display
  const formatPaymentMethod = (method: string, result?: any) => {
    switch (method) {
      case 'creditCard':
        return `Credit Card ${result?.id ? `(${result.id})` : ''}`;
      case 'paypal':
        return `PayPal ${result?.email_address ? `(${result.email_address})` : ''}`;
      case 'bkash':
        return `bKash ${result?.id ? `(${result.id})` : ''}`;
      case 'nagad':
        return `Nagad ${result?.id ? `(${result.id})` : ''}`;
      default:
        return method;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order History
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Button startIcon={<FilterList />} sx={{ mr: 1 }}>
              Filter
            </Button>
            <Button startIcon={<FileDownload />}>
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <Accordion 
            key={order._id} 
            expanded={expandedOrder === order._id}
            onChange={handleAccordionChange(order._id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle1">
                    {order._id.substring(0, 10)}...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                    color={getStatusColor(order.status) as "success" | "info" | "warning" | "error" | "default"} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1">
                    ৳{order.totalPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Order Date</Typography>
                    <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Order Status</Typography>
                    <Typography variant="body1">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      {order.status === 'completed' && order.approvedBy && (
                        <Tooltip title={`Approved by ${order.approvedBy.name} (${order.approvedBy.email})`}>
                          <AdminPanelSettings 
                            fontSize="small" 
                            color="primary" 
                            sx={{ ml: 1, verticalAlign: 'middle' }} 
                          />
                        </Tooltip>
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Payment Method</Typography>
                    <Typography variant="body1">{formatPaymentMethod(order.paymentMethod, order.paymentResult)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Total Amount</Typography>
                    <Typography variant="body1">৳{order.totalPrice.toFixed(2)}</Typography>
                  </Grid>
                  
                  {order.approvedBy && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5, 
                        mt: 1, 
                        bgcolor: 'success.light', 
                        borderRadius: 1,
                        color: 'white'
                      }}>
                        <AdminPanelSettings sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Approved by {order.approvedBy.name} ({order.approvedBy.email})
                          {order.approvedAt && ` on ${formatDate(order.approvedAt)}`}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
                
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
                
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                component="img"
                                src={item.game.images[0] || 'https://via.placeholder.com/40x40?text=Game'}
                                alt={item.game.title}
                                sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
                              />
                              <Typography variant="body1">
                                <Link to={`/game/${item.game._id}`} style={{ color: 'inherit' }}>
                                  {item.game.title}
                                </Link>
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>৳{item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<GetApp />}
                              component={Link}
                              to={`/game/${item.game._id}`}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm ? 'No orders match your search criteria' : 'You haven\'t placed any orders yet'}
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
          >
            Browse Games
          </Button>
        </Paper>
      )}
    </Container>
  );
}
