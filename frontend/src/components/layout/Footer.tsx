import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#5c2d91', color: 'white', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Game Bazaar
            </Typography>
            <Typography variant="body2">
              Your one-stop shop for the best games at the best prices.
            </Typography>
            <Box sx={{ mt: 2, '& > a': { mr: 2, color: 'white' } }}>
              <Link href="#" sx={{ display: 'inline-block', p: 1 }}>
                <Facebook />
              </Link>
              <Link href="#" sx={{ display: 'inline-block', p: 1 }}>
                <Twitter />
              </Link>
              <Link href="#" sx={{ display: 'inline-block', p: 1 }}>
                <Instagram />
              </Link>
              <Link href="#" sx={{ display: 'inline-block', p: 1 }}>
                <YouTube />
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Popular Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& > a': { color: 'white', mb: 1 } }}>
              <Link component={RouterLink} to="/?category=action" sx={{ display: 'inline-block', p: 0.5 }}>Action</Link>
              <Link component={RouterLink} to="/?category=strategy" sx={{ display: 'inline-block', p: 0.5 }}>Strategy</Link>
              <Link component={RouterLink} to="/?category=sports" sx={{ display: 'inline-block', p: 0.5 }}>Sports</Link>
              <Link component={RouterLink} to="/?category=racing" sx={{ display: 'inline-block', p: 0.5 }}>Racing</Link>
              <Link component={RouterLink} to="/?category=fps" sx={{ display: 'inline-block', p: 0.5 }}>FPS</Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& > a': { color: 'white', mb: 1 } }}>
              <Link component={RouterLink} to="/contact" sx={{ display: 'inline-block', p: 0.5 }}>Contact Us</Link>
              <Link component={RouterLink} to="/faq" sx={{ display: 'inline-block', p: 0.5 }}>FAQ</Link>
              <Link component={RouterLink} to="/shipping" sx={{ display: 'inline-block', p: 0.5 }}>Shipping Info</Link>
              <Link component={RouterLink} to="/returns" sx={{ display: 'inline-block', p: 0.5 }}>Returns & Refunds</Link>
              <Link component={RouterLink} to="/privacy" sx={{ display: 'inline-block', p: 0.5 }}>Privacy Policy</Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', '& > a': { color: 'white', mb: 1 } }}>
              <Link component={RouterLink} to="/cart" sx={{ display: 'inline-block', p: 0.5 }}>Shopping Cart</Link>
              <Link component={RouterLink} to="/support" sx={{ display: 'inline-block', p: 0.5 }}>Support</Link>
              <Link component={RouterLink} to="/help-center" sx={{ display: 'inline-block', p: 0.5 }}>Help Center</Link>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} Game Bazaar. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
