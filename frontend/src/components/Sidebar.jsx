import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  ShoppingCart,
  Assessment,
  Category,
  Store,
  Settings,
  Logout,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Inventory',
    icon: <Inventory />,
    roles: ['admin', 'manager', 'cashier'],
    children: [
      { title: 'Products', path: '/products', icon: <Store /> },
      { title: 'Categories', path: '/categories', icon: <Category /> },
      { title: 'Low Stock', path: '/low-stock', icon: <Inventory /> }
    ]
  },
  {
    title: 'Sales',
    icon: <ShoppingCart />,
    roles: ['admin', 'manager', 'cashier'],
    children: [
      { title: 'Point of Sale', path: '/pos', icon: <ShoppingCart /> },
      { title: 'Sales History', path: '/sales', icon: <Assessment /> }
    ]
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: <People />,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Staff Management',
    path: '/staff',
    icon: <People />,
    roles: ['admin', 'manager']
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: <Assessment />,
    roles: ['admin', 'manager']
  }
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAnyRole, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedItems, setExpandedItems] = useState({});

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleExpandClick = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderMenuItem = (item, level = 0) => {
    // Don't render anything if still loading or user is not loaded yet
    if (loading || !user) return null;
    
    const hasAccess = item.roles && hasAnyRole(item.roles);
    if (!hasAccess) return null;

    const isExpanded = expandedItems[item.title];
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path;

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleExpandClick(item.title);
              } else {
                handleItemClick(item.path);
              }
            }}
            sx={{
              pl: 2 + level * 2,
              backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
              color: isActive ? 'white' : 'inherit',
              '&:hover': {
                backgroundColor: isActive 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <Store />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              GrocerDesk
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Store Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      {!loading && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List>
            {menuItems && menuItems.map(item => renderMenuItem(item))}
          </List>
        </Box>
      )}

      {/* Logout */}
      {!loading && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
