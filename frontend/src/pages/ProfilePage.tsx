import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Container, 
  Grid, 
  Avatar, 
  Button, 
  Tabs, 
  Tab, 
  TextField, 
  Divider,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Person, 
  Edit, 
  Save, 
  Visibility, 
  VisibilityOff, 
  AccountCircle, 
  Email, 
  Phone, 
  LocationOn,
  Security,
  CalendarToday,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  memberSince?: string;
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // User data state
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    avatar: 'https://placehold.co/150x150?text=User',
    memberSince: 'January 2023'
  });

  // Fetch user data from backend
  useEffect(() => {
    if (user && token) {
      fetchUserData();
    }
  }, [user, token]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user?.id || '' // Add user ID in header for development mode
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Split the name into first and last name
        const nameParts = data.data.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setUserData({
          firstName,
          lastName,
          email: data.data.email,
          phone: data.data.phone || '',
          address: data.data.address || '',
          avatar: data.data.avatar || 'https://placehold.co/150x150?text=User',
          memberSince: new Date(data.data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          })
        });
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to fetch user data'
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      // Reset password fields when entering edit mode
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id || '' // Add user ID in header for development mode
        },
        body: JSON.stringify({
          name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          address: userData.address
          // Email is not included as it should be unchangeable
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        setEditing(false);
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to update profile'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setNotification({
        type: 'error',
        message: 'Error connecting to server'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !token) return;
    
    // Validate passwords
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': user.id || '' // Add user ID in header for development mode
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: 'Password changed successfully!'
        });
        // Reset password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Notification */}
        {notification !== null && (
          <Snackbar 
            open={true} 
            autoHideDuration={6000} 
            onClose={closeNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={closeNotification} severity={notification.type} className="high-contrast-text">
              {notification.message}
            </Alert>
          </Snackbar>
        )}

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Fade in timeout={600}>
              <Paper
                elevation={0}
                className="glassmorphism-enhanced"
                sx={{
                  p: 4,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 3
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={userData.avatar}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      backgroundColor: '#4caf50',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }}>
                      ✓
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>                  <Typography 
                    variant="h3" 
                    gutterBottom 
                    className="high-contrast-text"
                    sx={{ 
                      fontWeight: 700,
                      color: '#2c3e50', // Dark color for better contrast
                    }}
                  >
                    {userData.firstName} {userData.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1, mb: 2 }}>
                    <CalendarToday sx={{ fontSize: 20, color: '#5a6c7d' }} />
                    <Typography variant="body1" className="high-contrast-text" sx={{ color: '#5a6c7d' }}>
                      Member since {userData.memberSince}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<AccountCircle />}
                    label="Premium Member"
                    sx={{
                      background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Button
                  variant={editing ? "outlined" : "contained"}
                  startIcon={editing ? <Save /> : <Edit />}
                  onClick={editing ? handleSave : handleEditToggle}
                  disabled={loading}
                  size="large"
                  sx={{
                    background: editing ? 'transparent' : 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: editing ? '#667eea' : 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    border: editing ? '2px solid #667eea' : 'none',
                    '&:hover': {
                      background: editing ? 'rgba(102, 126, 234, 0.1)' : 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : (editing ? "Save Changes" : "Edit Profile")}
                </Button>
              </Paper>
            </Fade>
          </Grid>

          {/* Profile Tabs */}
          <Grid item xs={12}>
            <Fade in timeout={800}>
              <Paper
                elevation={0}
                className="glassmorphism-enhanced"
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden'
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2,
                      px: 3,
                      color: '#5a6c7d',
                      '&.Mui-selected': {
                        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                        color: '#667eea'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      height: 3,
                      borderRadius: '2px 2px 0 0'
                    }
                  }}
                >
                  <Tab icon={<Person />} label="Personal Information" iconPosition="start" />
                  <Tab icon={<Security />} label="Security" iconPosition="start" />
                  <Tab icon={<Settings />} label="Preferences" iconPosition="start" />
                </Tabs>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom className="high-contrast-text" sx={{ fontWeight: 600, mb: 3 }}>
                  Personal Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: editing ? 'rgba(255,255,255,0.15)' : 'transparent',
                          '&:hover': {
                            backgroundColor: editing ? 'rgba(255,255,255,0.25)' : 'transparent'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: editing ? 'rgba(255,255,255,0.15)' : 'transparent',
                          '&:hover': {
                            backgroundColor: editing ? 'rgba(255,255,255,0.25)' : 'transparent'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={userData.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Email cannot be changed"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'transparent',
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#5a6c7d',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: editing ? 'rgba(255,255,255,0.15)' : 'transparent',
                          '&:hover': {
                            backgroundColor: editing ? 'rgba(255,255,255,0.25)' : 'transparent'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      disabled={!editing || loading}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <LocationOn sx={{ color: '#667eea' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: editing ? 'rgba(255,255,255,0.15)' : 'transparent',
                          '&:hover': {
                            backgroundColor: editing ? 'rgba(255,255,255,0.25)' : 'transparent'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  {editing && (
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={loading}
                        size="large"
                        sx={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom className="high-contrast-text" sx={{ fontWeight: 600, mb: 3 }}>
                  Security Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showCurrentPassword ? 'text' : 'password'}
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showNewPassword ? 'text' : 'password'}
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.25)'
                          }
                        },
                        '& .MuiFormLabel-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                        },
                        '& .MuiInputBase-input': {
                          color: '#2c3e50',
                          fontWeight: 500,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePasswordChange}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a42a0)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      Update Password
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body1" paragraph>
                  Two-factor authentication adds an extra layer of security to your account.
                </Typography>                <Button
                  variant="outlined"
                  color="primary"
                >
                  Enable Two-Factor Authentication
                </Button>
              </Box>
            </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h5" gutterBottom className="high-contrast-text" sx={{ fontWeight: 600, mb: 3 }}>
                    Preferences
                  </Typography>
                  
                  <Typography variant="body1" className="high-contrast-text" sx={{ mb: 2 }}>
                    Customize your GameBazaar experience to match your preferences.
                  </Typography>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
                  
                  <Typography variant="body2" className="high-contrast-text" sx={{ fontStyle: 'italic' }}>
                    More preference options coming soon!
                  </Typography>
                </Box>
              </TabPanel>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
}
