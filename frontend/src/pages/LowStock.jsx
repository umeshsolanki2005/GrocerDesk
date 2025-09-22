import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { Warning, Search, Refresh } from '@mui/icons-material';
import api from '../services/api';

const LowStock = () => {
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/products/low-stock?threshold=${threshold}`);
      setItems(res.data || []);
    } catch (e) {
      console.error('Low stock fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Low Stock</Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLowStock} disabled={loading}>Refresh</Button>
      </Box>

      <Card>
        <CardContent>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><Search /></InputAdornment>
              )}}
              fullWidth
            />
            <TextField
              label="Threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value || '0'))}
              onBlur={fetchLowStock}
              sx={{ width: 160 }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.product_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Warning color="warning" />
                        <Typography>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{p.category_name || '-'}</TableCell>
                    <TableCell>${Number(p.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={p.stock === 0 ? 'error' : 'warning'} label={p.stock} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">No low-stock products</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LowStock;
