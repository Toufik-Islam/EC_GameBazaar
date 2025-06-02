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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag, Download, CheckCircle } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// Import jsPDF and jspdf-autotable correctly
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Add explicit type augmentation for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

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
  // Add state for the success dialog
  const [paymentSuccessDialog, setPaymentSuccessDialog] = useState(false);
  // Add state for the order ID
  const [orderId, setOrderId] = useState('');
  
  // Add state for shipping address
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
    mobile: ''
  });

  // Generate a random order ID
  const generateOrderId = () => {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${randomNum}`;
  };

  // Helper function to convert frontend payment method to backend format
  const convertPaymentMethodForBackend = (frontendMethod: string): string => {
    switch (frontendMethod) {
      case 'card':
        return 'creditCard';
      case 'paypal':
        return 'paypal';
      case 'bkash':
        return 'bkash';
      case 'nagad':
        return 'nagad';
      default:
        return 'creditCard';
    }
  };
  const handlePayment = async () => {
    // Check if card number has been entered
    if (!cardNumber.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter a card number'
      });
      return;
    }

    // Validate shipping address fields
    if (!shippingAddress.street.trim() || !shippingAddress.city.trim() || 
        !shippingAddress.state.trim() || !shippingAddress.zipCode.trim() || 
        !shippingAddress.mobile.trim()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all shipping address fields including mobile number'
      });
      return;
    }

    // Validate mobile number format (basic validation)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(shippingAddress.mobile)) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid mobile number (10-15 digits)'
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Create the order data with actual shipping address
      const orderData = {
        shippingAddress,
        paymentMethod: convertPaymentMethodForBackend(paymentMethod),
        taxPrice: tax,
        shippingPrice: 0,
        totalPrice: total
      };

      console.log('Creating order with data:', orderData);

      // Call the backend API to create the order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();
      console.log('Order creation response:', orderResult);

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      // Store the order ID from the backend
      const newOrderId = orderResult.data._id;
      setOrderId(newOrderId);

      // Update the order payment status
      const paymentData = {
        paymentMethod: convertPaymentMethodForBackend(paymentMethod),
        paymentResult: {
          id: Date.now().toString(),
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: user?.id || 'customer@gamebazaar.com'
        }
      };

      console.log('Updating payment for order:', newOrderId, 'with payment method:', paymentData.paymentMethod);

      // Call the payment update endpoint
      const paymentResponse = await fetch(`/api/orders/${newOrderId}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(paymentData)
      });

      const paymentResult = await paymentResponse.json();
      console.log('Payment update response:', paymentResult);

      if (!paymentResponse.ok) {
        throw new Error(paymentResult.message || 'Failed to process payment');
      }

      // Generate and download the receipt
      generatePDF(newOrderId);
      
      // Clear the cart after successful order and payment
      await clearCart();
      
      setProcessing(false);
      // Show success dialog
      setPaymentSuccessDialog(true);
      setNotification({
        type: 'success',
        message: 'Payment successful! Your order has been placed and receipt downloaded.'
      });
      
    } catch (error) {
      console.error("Error during payment process:", error);
      setProcessing(false);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'There was an issue processing your payment.'
      });
    }
  };

  // Generate and download PDF receipt
  const generatePDF = (orderId: string) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Set date format
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = currentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Add GameBazaar logo
      const logoUrl = '/logo.webp';
      // We need to add the logo as an image
      const img = new Image();
      img.src = logoUrl;
      
      // When the image loads, draw it on the PDF
      img.onload = function() {
        // Convert the logo to base64 using a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        
        // Add logo to PDF
        doc.addImage(logoData, 'PNG', 20, 10, 25, 25);
        
        // Add header text next to logo
        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204);
        doc.text('Game Bazaar', 50, 25);
        
        // Add receipt details
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Official Receipt', 105, 40, { align: 'center' });
        
        // Add separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);
        
        // Add date and order information
        doc.setFontSize(10);
        doc.text(`Date: ${formattedDate} ${formattedTime}`, 20, 55);
        doc.text(`Order ID: ${orderId}`, 20, 60);
          // Customer information section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information', 20, 70);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${user?.username || 'Guest User'}`, 20, 75);
        doc.text(`Email: ${user?.email || 'customer@gamebazaar.com'}`, 20, 80);
        
        // Add shipping address information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Shipping Address', 20, 90);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${shippingAddress.street}`, 20, 95);
        doc.text(`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`, 20, 100);
        doc.text(`${shippingAddress.country}`, 20, 105);
        doc.text(`Mobile: ${shippingAddress.mobile}`, 20, 110);
        
        // Add payment information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details', 20, 125);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, 130);        
        // Display the appropriate identifier based on payment method
        if (paymentMethod === 'card') {
          // Mask the card number for security
          const maskedNumber = 'xxxx-xxxx-xxxx-' + (cardNumber.slice(-4) || '0000');
          doc.text(`Card Number: ${maskedNumber}`, 20, 135);
        } else if (paymentMethod === 'paypal') {
          doc.text(`PayPal: ${cardNumber || 'N/A'}`, 20, 135);
        } else if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
          doc.text(`${paymentMethod.toUpperCase()} Number: ${cardNumber || 'N/A'}`, 20, 135);
        }
        
        doc.text(`Payment Date: ${formattedDate}`, 20, 140);
        
        // Order summary section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Summary', 20, 150);
        doc.setFont('helvetica', 'normal');
        
        // Create a table body with cart items
        let tableBody = [];
        
        if (cart.items && cart.items.length > 0) {
          tableBody = cart.items.map(item => {
            // Calculate item price correctly
            const itemPrice = item.game.discountPrice || item.game.price;
            const itemTotal = itemPrice * item.quantity;
            
            return [
              item.game.title,
              item.quantity.toString(),
              `${itemPrice.toFixed(2)}/=`,
              `${itemTotal.toFixed(2)}/=`
            ];
          });
        } else {
          tableBody = [["No items in cart", "", "", ""]]; // Fallback if cart is empty
        }
          // Use autoTable directly - using the imported function
        autoTable(doc, {
          head: [["Item", "Quantity", "Unit Price", "Total"]],
          body: tableBody,
          startY: 155,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 80 }, // Item name column wider
            1: { halign: 'center' }, // Quantity centered
            2: { halign: 'center' }, // Price right-aligned
            3: { halign: 'center' }  // Total right-aligned
          },
          footStyles: { fillColor: [240, 240, 240] }
        });
        if (doc.lastAutoTable?.finalY) {
          // Calculate final Y position
          let finalY = 160; // Default position if we can't get lastAutoTable
          if (doc.lastAutoTable) {
            finalY = doc.lastAutoTable.finalY + 10;
          }
          
          // Add price summary
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(130, finalY, 190, finalY);
          
          finalY += 5;
          doc.text('Price Summary:', 130, finalY);
          finalY += 5;
          
          doc.text(`Subtotal:`, 130, finalY);
          doc.text(`${subtotal.toFixed(2)}/=`, 180, finalY, { align: 'right' });
          finalY += 5;
          
          if (promoApplied) {
            doc.text(`Discount (${promoDiscount}%):`, 130, finalY);
            doc.text(`-${discountAmount.toFixed(2)}/=`, 180, finalY, { align: 'right' });
            finalY += 5;
          }
          
          doc.text(`Tax (2%):`, 130, finalY);
          doc.text(`${tax.toFixed(2)}/=`, 180, finalY, { align: 'right' });
          finalY += 5;
          
          doc.setLineWidth(0.5);
          doc.line(130, finalY, 190, finalY);
          finalY += 5;
          
          doc.setFont('helvetica', 'bold');
          doc.text(`Total:`, 130, finalY);
          doc.text(`${total.toFixed(2)}/=`, 180, finalY, { align: 'right' });
          finalY += 15;
          
          // Add payment status
          doc.setFillColor(0, 170, 0);
          doc.roundedRect(130, finalY - 10, 60, 15, 3, 3, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text('PAYMENT COMPLETED', 160, finalY, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          finalY += 15;
          
          // Add ordered items summary
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`Items Purchased: ${cart.items.length}`, 20, finalY);
          finalY += 8;
          
          // Add footer
          finalY = Math.max(finalY, 230); // Ensure footer doesn't overlap with content
          
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(0.5);
          doc.line(20, finalY, 190, finalY);
          finalY += 10;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text('Thank you for shopping with Game Bazaar!', 105, finalY, { align: 'center' });
          finalY += 5;
          doc.text('For any questions or concerns, please contact support@gamebazaar.com', 105, finalY, { align: 'center' });
          finalY += 5;
          doc.text(`© ${new Date().getFullYear()} Game Bazaar - All Rights Reserved`, 105, finalY, { align: 'center' });
          
          // Save the PDF
          doc.save(`GameBazaar-Receipt-${orderId}.pdf`);
          
          setNotification({
            type: 'success',
            message: 'Receipt downloaded successfully!'
          });
        }
      };
      
      img.onerror = function() {
        // If logo fails to load, continue without it
        console.error('Failed to load logo, generating receipt without it');
        
        // Add header text without logo
        doc.setFontSize(22);
        doc.setTextColor(0, 102, 204);
        doc.text('Game Bazaar', 105, 20, { align: 'center' });
        
        // Continue with the rest of the PDF generation
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Official Receipt', 105, 30, { align: 'center' });
        
        // Add separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        // Add date and order information
        doc.setFontSize(10);
        doc.text(`Date: ${formattedDate} ${formattedTime}`, 20, 45);
        doc.text(`Order ID: ${orderId}`, 20, 50);
          // Customer information section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information', 20, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${user?.username || 'Guest User'}`, 20, 65);
        doc.text(`Email: ${user?.email || 'customer@gamebazaar.com'}`, 20, 70);
        
        // Add shipping address information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Shipping Address', 20, 80);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${shippingAddress.street}`, 20, 85);
        doc.text(`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}`, 20, 90);
        doc.text(`${shippingAddress.country}`, 20, 95);
        doc.text(`Mobile: ${shippingAddress.mobile}`, 20, 100);
        
        // Add payment information
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Details', 20, 110);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, 115);        
        // Display the appropriate identifier based on payment method
        if (paymentMethod === 'card') {
          // Mask the card number for security
          const maskedNumber = 'xxxx-xxxx-xxxx-' + (cardNumber.slice(-4) || '0000');
          doc.text(`Card Number: ${maskedNumber}`, 20, 120);
        } else if (paymentMethod === 'paypal') {
          doc.text(`PayPal: ${cardNumber || 'N/A'}`, 20, 120);
        } else if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
          doc.text(`${paymentMethod.toUpperCase()} Number: ${cardNumber || 'N/A'}`, 20, 120);
        }
        
        doc.text(`Payment Date: ${formattedDate}`, 20, 125);
        
        // Order summary section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Summary', 20, 135);
        doc.setFont('helvetica', 'normal');
        
        // Create a table body with cart items
        let tableBody = [];
        
        if (cart.items && cart.items.length > 0) {
          tableBody = cart.items.map(item => {
            // Calculate item price correctly
            const itemPrice = item.game.discountPrice || item.game.price;
            const itemTotal = itemPrice * item.quantity;
            
            return [
              item.game.title,
              item.quantity.toString(),
              `${itemPrice.toFixed(2)}/=`,
              `${itemTotal.toFixed(2)}/=`
            ];
          });
        } else {
          tableBody = [["No items in cart", "", "", ""]]; // Fallback if cart is empty
        }
          // Use autoTable directly - using the imported function
        autoTable(doc, {
          head: [["Item", "Quantity", "Unit Price", "Total"]],
          body: tableBody,
          startY: 140,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 80 }, // Item name column wider
            1: { halign: 'center' }, // Quantity centered
            2: { halign: 'center' }, // Price right-aligned
            3: { halign: 'center' }  // Total right-aligned
          },
          footStyles: { fillColor: [240, 240, 240] }
        });
        
        // Calculate final Y position
        let finalY = 180; // Default position if we can't get lastAutoTable
        if (doc.lastAutoTable) {
          finalY = doc.lastAutoTable.finalY + 10;
        }
        
        // Add price summary
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(130, finalY, 190, finalY);
        
        finalY += 5;
        doc.text('Price Summary:', 130, finalY);
        finalY += 5;
        
        doc.text(`Subtotal:`, 130, finalY);
        doc.text(`৳${subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
        finalY += 5;
        
        if (promoApplied) {
          doc.text(`Discount (${promoDiscount}%):`, 130, finalY);
          doc.text(`-৳${discountAmount.toFixed(2)}`, 180, finalY, { align: 'right' });
          finalY += 5;
        }
        
        doc.text(`Tax (7%):`, 130, finalY);
        doc.text(`৳${tax.toFixed(2)}`, 180, finalY, { align: 'right' });
        finalY += 5;
        
        doc.setLineWidth(0.5);
        doc.line(130, finalY, 190, finalY);
        finalY += 5;
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Total:`, 130, finalY);
        doc.text(`৳${total.toFixed(2)}`, 180, finalY, { align: 'right' });
        finalY += 15;
        
        // Add payment status
        doc.setFillColor(0, 170, 0);
        doc.roundedRect(130, finalY - 10, 60, 15, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('PAYMENT COMPLETED', 160, finalY, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        finalY += 15;
        
        // Add ordered items summary
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Items Purchased: ${cart.items.length}`, 20, finalY);
        finalY += 8;
        
        // Add footer
        finalY = Math.max(finalY, 230); // Ensure footer doesn't overlap with content
        
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(20, finalY, 190, finalY);
        finalY += 10;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for shopping with Game Bazaar!', 105, finalY, { align: 'center' });
        finalY += 5;
        doc.text('For any questions or concerns, please contact support@gamebazaar.com', 105, finalY, { align: 'center' });
        finalY += 5;
        doc.text(`© ${new Date().getFullYear()} Game Bazaar - All Rights Reserved`, 105, finalY, { align: 'center' });
        
        // Save the PDF
        doc.save(`GameBazaar-Receipt-${orderId}.pdf`);
        
        setNotification({
          type: 'success',
          message: 'Receipt downloaded successfully!'
        });
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({
        type: 'error',
        message: 'Failed to generate receipt. Please try again.'
      });
    }
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
  // Calculate totals with null checks
  const subtotal = cart?.items?.reduce((total, item) => {
    if (!item || !item.game) return total;
    const itemPrice = item.game.discountPrice || item.game.price || 0;
    return total + (itemPrice * (item.quantity || 0));
  }, 0) || 0;

  const discountAmount = promoApplied ? (subtotal * promoDiscount / 100) : 0;
  const tax = (subtotal - discountAmount) * 0.02; // 2% tax
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
    <Container maxWidth="lg">      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={notification?.type || 'info'}>
          {notification?.message || ''}
        </Alert>
      </Snackbar>      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        Shopping Cart
      </Typography>

      <Box sx={{ mt: 4 }}>
        {/* Shipping Address Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Shipping Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email from your registered account"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address *"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Enter your full street address"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter your city"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Division *"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Enter your state or division"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code *"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="Enter your postal code"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter your country"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number *"
                value={shippingAddress.mobile}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter your mobile number for delivery contact"
                type="tel"
                required
                helperText="Required for delivery contact (10-15 digits)"
              />
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6">Payment Method</Typography>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
          <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
          <FormControlLabel value="bkash" control={<Radio />} label="bKash" />
          <FormControlLabel value="nagad" control={<Radio />} label="Nagad" />
        </RadioGroup>

        {/* Payment Form Fields - Show appropriate field based on payment method */}
        <Box sx={{ mt: 2 }}>
          {paymentMethod === 'card' && (
            <TextField
              fullWidth
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter any card number"
              type="number" 
            />
          )}
          
          {paymentMethod === 'paypal' && (
            <TextField
              fullWidth
              label="PayPal Email or Phone"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter any PayPal email or phone"
            />
          )}
          
          {paymentMethod === 'bkash' && (
            <TextField
              fullWidth
              label="bKash Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter any bKash number"
              type="number"
            />
          )}
          
          {paymentMethod === 'nagad' && (
            <TextField
              fullWidth
              label="Nagad Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter any Nagad number"
              type="number"
            />
          )}
          
          <Button 
            variant="contained" 
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>      ) : cart?.items && cart.items.length > 0 ? (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>              {cart.items.filter(item => item && item.game).map((item) => {                
                return (
                <Box key={item._id}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3} sm={2}>
                      <CardMedia
                        component="img"
                        image={(item.game.images && item.game.images[0]) || 'https://via.placeholder.com/300x200?text=Game+Image'}
                        alt={item.game.title || 'Game Image'}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={9} sm={4}>
                      <Typography variant="subtitle1" component={Link} to={`/game/${item.game._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {item.game.title || 'Unknown Game'}
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
                    </Grid>                    <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                      {item.game.discountPrice ? (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ৳{(item.game.price || 0).toFixed(2)}
                          </Typography>
                          <Typography variant="subtitle1" color="error.main">
                            ৳{(item.game.discountPrice || 0).toFixed(2)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="subtitle1">
                          ৳{(item.game.price || 0).toFixed(2)}
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
                );
              })}

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
                  <Typography variant="body1">৳{subtotal.toFixed(2)}</Typography>
                </ListItem>

                {promoApplied && (
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={`Discount (${promoDiscount}%)`} />
                    <Typography variant="body1" color="error.main">
                      -৳{discountAmount.toFixed(2)}
                    </Typography>
                  </ListItem>
                )}

                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax (2%)" />
                  <Typography variant="body1">৳{tax.toFixed(2)}</Typography>
                </ListItem>

                <Divider />

                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="h6">৳{total.toFixed(2)}</Typography>
                </ListItem>
              </List>              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Complete Order'}
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

      {/* Payment Success Dialog */}
      <Dialog
        open={paymentSuccessDialog}
        onClose={() => setPaymentSuccessDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            Payment Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Your payment has been processed successfully. Your order ID is <strong>{orderId}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can download your receipt by clicking the button below.
          </Typography>
        </DialogContent>
        <DialogActions>          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => generatePDF(orderId)}
          >
            Download Receipt
          </Button>
          <Button
            variant="outlined"
            onClick={() => setPaymentSuccessDialog(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}