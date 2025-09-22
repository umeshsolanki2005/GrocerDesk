import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  ShoppingCart,
  People,
  AttachMoney,
  Warning,
  Refresh
} from '@mui/icons-material';
import api from '../services/api';

const StatCard = ({ title, value, change, icon, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].light}10 100%)`,
        border: `1px solid ${theme.palette[color].main}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${theme.palette[color].main}30`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            {change && (
              <Box display="flex" alignItems="center" mt={1}>
                {change > 0 ? (
                  <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={change > 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: `${color}.main`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
              minHeight: 60,
              boxShadow: `0 4px 12px ${theme.palette[color].main}40`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics
      const analyticsResponse = await api.get('/api/sales/analytics?period=30');
      const { summary } = analyticsResponse.data;
      
      // Fetch recent sales
      const salesResponse = await api.get('/api/sales/recent?limit=5');
      
      // Fetch low stock products
      const lowStockResponse = await api.get('/api/products/low-stock?threshold=10');
      
      // Fetch total products
      const productsResponse = await api.get('/api/products');
      
      setStats({
        totalSales: summary.total_sales || 0,
        totalRevenue: summary.total_revenue || 0,
        totalProducts: productsResponse.data.length || 0,
        lowStockItems: lowStockResponse.data.length || 0
      });
      
      setRecentSales(salesResponse.data || []);
      setLowStockProducts(lowStockResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <IconButton onClick={fetchDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            change={12}
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={8}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={<Inventory />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock"
            value={stats.lowStockItems}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Sales */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Sales
            </Typography>
            <List>
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <ListItem key={sale.sale_id} divider={index < recentSales.length - 1}>
                    <ListItemIcon>
                      <ShoppingCart color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Sale #${sale.sale_id.slice(-8)}`}
                      secondary={`${sale.customer_name || 'Walk-in'} - $${sale.total}`}
                    />
                    <Chip 
                      label={new Date(sale.sale_date).toLocaleDateString()} 
                      size="small" 
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent sales" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Low Stock Alert
            </Typography>
            <List>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((product, index) => (
                  <ListItem key={product.product_id} divider={index < lowStockProducts.length - 1}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.stock} units`}
                    />
                    <Chip 
                      label={product.category_name || 'No Category'} 
                      size="small" 
                      color="default"
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="All products are well stocked!" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
