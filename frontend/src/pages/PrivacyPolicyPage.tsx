
import React from 'react';
import { Container, Typography, Paper, Box, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Privacy Policy
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Introduction
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          Game Bazaar ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website, services, and applications (collectively, the "Services").
        </Typography>
        
        <Typography variant="body1" paragraph>
          By using our Services, you agree to the collection, use, and sharing of your information as described in this Privacy Policy. If you do not agree with our policies and practices, do not use our Services.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Information We Collect
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Information You Provide to Us
        </Typography>
        <Typography variant="body1" paragraph>
          We collect information you provide directly to us, such as when you create an account, fill out a form, make a purchase, communicate with us, or otherwise use our Services. This information may include your name, email address, postal address, phone number, payment information, and any other information you choose to provide.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Information We Collect Automatically
        </Typography>
        <Typography variant="body1" paragraph>
          When you use our Services, we automatically collect certain information about your device and how you interact with our Services. This information includes:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li">
            <Typography variant="body1">
              Device information (such as your IP address, browser type, operating system)
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Usage information (such as pages visited, time spent on pages, links clicked)
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Location information (such as general location derived from IP address)
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Information collected through cookies and similar technologies
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          How We Use Your Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          We use the information we collect for various purposes, including to:
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li">
            <Typography variant="body1">
              Provide, maintain, and improve our Services
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Process transactions and send related information
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Send you technical notices, updates, security alerts, and support messages
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Respond to your comments, questions, and customer service requests
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Communicate with you about products, services, offers, and events
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Monitor and analyze trends, usage, and activities in connection with our Services
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Detect, investigate, and prevent fraudulent transactions and other illegal activities
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          How We Share Your Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          We may share your information in the following circumstances:
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <Box component="li">
            <Typography variant="body1">
              With vendors, service providers, and consultants that perform services for us
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              In response to a request for information if we believe disclosure is in accordance with any applicable law, regulation, or legal process
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of us or others
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              With your consent or at your direction
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Choices
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" paragraph>
          You have certain choices about how we use your information:
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Account Information
        </Typography>
        <Typography variant="body1" paragraph>
          You can update your account information at any time by logging into your account. You may also request that we delete your account by contacting us.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Cookies
        </Typography>
        <Typography variant="body1" paragraph>
          Most web browsers are set to accept cookies by default. If you prefer, you can usually set your browser to remove or reject cookies. Please note that removing or rejecting cookies could affect the availability and functionality of our Services.
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Promotional Communications
        </Typography>
        <Typography variant="body1" paragraph>
          You can opt out of receiving promotional emails from us by following the instructions in those emails. If you opt out, we may still send you non-promotional emails, such as those about your account or our ongoing business relations.
        </Typography>
      </Paper>
    </Container>
  );
}
