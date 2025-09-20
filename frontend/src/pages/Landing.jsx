import React from 'react';
import { Box, Grid, Typography, Button, Container, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function Landing(){
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{
        flex: '1 0 auto',
        backgroundImage: 'url("unnamed.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        filter: blur('5px'),
        py: 10
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Logo sx={{ fontSize: 48, color: 'white' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>GrocerDesk</Typography>
                  <Typography variant="body2">Staff portal for managing grocery inventory and sales</Typography>
                </Box>
              </Box>

              <Typography variant="h3" gutterBottom fontWeight={700}>
                Make store ops simple, fast and reliable
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                GrocerDesk is a clean, staff-only interface to manage products, billing, and stock.
              </Typography>

              <Box display="flex" gap={2}>
                <Button variant="contained" size="large" component={RouterLink} to="/login" color="secondary">
                  Staff Login
                </Button>
                <Button variant="outlined" size="large" component={RouterLink} to="/signup" sx={{ color: "white", borderColor: "white" }}>
                  Create Staff
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Why GrocerDesk?</Typography>
          <Typography variant="body2">✔ Inventory Management</Typography>
          <Typography variant="body2">✔ Staff Roles & Permissions</Typography>
          <Typography variant="body2">✔ Sales Reports</Typography>
          <Typography variant="body2">✔ Secure Login</Typography>
        </Paper>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
