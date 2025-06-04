
import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  TextField,
  Button,
  InputAdornment,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Storefront as StorefrontIcon,
  CreditCard as CreditCardIcon,
  Computer as ComputerIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function HelpCenterPage() {
  // Popular articles data
  const popularArticles = [
    { title: "How to redeem game codes", category: "Purchases" },
    { title: "Troubleshooting payment issues", category: "Payments" },
    { title: "Resetting your password", category: "Account" },
    { title: "System requirements for PC games", category: "Technical" },
    { title: "Pre-order cancellation policy", category: "Orders" }
  ];

  // Help categories
  const helpCategories = [
    { 
      title: "Account & Profile", 
      icon: <AccountCircleIcon />, 
      topics: ["Account creation", "Password reset", "Profile settings", "Account security"]
    },
    { 
      title: "Orders & Purchases", 
      icon: <ShoppingCartIcon />, 
      topics: ["Order status", "Order history", "Pre-orders", "Digital downloads"]
    },
    { 
      title: "Products & Games", 
      icon: <StorefrontIcon />, 
      topics: ["Game information", "System requirements", "Game activation", "DLC content"]
    },
    { 
      title: "Payment & Billing", 
      icon: <CreditCardIcon />, 
      topics: ["Payment methods", "Billing issues", "Refunds", "Gift cards"]
    },
    { 
      title: "Technical Support", 
      icon: <ComputerIcon />, 
      topics: ["Download issues", "Installation help", "Game performance", "Compatibility"]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Help Center
      </Typography>

      {/* Search Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundImage: 'linear-gradient(135deg, #5c2d91 0%, #7e57c2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          How can we help you today?
        </Typography>
        <Box sx={{ display: 'flex', maxWidth: 600, mx: 'auto', mt: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for help articles..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'gray' }} />
                </InputAdornment>
              ),
              sx: { bgcolor: 'white', borderRadius: 1 }
            }}
          />
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            sx={{ ml: 1 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Popular Articles Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Popular Articles
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {popularArticles.map((article, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {article.category}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {article.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Help Categories Section */}
      <Typography variant="h5" gutterBottom>
        Browse Help Categories
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {helpCategories.map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  mr: 2, 
                  bgcolor: 'primary.light', 
                  color: 'white', 
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex'
                }}>
                  {category.icon}
                </Box>
                <Typography variant="h6">{category.title}</Typography>
              </Box>
              
              <List dense>
                {category.topics.map((topic, topicIndex) => (                  <ListItem component={Link} to="#" key={topicIndex}>
                    <ListItemButton>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <HelpIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={topic} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Contact Support Section */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Can't find what you're looking for?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Our support team is ready to assist you with any questions or issues you may have.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          component={Link} 
          to="/support"
        >
          Contact Support
        </Button>
      </Paper>
    </Container>
  );
}
