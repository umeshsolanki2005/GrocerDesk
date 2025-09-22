import React, { useState, useEffect } from 'react';
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
  useMediaQuery,
  Badge,
  Chip,
  Tooltip,
  alpha,
  Fade,
  Slide
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
  Person,
  Logout,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Notifications,
  TrendingUp,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;
const collapsedWidth = 70;

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Inventory',
    path: '/inventory', // Dedicated inventory overview page
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
    path: '/sales', // Default to Sales History page
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
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <Person />,
    roles: ['admin', 'manager', 'cashier']
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Settings />,
    roles: ['admin', 'manager']
  },
  {
    title: 'Conversations',
    path: '/conversations',
    icon: <People />,
    roles: ['admin', 'manager', 'cashier']
  }
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAnyRole, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedItems, setExpandedItems] = useState({
    'Inventory': true,  // Expand Inventory by default
    'Sales': true       // Expand Sales by default
  });
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [notifications, setNotifications] = useState({
    inventory: 3, // Low stock items
    sales: 5,     // New orders
    customers: 2  // New customers
  });

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

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    if (!collapsed) {
      setExpandedItems({}); // Collapse all items when sidebar is collapsed
    }
  };

  const getNotificationCount = (title) => {
    const key = title.toLowerCase();
    return notifications[key] || 0;
  };

  const getStatusColor = (title) => {
    switch (title.toLowerCase()) {
      case 'inventory':
        return notifications.inventory > 0 ? 'warning' : 'success';
      case 'sales':
        return 'info';
      case 'customers':
        return notifications.customers > 0 ? 'info' : 'default';
      default:
        return 'default';
    }
  };

  const renderMenuItem = (item, level = 0) => {
    // Don't render anything if still loading or user is not loaded yet
    if (loading || !user) return null;
    
    const hasAccess = item.roles && hasAnyRole(item.roles);
    if (!hasAccess) return null;

    const isExpanded = expandedItems[item.title] && !collapsed;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = location.pathname === item.path;
    const notificationCount = getNotificationCount(item.title);
    const statusColor = getStatusColor(item.title);
    const isHovered = hoveredItem === item.title;

    const menuItemContent = (
      <ListItem disablePadding>
        <Tooltip 
          title={collapsed ? item.title : ''} 
          placement="right"
          arrow
        >
          <ListItemButton
            onMouseEnter={() => setHoveredItem(item.title)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => {
              if (hasChildren && !collapsed) {
                // If item has a path, navigate to it
                if (item.path) {
                  handleItemClick(item.path);
                }
                // Always toggle expansion for items with children
                handleExpandClick(item.title);
              } else {
                handleItemClick(item.path);
              }
            }}
            sx={{
              pl: collapsed ? 1.5 : 2 + level * 2,
              pr: collapsed ? 1.5 : 2,
              py: 1.5,
              mx: collapsed ? 1 : 0.5,
              my: 0.25,
              borderRadius: collapsed ? 2 : 1.5,
              minHeight: 48,
              backgroundColor: isActive 
                ? alpha(theme.palette.primary.main, 0.15)
                : 'transparent',
              borderLeft: isActive 
                ? `4px solid ${theme.palette.primary.main}`
                : '4px solid transparent',
              color: isActive ? theme.palette.primary.main : 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              '&:hover': {
                backgroundColor: isActive 
                  ? alpha(theme.palette.primary.main, 0.25)
                  : alpha(theme.palette.primary.main, 0.08),
                boxShadow: collapsed 
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                  : 'none'
              }
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: isActive ? theme.palette.primary.main : 'inherit',
                minWidth: collapsed ? 'auto' : 40,
                mr: collapsed ? 0 : 1.5,
                transition: 'all 0.3s ease'
              }}
            >
              <Badge 
                badgeContent={notificationCount} 
                color={statusColor}
                variant="dot"
                invisible={notificationCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 3,
                    animation: notificationCount > 0 ? 'pulse 2s infinite' : 'none'
                  }
                }}
              >
                {item.icon}
              </Badge>
            </ListItemIcon>
            
            {!collapsed && (
              <Fade in={!collapsed} timeout={300}>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem'
                  }}
                />
              </Fade>
            )}
            
            {!collapsed && hasChildren && (
              <Box
                sx={{
                  transition: 'transform 0.3s ease',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                }}
              >
                <ExpandLess />
              </Box>
            )}
            
            {!collapsed && notificationCount > 0 && (
              <Chip
                label={notificationCount}
                size="small"
                color={statusColor}
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ml: 1
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );

    return (
      <React.Fragment key={item.title}>
        {menuItemContent}
        
        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout={400} unmountOnExit>
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
      <Box sx={{ 
        p: collapsed ? 1.5 : 3, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white'
      }}>
        <Box display="flex" alignItems="center" gap={collapsed ? 0 : 2} justifyContent={collapsed ? 'center' : 'flex-start'}>
          <Avatar sx={{ 
            bgcolor: alpha('#ffffff', 0.2), 
            width: collapsed ? 32 : 40, 
            height: collapsed ? 32 : 40,
            transition: 'all 0.3s ease'
          }}>
            <Store sx={{ color: 'white' }} />
          </Avatar>
          {!collapsed && (
            <Fade in={!collapsed} timeout={300}>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                  GrocerDesk
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.8) }}>
                  Store Management
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
        
        {/* Collapse Toggle Button */}
        {!isMobile && (
          <IconButton
            onClick={toggleCollapsed}
            sx={{
              position: 'absolute',
              right: collapsed ? 8 : 16,
              top: collapsed ? 16 : 20,
              bgcolor: alpha('#ffffff', 0.1),
              color: 'white',
              width: 32,
              height: 32,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha('#ffffff', 0.2),
                transform: 'scale(1.1)'
              }
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
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
        <Box sx={{ 
          p: collapsed ? 1.5 : 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          background: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Box display="flex" alignItems="center" gap={collapsed ? 0 : 2} justifyContent={collapsed ? 'center' : 'flex-start'}>
            <Tooltip title={collapsed ? user.name : ''} placement="right" arrow>
              <Avatar sx={{ 
                bgcolor: 'secondary.main',
                width: collapsed ? 32 : 40,
                height: collapsed ? 32 : 40,
                transition: 'all 0.3s ease',
                boxShadow: `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`
              }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Tooltip>
            {!collapsed && (
              <Fade in={!collapsed} timeout={300}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {user.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      )}

      {/* Navigation */}
      {!loading && (
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          py: 1,
          '&::-webkit-scrollbar': {
            width: 4
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 2
          }
        }}>
          <List sx={{ px: collapsed ? 0.5 : 1 }}>
            {menuItems && menuItems.map(item => renderMenuItem(item))}
          </List>
        </Box>
      )}

      {/* Logout */}
      {!loading && (
        <Box sx={{ p: collapsed ? 1.5 : 2, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
            <ListItemButton 
              onClick={handleLogout} 
              sx={{ 
                borderRadius: 2,
                mx: collapsed ? 0.5 : 0,
                py: 1.5,
                color: 'error.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.15)}`
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'error.main',
                minWidth: collapsed ? 'auto' : 40,
                mr: collapsed ? 0 : 1.5
              }}>
                <Logout />
              </ListItemIcon>
              {!collapsed && (
                <Fade in={!collapsed} timeout={300}>
                  <ListItemText primary="Logout" />
                </Fade>
              )}
            </ListItemButton>
          </Tooltip>
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
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        },
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            opacity: 1
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: 0.7
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1
          }
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
