
import React from 'react';
import { Typography, Box, Paper, Container, Grid, Avatar, Button, Tabs, Tab, TextField, Divider } from '@mui/material';
import { Person, Edit, Save } from '@mui/icons-material';

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

export default function ProfilePage() {
  const [tabValue, setTabValue] = React.useState(0);
  const [editing, setEditing] = React.useState(false);

  // Mock user data
  const [userData, setUserData] = React.useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    address: '123 Gaming Street, Gamer City, GC 12345',
    avatar: 'https://via.placeholder.com/150'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSave = () => {
    // This would call an API to update user data in a real app
    alert('Profile updated successfully! (This would save to the server in a real app)');
    setEditing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Avatar
              src={userData.avatar}
              sx={{ width: 100, height: 100, mr: { xs: 0, sm: 3 }, mb: { xs: 2, sm: 0 } }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Member since January 2023
              </Typography>
            </Box>
            <Button
              variant={editing ? "outlined" : "contained"}
              startIcon={editing ? <Save /> : <Edit />}
              onClick={editing ? handleSave : handleEditToggle}
            >
              {editing ? "Save Changes" : "Edit Profile"}
            </Button>
          </Paper>
        </Grid>

        {/* Profile Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Personal Information" />
              <Tab label="Security" />
              <Tab label="Preferences" />
            </Tabs>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </Grid>
                {editing && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Password Management
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    disabled={!editing}
                  />
                </Grid>
                {editing && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                    >
                      Update Password
                    </Button>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body1" paragraph>
                Two-factor authentication adds an extra layer of security to your account.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
              >
                Enable Two-Factor Authentication
              </Button>
            </TabPanel>

            {/* Preferences Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Email Notifications
              </Typography>
              <Typography variant="body1" paragraph>
                Manage what kind of emails you receive from Game Bazaar.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Marketing Emails</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive emails about sales, new games, and special offers.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Opt Out
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Order Confirmations</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive emails when you make a purchase or your order status changes.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      disabled
                    >
                      Required
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1">Account Updates</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive emails about your account activity and security.
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      disabled
                    >
                      Required
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
