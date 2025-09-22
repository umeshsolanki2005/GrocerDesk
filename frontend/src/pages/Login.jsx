import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }} elevation={4}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Logo sx={{ fontSize: 36 }} />
          <Typography variant="h5">GrocerDesk — Staff Login</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth required value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 3 }} />
          <Button variant="contained" fullWidth type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">Need an account? <Link component={RouterLink} to="/signup">Create staff</Link></Typography>
        </Box>
      </Paper>
    </Container>
  );
}
