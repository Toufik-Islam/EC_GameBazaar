
import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking on the 'Register' link in the top navigation bar. Fill in the required information and submit the form. You'll receive a confirmation email to verify your account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For certain regions, we also offer mobile payment options."
    },
    {
      question: "Are digital game codes region-locked?",
      answer: "Yes, most digital game codes are region-specific. Please check the product description for information about regional restrictions before making a purchase."
    },
    {
      question: "How do I redeem a digital game code?",
      answer: "After purchasing a digital game, you'll receive the code in your email and in your account's order history. Follow the redemption instructions for the specific platform (Steam, PlayStation, Xbox, etc.) to activate your game."
    },
    {
      question: "Can I get a refund for a digital game?",
      answer: "Digital game purchases can be refunded within 14 days of purchase if the game code has not been revealed or used. Please see our Returns & Refunds policy for more details."
    },
    {
      question: "Do you offer pre-orders for upcoming games?",
      answer: "Yes, we offer pre-orders for many upcoming titles. Pre-ordered games will be delivered on or before the official release date."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and visiting the Order History section. For physical shipments, a tracking number will be provided once your order has been dispatched."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Frequently Asked Questions
      </Typography>
      <Box sx={{ my: 4 }}>
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Still have questions?
        </Typography>
        <Typography variant="body1">
          Contact our support team for further assistance.
        </Typography>
      </Box>
    </Container>
  );
}
