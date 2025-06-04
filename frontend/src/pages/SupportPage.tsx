
import React, { useState } from 'react';
import { Container, Typography, Paper, Grid, Box, Button, TextField, MenuItem, Alert, Snackbar } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    category: '',
    subject: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const supportCategories = [
    { value: '', label: 'Select an issue category' },
    { value: 'order', label: 'Order Issues' },
    { value: 'payment', label: 'Payment Problems' },
    { value: 'account', label: 'Account Management' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'product', label: 'Product Information' },
    { value: 'return', label: 'Returns & Refunds' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.description) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/support/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          open: true,
          message: 'Support ticket submitted successfully! We will respond within 24 hours.',
          severity: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          orderNumber: '',
          category: '',
          subject: '',
          description: ''
        });
      } else {
        setNotification({
          open: true,
          message: data.error || 'Failed to submit support ticket. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setNotification({
        open: true,
        message: 'Network error. Please check your connection and try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        <SupportAgentIcon fontSize="large" sx={{ verticalAlign: 'middle', mr: 2 }} />
        Customer Support
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        We're here to help! Choose from the options below to get assistance with your issue.
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <EmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom align="center">
              Email Support
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Send us an email and we'll respond within 24 hours.
            </Typography>
            <Typography variant="body1" color="primary" fontWeight="bold" align="center">
              support@gamebazaar.com
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ChatIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom align="center">
              Live Chat
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Chat with our support agents in real-time.
            </Typography>
            <Button variant="contained" color="primary">
              Start Chat
            </Button>
            <Typography variant="caption" align="center" sx={{ mt: 1 }}>
              Upcoming 24/7
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom align="center">
              Phone Support
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 2 }}>
              Call us for immediate assistance.
            </Typography>
            <Typography variant="body1" color="primary" fontWeight="bold" align="center">
              +880 123 456 789
            </Typography>
            <Typography variant="caption" align="center" sx={{ mt: 1 }}>
              Everyday: 24 hour
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Submit a Support Ticket
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Number (if applicable)"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Issue Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                {supportCategories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description of Issue"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide as much detail as possible about your issue"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                startIcon={<SendIcon />}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          className="high-contrast-text"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
