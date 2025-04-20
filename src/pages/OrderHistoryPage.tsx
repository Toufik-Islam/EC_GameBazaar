
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
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
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Search,
  FileDownload,
  FilterList,
  GetApp
} from '@mui/icons-material';

// Mock order data
const MOCK_ORDERS = [
  {
    id: "ORD-2023-1001",
    date: "2023-06-15",
    status: "Completed",
    total: 84.98,
    paymentMethod: "Credit Card (**** 4321)",
    items: [
      {
        id: 1,
        title: "Cyber Adventure 2077",
        price: 49.99,
        image: "https://via.placeholder.com/50x50?text=CA"
      },
      {
        id: 5,
        title: "Racing Evolution",
        price: 34.99,
        image: "https://via.placeholder.com/50x50?text=RE"
      }
    ]
  },
  {
    id: "ORD-2023-0842",
    date: "2023-05-20",
    status: "Completed",
    total: 19.99,
    paymentMethod: "PayPal (user@example.com)",
    items: [
      {
        id: 6,
        title: "Puzzle Master",
        price: 19.99,
        image: "https://via.placeholder.com/50x50?text=PM"
      }
    ]
  },
  {
    id: "ORD-2023-0715",
    date: "2023-04-10",
    status: "Completed",
    total: 39.99,
    paymentMethod: "Credit Card (**** 8765)",
    items: [
      {
        id: 2,
        title: "Fantasy Quest III",
        price: 39.99,
        image: "https://via.placeholder.com/50x50?text=FQ"
      }
    ]
  }
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | false>(false);

  const handleAccordionChange = (orderId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedOrder(isExpanded ? orderId : false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Processing':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
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
      
      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <Accordion 
            key={order.id} 
            expanded={expandedOrder === order.id}
            onChange={handleAccordionChange(order.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle1">
                    {order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.date}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status) as "success" | "info" | "error" | "default"} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle1">
                    ${order.total.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
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
                    <Typography variant="body1">{order.date}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Order Status</Typography>
                    <Typography variant="body1">{order.status}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Payment Method</Typography>
                    <Typography variant="body1">{order.paymentMethod}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2">Total Amount</Typography>
                    <Typography variant="body1">${order.total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
                
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                component="img"
                                src={item.image}
                                alt={item.title}
                                sx={{ width: 40, height: 40, mr: 2, borderRadius: 1 }}
                              />
                              <Typography variant="body1">
                                <Link to={`/game/${item.id}`} style={{ color: 'inherit' }}>
                                  {item.title}
                                </Link>
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<GetApp />}
                              component={Link}
                              to={`/game/${item.id}`}
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
