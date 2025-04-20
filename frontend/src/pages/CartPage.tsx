import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Card,
  CardMedia,
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';

export default function CartPage() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Implement actual payment processing here
    setTimeout(() => {
      setProcessing(false);
      alert('Payment successful!');
    }, 2000);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'cse15') {
      setPromoApplied(true);
      setPromoDiscount(20);
      alert('Promo code applied: 20% discount!');
    } else {
      alert('Invalid promo code.');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);

  const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;
  const tax = (subtotal - discountAmount) * 0.07; // 7% tax
  const total = subtotal - discountAmount + tax;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Shopping Cart
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Payment Method</Typography>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
          <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
          <FormControlLabel value="bkash" control={<Radio />} label="bKash" />
          <FormControlLabel value="nagad" control={<Radio />} label="Nagad" />
        </RadioGroup>

        {paymentMethod === 'card' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </Box>
        )}
      </Box>

      {cartItems.length > 0 ? (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              {cartItems.map((item) => (
                <Box key={item.id}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sm={2}>
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.title}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={9} sm={4}>
                      <Typography variant="subtitle1" component={Link} to={`/game/${item.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Digital Download
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          type="number"
                          InputProps={{ inputProps: { min: 1, max: 99 } }}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          sx={{ width: '60px', mx: 1 }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                      {item.discountPrice ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${item.price.toFixed(2)}
                          </Typography>
                          <Typography variant="subtitle1" color="error.main">
                            ${item.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="subtitle1">
                          ${item.price.toFixed(2)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => removeItem(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  component={Link} 
                  to="/"
                  startIcon={<ShoppingBag />}
                >
                  Continue Shopping
                </Button>

                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => setCartItems([])}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>

            {/* Promo Code */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Promo Code
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  label="Enter Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  sx={{ mr: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={applyPromoCode}
                  disabled={promoApplied || !promoCode}
                >
                  Apply
                </Button>
              </Box>
              {promoApplied && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Promo code applied: {promoDiscount}% discount
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>

              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
                </ListItem>

                {promoApplied && (
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={`Discount (${promoDiscount}%)`} />
                    <Typography variant="body1" color="error.main">
                      -${discountAmount.toFixed(2)}
                    </Typography>
                  </ListItem>
                )}

                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax (7%)" />
                  <Typography variant="body1">${tax.toFixed(2)}</Typography>
                </ListItem>

                <Divider />

                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="h6">${total.toFixed(2)}</Typography>
                </ListItem>
              </List>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
              >
                Proceed to Checkout
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any games to your cart yet
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
            startIcon={<ShoppingBag />}
          >
            Start Shopping
          </Button>
        </Box>
      )}
    </Container>
  );
}

// Mock data for cart items
const MOCK_CART_ITEMS = [
  {
    id: 1,
    title: 'Cyber Adventure 2077',
    price: 59.99,
    discountPrice: 49.99,
    image: 'https://via.placeholder.com/300x200?text=Cyber+Adventure',
    quantity: 1
  },
  {
    id: 5,
    title: 'Racing Evolution',
    price: 49.99,
    discountPrice: 34.99,
    image: 'https://via.placeholder.com/300x200?text=Racing+Evolution',
    quantity: 1
  }
];