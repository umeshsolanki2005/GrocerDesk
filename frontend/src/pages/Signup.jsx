import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../services/api';

export default function Signup(){
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = ['admin','manager','cashier'];

  const change = (k) => (e) => setForm({...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('staff', JSON.stringify(res.data.staff));
      setSuccess('Account created. Redirecting…');
      setLoading(false);
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }} elevation={4}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Logo sx={{ fontSize: 36 }} />
          <Typography variant="h5">Create Staff Account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" fullWidth required value={form.name} onChange={change('name')} sx={{ mb: 2 }} />
          <TextField label="Email" type="email" fullWidth required value={form.email} onChange={change('email')} sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth required value={form.password} onChange={change('password')} sx={{ mb: 2 }} />
          <TextField select label="Role" fullWidth value={form.role} onChange={change('role')} sx={{ mb: 3 }}>
            {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <Button variant="contained" fullWidth type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
        </form>
      </Paper>
    </Container>
  );
}
