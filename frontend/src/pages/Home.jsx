import React from 'react';
import { Container, Typography } from '@mui/material';
import Footer from '../components/Footer';

export default function Home(){
  return (
    <>
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>Welcome to GrocerDesk</Typography>
        <Typography variant="body1">This is your staff dashboard. Features coming soon…</Typography>
      </Container>
      <Footer />
    </>
  );
}
