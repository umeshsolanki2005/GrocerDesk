import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Chip,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  Receipt,
  Visibility,
  Delete,
  Refresh,
  AttachMoney,
  ShoppingCart,
  Person,
  CalendarToday,
  FileDownload,
  TrendingUp
} from '@mui/icons-material';
import api from '../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsOpen, setSaleDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [analytics, setAnalytics] = useState(null);

  // Helper function to safely convert to number
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const fetchSales = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (dateFilter) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - parseInt(dateFilter));
        params.append('start_date', startDate.toISOString().split('T')[0]);
        params.append('end_date', today.toISOString().split('T')[0]);
      }

      const response = await api.get(`/api/sales?${params}`);
      setSales(response.data.sales || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch sales data');
      setSales([]);
      showSnackbar('Error fetching sales', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchAnalytics();
  }, [dateFilter]);

  const fetchAnalytics = async () => {
    try {
      const period = dateFilter || '30';
      const response = await api.get(`/api/sales/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewSale = async (saleId) => {
    try {
      const response = await api.get(`/api/sales/${saleId}`);
      setSelectedSale(response.data);
      setSaleDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      showSnackbar('Error fetching sale details', 'error');
    }
  };

  const handleRefundSale = async (saleId) => {
    if (window.confirm('Are you sure you want to refund this sale? This action cannot be undone.')) {
      try {
        await api.delete(`/api/sales/${saleId}`);
        showSnackbar('Sale refunded successfully');
        fetchSales(pagination.page);
        setSaleDetailsOpen(false);
      } catch (error) {
        console.error('Error refunding sale:', error);
        showSnackbar(error.response?.data?.message || 'Error refunding sale', 'error');
      }
    }
  };

  const exportSales = () => {
    const csvContent = [
      ['Sale ID', 'Customer', 'Items', 'Total', 'Date'],
      ...filteredSales.map(sale => [
        sale.sale_id,
        sale.customer_name || 'Walk-in Customer',
        sale.item_count,
        sale.total,
        new Date(sale.sale_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSales = sales.filter(sale =>
    (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    sale.sale_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(safeNumber(amount));
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Sales History</Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading sales data...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Sales History</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Sales Data</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>{error}</Typography>
          <Typography variant="caption" color="text.secondary">
            Check the browser console and server logs for more details.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => fetchSales(pagination.page)} 
              sx={{ mr: 1 }}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
            <Button 
              variant="text" 
              onClick={() => {
                setError(null);
                setSales([]);
              }}
            >
              Clear Error
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Sales History
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={exportSales}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchSales(pagination.page)}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Receipt color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {analytics?.summary?.total_sales || pagination.total}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Sales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoney color="success" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(analytics?.summary?.total_revenue || sales.reduce((total, sale) => total + safeNumber(sale.total), 0))}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShoppingCart color="info" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {sales.reduce((total, sale) => total + safeNumber(sale.item_count), 0)}
                  </Typography>
                  <Typography color="textSecondary">
                    Items Sold
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="warning" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {analytics?.summary?.avg_sale_amount ? formatCurrency(analytics.summary.avg_sale_amount) : '$0.00'}
                  </Typography>
                  <Typography color="textSecondary">
                    Avg Sale Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="1">Last 24 Hours</MenuItem>
                  <MenuItem value="7">Last 7 Days</MenuItem>
                  <MenuItem value="30">Last 30 Days</MenuItem>
                  <MenuItem value="90">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* No Data Message */}
      {sales.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">No Sales Data Found</Typography>
          <Typography variant="body2">
            There are no sales records yet. Sales will appear here once transactions are made through the POS system.
          </Typography>
        </Alert>
      )}

      {/* Sales Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sale ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.length > 0 ? filteredSales.map((sale) => (
                <TableRow key={sale.sale_id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      #{sale.sale_id ? sale.sale_id.slice(-8) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        {sale.customer_name || 'Walk-in Customer'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={sale.item_count} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      {formatCurrency(sale.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewSale(sale.sale_id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refund">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRefundSale(sale.sale_id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No sales found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              disabled={pagination.page === 1}
              onClick={() => fetchSales(pagination.page - 1)}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ alignSelf: 'center', px: 2 }}>
              Page {pagination.page} of {pagination.pages}
            </Typography>
            <Button
              variant="outlined"
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchSales(pagination.page + 1)}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Sale Details Dialog */}
      <Dialog open={saleDetailsOpen} onClose={() => setSaleDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Sale Details - #{selectedSale?.sale?.sale_id ? selectedSale.sale.sale_id.slice(-8) : 'N/A'}
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box>
              {/* Sale Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.sale.customer_name || 'Walk-in Customer'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sale Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedSale.sale.sale_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Items
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.items.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {formatCurrency(selectedSale.sale.total)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Items List */}
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <List>
                {selectedSale.items.map((item, index) => (
                  <ListItem key={item.sale_item_id} divider={index < selectedSale.items.length - 1}>
                    <ListItemText
                      primary={item.product_name}
                      secondary={`Quantity: ${item.quantity} × ${formatCurrency(item.price)}`}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      {formatCurrency(item.subtotal)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaleDetailsOpen(false)}>Close</Button>
          <Button 
            color="error" 
            onClick={() => selectedSale && handleRefundSale(selectedSale.sale.sale_id)}
          >
            Refund Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Sales;
