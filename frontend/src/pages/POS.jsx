import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  InputAdornment,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Fab
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Search,
  ShoppingCart,
  Receipt,
  Person,
  AttachMoney,
  Clear,
  Check
} from '@mui/icons-material';
import api from '../services/api';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/users');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showSnackbar('Not enough stock available', 'error');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock <= 0) {
        showSnackbar('Product is out of stock', 'error');
        return;
      }
      setCart([...cart, {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.product_id === productId);
    if (newQuantity > product.stock) {
      showSnackbar('Not enough stock available', 'error');
      return;
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer('');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showSnackbar('Cart is empty', 'error');
      return;
    }

    try {
      setLoading(true);
      const saleData = {
        user_id: selectedCustomer || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const res = await api.post('/api/sales', saleData);
      const { sale_id, total } = res.data || {};
      // Open receipt dialog with snapshot of this sale
      setReceiptData({
        sale_id,
        total,
        date: new Date().toLocaleString(),
        customer: customers.find(c => c.user_id === selectedCustomer) || null,
        items: cart.map(i => ({ ...i, subtotal: i.price * i.quantity }))
      });
      setReceiptOpen(true);
      showSnackbar('Sale completed successfully!');
      clearCart();
    } catch (error) {
      console.error('Error processing sale:', error);
      showSnackbar(error.response?.data?.message || 'Error processing sale', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_name && product.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          Point of Sale
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Clear Cart
          </Button>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Processing...' : 'Checkout'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Products Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Products
                </Typography>
                <TextField
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.product_id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          opacity: product.stock === 0 ? 0.6 : 1,
                          transition: 'all 0.3s ease',
                          border: `2px solid ${product.stock === 0 ? '#f44336' : product.stock <= 10 ? '#ff9800' : '#4caf50'}`,
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${product.stock === 0 ? '#f4433630' : product.stock <= 10 ? '#ff980030' : '#4caf5030'}`,
                            borderColor: product.stock === 0 ? '#f44336' : product.stock <= 10 ? '#ff9800' : '#4caf50'
                          }
                        }}
                        onClick={() => addToCart(product)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold" noWrap>
                              {product.name}
                            </Typography>
                            <Chip 
                              label={stockStatus.label}
                              color={stockStatus.color}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" mb={1}>
                            {product.category_name || 'No Category'}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ${product.price.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Stock: {product.stock}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cart Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: '2px solid #dee2e6'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCart />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  Cart ({cart.length})
                </Typography>
              </Box>

              {/* Customer Selection */}
              <Box mb={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Customer (Optional)</InputLabel>
                  <Select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    label="Customer (Optional)"
                  >
                    <MenuItem value="">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person />
                        Walk-in Customer
                      </Box>
                    </MenuItem>
                    {customers.map(customer => (
                      <MenuItem key={customer.user_id} value={customer.user_id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {customer.name.charAt(0)}
                          </Avatar>
                          {customer.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  onClick={() => setCustomerDialogOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Add New Customer
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Cart Items */}
              {cart.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Cart is empty
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <List dense>
                    {cart.map((item) => (
                      <ListItem key={item.product_id} divider>
                        <ListItemText
                          primary={item.name}
                          secondary={`$${item.price.toFixed(2)} each`}
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Remove />
                            </IconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Add />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  {/* Total */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ${getTotal().toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Receipt />}
                    onClick={handleCheckout}
                    disabled={loading}
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                      boxShadow: '0 4px 12px #4CAF5040',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px #4CAF5060',
                      },
                      '&:disabled': {
                        background: '#bdbdbd',
                        color: '#757575'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Complete Sale'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Customer Dialog */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            margin="normal"
            required
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            margin="normal"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={async () => {
              if (!newCustomer.name.trim()) {
                showSnackbar('Customer name is required', 'error');
                return;
              }
              try {
                const resp = await api.post('/api/users', newCustomer);
                showSnackbar('Customer added');
                setCustomerDialogOpen(false);
                setNewCustomer({ name: '', email: '', phone: '', address: '' });
                // Refresh customers and preselect the new one
                await fetchCustomers();
                const created = resp.data?.user;
                if (created?.user_id) setSelectedCustomer(created.user_id);
              } catch (e) {
                console.error('Add customer error', e);
                showSnackbar(e.response?.data?.message || 'Failed to add customer', 'error');
              }
            }}
          >
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {receiptData && (
            <Box ref={receiptRef} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold">GrocerDesk</Typography>
              <Typography variant="body2" color="text.secondary">Sale ID: {receiptData.sale_id?.slice?.(-8) || '-'}</Typography>
              <Typography variant="body2" color="text.secondary">Date: {receiptData.date}</Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Customer</Typography>
                <Typography variant="body2">{receiptData.customer?.name || 'Walk-in Customer'}</Typography>
                {receiptData.customer?.phone && (
                  <Typography variant="body2">{receiptData.customer.phone}</Typography>
                )}
              </Box>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receiptData.items.map((it) => (
                    <TableRow key={it.product_id}>
                      <TableCell>{it.name}</TableCell>
                      <TableCell align="right">{it.quantity}</TableCell>
                      <TableCell align="right">${it.price.toFixed(2)}</TableCell>
                      <TableCell align="right">${(it.subtotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">${(receiptData.total ?? receiptData.items.reduce((t,i)=>t+i.subtotal,0)).toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Thank you for shopping with us!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptOpen(false)}>Close</Button>
          <Button 
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => {
              // Print the receipt area - users can choose "Save as PDF"
              const printContents = receiptRef.current?.innerHTML;
              const win = window.open('', '', 'width=600,height=700');
              if (win && printContents) {
                win.document.write(`<!doctype html><html><head><title>Receipt</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 16px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border-bottom: 1px solid #ddd; padding: 8px; }
                    th { text-align: left; }
                  </style>
                </head><body>${printContents}</body></html>`);
                win.document.close();
                win.focus();
                win.print();
                // Optionally close after print
                setTimeout(() => win.close(), 200);
              }
            }}
          >
            Download/Print
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

export default POS;
