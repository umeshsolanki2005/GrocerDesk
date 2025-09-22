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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  Warning,
  Refresh,
  TrendingUp,
  TrendingDown,
  Settings as SettingsIcon
} from '@mui/icons-material';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockOperation, setStockOperation] = useState({ type: 'add', amount: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        stock: '',
        category_id: ''
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.product_id}`, productData);
        showSnackbar('Product updated successfully');
      } else {
        await api.post('/api/products', productData);
        showSnackbar('Product created successfully');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showSnackbar(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${productId}`);
        showSnackbar('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showSnackbar(error.response?.data?.message || 'Error deleting product', 'error');
      }
    }
  };

  const handleStockAdjustment = (product) => {
    setSelectedProduct(product);
    setStockOperation({ type: 'add', amount: '' });
    setStockDialogOpen(true);
  };

  const handleStockSubmit = async () => {
    if (!stockOperation.amount || !selectedProduct) return;
    
    try {
      await api.put(`/api/products/${selectedProduct.product_id}/stock`, {
        stock: parseInt(stockOperation.amount),
        operation: stockOperation.type
      });
      showSnackbar(`Stock ${stockOperation.type === 'add' ? 'added' : stockOperation.type === 'subtract' ? 'removed' : 'updated'} successfully`);
      setStockDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      showSnackbar(error.response?.data?.message || 'Error updating stock', 'error');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error' };
    if (stock <= 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F315 0%, #64B5F610 100%)',
            border: '1px solid #2196F320',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px #2196F330' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Inventory />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {products.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF980015 0%, #FFB74D10 100%)',
            border: '1px solid #FF980020',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px #FF980030' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'warning.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Warning />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {products.filter(p => p.stock <= 10).length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #F4433615 0%, #EF535010 100%)',
            border: '1px solid #F4433620',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px #F4433630' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'error.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Inventory />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {products.filter(p => p.stock === 0).length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF5015 0%, #81C78410 100%)',
            border: '1px solid #4CAF5020',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px #4CAF5030' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'success.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Inventory />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {categories.length}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Categories
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
                placeholder="Search products..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchProducts}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <TableRow key={product.product_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category_name || 'No Category'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="medium">
                        ${product.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {product.stock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Adjust Stock">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleStockAdjustment(product)}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(product.product_id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">No Category</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.category_id} value={category.category_id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adjust Stock - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Current Stock: {selectedProduct?.stock} units
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Operation</InputLabel>
              <Select
                value={stockOperation.type}
                onChange={(e) => setStockOperation({ ...stockOperation, type: e.target.value })}
                label="Operation"
              >
                <MenuItem value="add">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUp color="success" />
                    Add Stock
                  </Box>
                </MenuItem>
                <MenuItem value="subtract">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingDown color="error" />
                    Remove Stock
                  </Box>
                </MenuItem>
                <MenuItem value="set">
                  <Box display="flex" alignItems="center" gap={1}>
                    <SettingsIcon color="primary" />
                    Set Stock
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={stockOperation.amount}
              onChange={(e) => setStockOperation({ ...stockOperation, amount: e.target.value })}
              margin="normal"
              required
              helperText={
                stockOperation.type === 'add' 
                  ? `New stock will be: ${(selectedProduct?.stock || 0) + parseInt(stockOperation.amount || 0)}`
                  : stockOperation.type === 'subtract'
                  ? `New stock will be: ${Math.max(0, (selectedProduct?.stock || 0) - parseInt(stockOperation.amount || 0))}`
                  : stockOperation.type === 'set'
                  ? `Stock will be set to: ${stockOperation.amount || 0}`
                  : ''
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStockSubmit} 
            variant="contained"
            disabled={!stockOperation.amount}
          >
            Update Stock
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

export default Products;
