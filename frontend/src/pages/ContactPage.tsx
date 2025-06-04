import React, { useState } from 'react';
import { Container, Typography, Grid, Paper, Box, TextField, Button, Divider, Alert, Snackbar } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/support/contact`, {
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
          message: 'Your message has been sent successfully! We will get back to you soon.',
          severity: 'success'
        });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setNotification({
          open: true,
          message: data.error || 'Failed to send your message. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
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
        Contact Us
      </Typography>
      
      <Grid container spacing={4}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Send Us a Message
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid item xs={12}>
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
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your inquiry, feedback, or any questions you have"
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
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <LocationOnIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Our Location
                </Typography>
                <Typography variant="body1">
                  123 Game Street, Digital Plaza<br />
                  Sylhet, Bangladesh<br />
                  Postal Code: 3100
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <PhoneIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Phone Numbers
                </Typography>
                <Typography variant="body1">
                  Customer Support: +880 1234-567890<br />
                  Sales Inquiries: +880 1234-567891<br />
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <EmailIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Email Addresses
                </Typography>
                <Typography variant="body1">
                  General Inquiries: info@gamebazaar.com<br />
                  Customer Support: support@gamebazaar.com<br />
                  Business Partnerships: partners@gamebazaar.com
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <AccessTimeIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Business Hours
                </Typography>
                <Typography variant="body1">
                  Monday - Friday: 9:00 AM - 8:00 PM<br />
                  Saturday: 10:00 AM - 6:00 PM<br />
                  Sunday: 12:00 PM - 5:00 PM
                </Typography>
              </Box>
            </Box>
          </Paper>
          
          {/* Social Media */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Connect With Us
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1" paragraph>
              Follow us on social media for the latest updates, promotions, and gaming news.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
              <Button variant="outlined" color="primary">Facebook</Button>
              <Button variant="outlined" color="primary">Twitter</Button>
              <Button variant="outlined" color="primary">Instagram</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
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
