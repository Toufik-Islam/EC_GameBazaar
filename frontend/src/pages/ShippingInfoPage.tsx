
import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';

export default function ShippingInfoPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Shipping Information
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Shipping Methods
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">Standard Shipping</Typography>
              <Typography variant="body1">
                Delivery within 5-7 business days. Available for all products to most locations.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cost: $4.99 or FREE for orders over $35
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">Express Shipping</Typography>
              <Typography variant="body1">
                Delivery within 2-3 business days. Available for most products to major cities.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cost: $9.99
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom color="primary">Next Day Delivery</Typography>
              <Typography variant="body1">
                Order by 2PM for delivery the next business day. Limited to select areas.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Cost: $14.99
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Processing Times
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          Orders are typically processed within 1-2 business days after payment confirmation. During high-volume periods (holidays, major game releases), processing might take up to 3 business days.
        </Typography>
        <Typography variant="body1">
          Digital products are usually available immediately after payment confirmation, except for pre-orders which will be available on the release date.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <PublicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          International Shipping
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          We ship to over 150 countries worldwide. International shipping typically takes 7-14 business days, depending on the destination country and local customs processing.
        </Typography>
        <Typography variant="body1" paragraph>
          Please note that additional customs fees, taxes, or duties may be charged by your country's customs authorities. These charges are the responsibility of the recipient.
        </Typography>
        <Typography variant="body1">
          For specific information about shipping to your country, please contact our customer support team.
        </Typography>
      </Paper>
    </Container>
  );
}
