
import React from 'react';
import { Container, Typography, Paper, Grid, Box, Button, TextField, MenuItem } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';

export default function SupportPage() {
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
              Available 24/7
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
              +1-800-GAME-123
            </Typography>
            <Typography variant="caption" align="center" sx={{ mt: 1 }}>
              Monday-Friday: 9am-6pm EST
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Submit a Support Ticket
        </Typography>
        
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                autoComplete="name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Order Number (if applicable)"
                name="orderNumber"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Issue Category"
                defaultValue=""
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
                sx={{ mt: 2 }}
              >
                Submit Ticket
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
