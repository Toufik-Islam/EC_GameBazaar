import React from 'react';
import { Container, Typography, Grid, Paper, Box, TextField, Button, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ContactPage() {
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
            
            <Box component="form" noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                  />
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
                    label="Message"
                    name="message"
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
                    Send Message
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
    </Container>
  );
}
