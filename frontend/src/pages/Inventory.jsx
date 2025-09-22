import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Chip,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning,
  TrendingUp,
  TrendingDown,
  Search,
  Refresh,
  Add,
  Edit,
  Visibility,
  Store,
  Category,
  ShoppingCart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Inventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Use the new inventory overview endpoint for better performance
      const response = await api.get('/api/inventory/overview');
      const { products, categories, lowStockProducts } = response.data;
      
      setProducts(products || []);
      setCategories(categories || []);
      setLowStockProducts(lowStockProducts || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      
      // Fallback to individual API calls if the new endpoint fails
      try {
        const [productsRes, categoriesRes, lowStockRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/categories'),
          api.get('/api/products/low-stock?threshold=10')
        ]);
        
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setLowStockProducts(lowStockRes.data || []);
      } catch (fallbackError) {
        console.error('Fallback API calls also failed:', fallbackError);
        
        // Set error state
        setError(error.response?.data?.message || error.message || 'Failed to fetch inventory data');
        
        // Set empty arrays to prevent crashes
        setProducts([]);
        setCategories([]);
        setLowStockProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely convert price to number
  const safePrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to safely convert stock to number
  const safeStock = (stock) => {
    const num = parseInt(stock);
    return isNaN(num) ? 0 : num;
  };

  const getInventoryStats = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + safeStock(p.stock), 0);
    const lowStock = products.filter(p => safeStock(p.stock) <= 10).length;
    const outOfStock = products.filter(p => safeStock(p.stock) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (safePrice(p.price) * safeStock(p.stock)), 0);
    
    return { totalProducts, totalStock, lowStock, outOfStock, totalValue };
  };

  const getCategoryStats = () => {
    return categories.map(cat => {
      const categoryProducts = products.filter(p => p.category_id === cat.category_id);
      const totalStock = categoryProducts.reduce((sum, p) => sum + safeStock(p.stock), 0);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (safePrice(p.price) * safeStock(p.stock)), 0);
      
      return {
        ...cat,
        productCount: categoryProducts.length,
        totalStock,
        totalValue
      };
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }).slice(0, 10); // Show top 10 for overview

  const stats = getInventoryStats();
  const categoryStats = getCategoryStats();

  const getStockStatus = (stock) => {
    const safeStockValue = safeStock(stock);
    if (safeStockValue === 0) return { label: 'Out of Stock', color: 'error' };
    if (safeStockValue <= 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Inventory Overview</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Inventory Overview</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Inventory Data</Typography>
          <Typography variant="body2">{error}</Typography>
          <Button 
            variant="outlined" 
            onClick={fetchInventoryData} 
            sx={{ mt: 1 }}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // Show message if no data but no error
  const hasNoData = !loading && !error && products.length === 0 && categories.length === 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Inventory Management
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate('/products')}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchInventoryData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* No Data Message */}
      {hasNoData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6">No Inventory Data Found</Typography>
          <Typography variant="body2">
            It looks like there are no products or categories in the system yet. 
            Try adding some products and categories first.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')} 
              sx={{ mr: 1 }}
            >
              Add Products
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/categories')}
            >
              Add Categories
            </Button>
          </Box>
        </Alert>
      )}

      {/* Alerts */}
      {stats.outOfStock > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>{stats.outOfStock}</strong> products are out of stock! 
          <Button size="small" onClick={() => navigate('/low-stock')} sx={{ ml: 1 }}>
            View Details
          </Button>
        </Alert>
      )}
      
      {stats.lowStock > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{stats.lowStock}</strong> products have low stock levels.
          <Button size="small" onClick={() => navigate('/low-stock')} sx={{ ml: 1 }}>
            View Details
          </Button>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
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
                  <InventoryIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {stats.totalProducts}
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
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {stats.totalStock.toLocaleString()}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Total Stock Units
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
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {stats.lowStock}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Low Stock Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9C27B015 0%, #BA68C810 100%)',
            border: '1px solid #9C27B020',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px #9C27B030' }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'secondary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCart />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">
                    ${stats.totalValue.toLocaleString()}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    Total Inventory Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Category Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Categories Overview
                </Typography>
                <Button size="small" onClick={() => navigate('/categories')}>
                  Manage Categories
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {categoryStats.map((cat) => (
                <Box key={cat.category_id} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="subtitle2">{cat.name}</Typography>
                    </Box>
                    <Chip label={`${cat.productCount} items`} size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {cat.totalStock.toLocaleString()} units
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Value: ${cat.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Product Overview
                </Typography>
                <Button size="small" onClick={() => navigate('/products')}>
                  View All Products
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {/* Quick Filters */}
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  size="small"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <TableRow key={product.product_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.category_name || 'No Category'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {safeStock(product.stock)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ${safePrice(product.price).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={stockStatus.label}
                              color={stockStatus.color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/products')}
              >
                Add New Product
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Category />}
                onClick={() => navigate('/categories')}
              >
                Manage Categories
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Warning />}
                onClick={() => navigate('/low-stock')}
              >
                View Low Stock
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Inventory;
