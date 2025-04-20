
import React from 'react';
import { Container, Typography, Paper, Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function ReturnsRefundsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Returns & Refunds Policy
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <AssignmentReturnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Return Policy
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          We want you to be completely satisfied with your purchase. If you're not happy with your order, we accept returns within 30 days of delivery for physical products in their original, unopened packaging.
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>Requirements for Returns:</Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Item must be in its original, unopened packaging" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Return request must be made within 30 days of delivery" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Proof of purchase (order number or receipt) is required" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Return shipping costs are the responsibility of the customer, unless the item is defective" />
            </ListItem>
          </List>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <CreditScoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Refund Policy
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          Once we receive and inspect your return, we will process your refund. The refund will be credited to your original payment method within 5-10 business days, depending on your payment provider's policies.
        </Typography>
        
        <Typography variant="body1" paragraph>
          For digital products, we offer refunds within 14 days of purchase if the game code has not been revealed or used. Technical issues with games should be directed to the game publisher's support team first.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <DoNotDisturbAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Non-Returnable Items
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          The following items cannot be returned:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <DoNotDisturbAltIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Digital game codes that have been revealed or redeemed" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DoNotDisturbAltIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Physical games with broken seals or opened packaging" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DoNotDisturbAltIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Gaming accessories that have been used or have damaged packaging" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DoNotDisturbAltIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Special order or personalized items" />
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Return Process
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          To initiate a return, please follow these steps:
        </Typography>
        
        <List sx={{ listStyleType: 'decimal', pl: 4 }}>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Log in to your account and go to Order History" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Select the order containing the item you wish to return" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Click on 'Return Item' and follow the instructions" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Print the return shipping label (if applicable)" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Package the item securely in its original packaging" />
          </ListItem>
          <ListItem sx={{ display: 'list-item' }}>
            <ListItemText primary="Ship the package to the address provided" />
          </ListItem>
        </List>
        
        <Typography variant="body1" sx={{ mt: 2 }}>
          If you have any questions about our returns process, please contact our customer support team.
        </Typography>
      </Paper>
    </Container>
  );
}
