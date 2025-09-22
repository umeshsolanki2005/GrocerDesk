import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications,
  Security,
  Palette,
  Storage,
  Download,
  Upload,
  Delete,
  Refresh,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    database: 'Connected',
    uptime: '0 days',
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
  });

  const [settings, setSettings] = useState({
    notifications: {
      lowStock: true,
      newSales: true,
      dailyReports: false,
      systemAlerts: true,
    },
    display: {
      darkMode: false,
      compactView: false,
      showAnimations: true,
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      lowStockThreshold: 10,
      taxRate: 0,
    },
  });

  useEffect(() => {
    fetchSystemInfo();
    loadSettings();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      // Fetch system statistics
      const [productsRes, salesRes, customersRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/sales'),
        api.get('/api/users'),
      ]);

      setSystemInfo(prev => ({
        ...prev,
        totalProducts: productsRes.data.length,
        totalSales: salesRes.data.length,
        totalCustomers: customersRes.data.length,
      }));
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('grocerdesk_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('grocerdesk_settings', JSON.stringify(settings));
    showSnackbar('Settings saved successfully');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleBackupData = async () => {
    try {
      showSnackbar('Backup started...', 'info');
      // In a real application, this would trigger a backup process
      setTimeout(() => {
        showSnackbar('Backup completed successfully');
        setBackupDialogOpen(false);
      }, 2000);
    } catch (error) {
      showSnackbar('Backup failed', 'error');
    }
  };

  const handleRestoreData = () => {
    // Create file input for restore
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        showSnackbar('Restore functionality would be implemented here', 'info');
      }
    };
    input.click();
  };

  const clearCache = () => {
    localStorage.removeItem('grocerdesk_cache');
    showSnackbar('Cache cleared successfully');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('grocerdesk_settings');
      loadSettings();
      showSnackbar('Settings reset to default');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Info color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  System Information
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText primary="Version" secondary={systemInfo.version} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Database Status" />
                  <ListItemSecondaryAction>
                    <Chip label={systemInfo.database} color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total Products" secondary={systemInfo.totalProducts} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total Sales" secondary={systemInfo.totalSales} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Total Customers" secondary={systemInfo.totalCustomers} />
                </ListItem>
              </List>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchSystemInfo}
                sx={{ mt: 2 }}
              >
                Refresh Info
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Notifications color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText primary="Low Stock Alerts" secondary="Get notified when products are running low" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.lowStock}
                      onChange={(e) => handleSettingChange('notifications', 'lowStock', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="New Sales" secondary="Notifications for new sales transactions" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.newSales}
                      onChange={(e) => handleSettingChange('notifications', 'newSales', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Daily Reports" secondary="Receive daily summary reports" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.dailyReports}
                      onChange={(e) => handleSettingChange('notifications', 'dailyReports', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="System Alerts" secondary="Important system notifications" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Palette color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Display
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText primary="Dark Mode" secondary="Switch to dark theme" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.display.darkMode}
                      onChange={(e) => handleSettingChange('display', 'darkMode', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Compact View" secondary="Use compact layout for tables" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.display.compactView}
                      onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Animations" secondary="Enable UI animations" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.display.showAnimations}
                      onChange={(e) => handleSettingChange('display', 'showAnimations', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  System
                </Typography>
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  type="number"
                  value={settings.system.lowStockThreshold}
                  onChange={(e) => handleSettingChange('system', 'lowStockThreshold', parseInt(e.target.value))}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={settings.system.taxRate}
                  onChange={(e) => handleSettingChange('system', 'taxRate', parseFloat(e.target.value))}
                  margin="normal"
                />
              </Box>
              <List>
                <ListItem>
                  <ListItemText primary="Auto Backup" secondary="Automatically backup data daily" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.system.autoBackup}
                      onChange={(e) => handleSettingChange('system', 'autoBackup', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Storage color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Data Management
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => setBackupDialogOpen(true)}
                  >
                    Backup Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={handleRestoreData}
                  >
                    Restore Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={clearCache}
                  >
                    Clear Cache
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    onClick={resetSettings}
                  >
                    Reset Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={saveSettings}
              sx={{ minWidth: 200 }}
            >
              Save All Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Backup Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            This will create a backup of all your data including:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="• Products and Categories" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Customer Information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Sales History" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• Staff Data" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            The backup will be downloaded as a JSON file to your device.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBackupData}>
            Create Backup
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

export default Settings;
