import { Box, Container, Grid, Link, Typography } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: 6,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #fff 30%, #f0f0f0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🎮 Game Bazaar
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                lineHeight: 1.7,
                opacity: 0.9
              }}
            >
              Your premium destination for the latest and greatest games. Discover, play, and conquer new worlds with our curated collection.
            </Typography>
            <Box sx={{ 
              display: 'flex',
              gap: 2,
              '& > a': { 
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                p: 1.5,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-3px) scale(1.1)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                }
              } 
            }}>
              <Link href="#" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Facebook />
              </Link>
              <Link href="#" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Twitter />
              </Link>
              <Link href="#" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Instagram />
              </Link>
              <Link href="#" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <YouTube />
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  background: 'linear-gradient(90deg, #fff, transparent)',
                  borderRadius: 2,
                }
              }}
            >
              🎯 Popular Categories
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              '& > a': { 
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: -100,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover': {
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(8px)',
                  '&::before': {
                    left: '100%',
                  }
                }
              } 
            }}>
              <Link component={RouterLink} to="/?category=action">⚔️ Action Games</Link>
              <Link component={RouterLink} to="/?category=strategy">🧠 Strategy Games</Link>
              <Link component={RouterLink} to="/?category=sports">⚽ Sports Games</Link>
              <Link component={RouterLink} to="/?category=racing">🏎️ Racing Games</Link>
              <Link component={RouterLink} to="/?category=fps">🎯 FPS Games</Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  background: 'linear-gradient(90deg, #fff, transparent)',
                  borderRadius: 2,
                }
              }}
            >
              🛟 Customer Service
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
              '& > a': { 
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: -100,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover': {
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(8px)',
                  '&::before': {
                    left: '100%',
                  }
                }
              } 
            }}>
              <Link component={RouterLink} to="/contact">📧 Contact Us</Link>
              <Link component={RouterLink} to="/faq">❓ FAQ</Link>
              <Link component={RouterLink} to="/shipping">🚚 Shipping Info</Link>
              <Link component={RouterLink} to="/returns">↩️ Returns & Refunds</Link>
              <Link component={RouterLink} to="/privacy">🔒 Privacy Policy</Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 3,
                  background: 'linear-gradient(90deg, #fff, transparent)',
                  borderRadius: 2,
                }
              }}
            >
              ⚡ Quick Links
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
              '& > a': { 
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: -100,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover': {
                  color: '#fff',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(8px)',
                  '&::before': {
                    left: '100%',
                  }
                }
              } 
            }}>
              <Link component={RouterLink} to="/cart">🛒 Shopping Cart</Link>
              <Link component={RouterLink} to="/support">💬 Support</Link>
              <Link component={RouterLink} to="/help-center">🆘 Help Center</Link>
              <Link component={RouterLink} to="/blog">📝 Blog</Link>
            </Box>
          </Grid>
        </Grid>

        <Box 
          sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.6) 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            © {new Date().getFullYear()} GameBazaar. All rights reserved. <br/> Contribution: Toufik, Saiful & Tushar
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
