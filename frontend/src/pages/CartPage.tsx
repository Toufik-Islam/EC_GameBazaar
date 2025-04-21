import { useState, useEffect } from 'react';
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
  CardMedia,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateCartItem, removeCartItem, clearCart, loading } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handlePayment = async () => {
    setProcessing(true);
    // Implement actual payment processing here
    setTimeout(() => {
      setProcessing(false);
      setNotification({
        type: 'success',
        message: 'Payment successful!'
      });
    }, 2000);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update item quantity'
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      setNotification({
        type: 'success',
        message: 'Item removed from cart'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to remove item from cart'
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setNotification({
        type: 'success',
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to clear cart'
      });
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'cse15') {
      setPromoApplied(true);
      setPromoDiscount(20);
      setNotification({
        type: 'success',
        message: 'Promo code applied: 20% discount!'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Invalid promo code'
      });
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Calculate totals
  const subtotal = cart.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;
  const tax = (subtotal - discountAmount) * 0.07; // 7% tax
  const total = subtotal - discountAmount + tax;

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your cart
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/login"
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {notification && (
          <Alert onClose={closeNotification} severity={notification.type}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : cart.items.length > 0 ? (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              {cart.items.map((item) => (
                <Box key={item._id}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sm={2}>
                      <CardMedia
                        component="img"
                        image={item.game.images[0] || 'https://via.placeholder.com/300x200?text=Game+Image'}
                        alt={item.game.title}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={9} sm={4}>
                      <Typography variant="subtitle1" component={Link} to={`/game/${item.game._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.game.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Digital Download
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          disabled={loading}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          type="number"
                          InputProps={{ inputProps: { min: 1, max: 99 } }}
                          onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value) || 1)}
                          sx={{ width: '60px', mx: 1 }}
                          disabled={loading}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          disabled={loading}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                      {item.game.discountPrice ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${item.game.price.toFixed(2)}
                          </Typography>
                          <Typography variant="subtitle1" color="error.main">
                            ${item.game.discountPrice.toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="subtitle1">
                          ${item.game.price.toFixed(2)}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={loading}
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
                  onClick={handleClearCart}
                  disabled={loading}
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