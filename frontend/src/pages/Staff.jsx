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
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Chip,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  People,
  Email,
  AdminPanelSettings,
  Person,
  SupervisorAccount,
  Refresh
} from '@mui/icons-material';
import api from '../services/api';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });

  const roleIcons = {
    admin: <AdminPanelSettings />,
    manager: <SupervisorAccount />,
    cashier: <Person />
  };

  const roleColors = {
    admin: 'error',
    manager: 'warning',
    cashier: 'primary'
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showSnackbar('Error fetching staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        password: '',
        role: staffMember.role
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'cashier'
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      showSnackbar('Name and email are required', 'error');
      return;
    }

    if (!editingStaff && !formData.password.trim()) {
      showSnackbar('Password is required for new staff', 'error');
      return;
    }

    try {
      const submitData = { ...formData };
      if (editingStaff && !formData.password.trim()) {
        delete submitData.password; // Don't update password if empty
      }

      if (editingStaff) {
        await api.put(`/api/staff/${editingStaff.staff_id}`, submitData);
        showSnackbar('Staff member updated successfully');
      } else {
        await api.post('/api/staff', submitData);
        showSnackbar('Staff member created successfully');
      }

      handleCloseDialog();
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      showSnackbar(error.response?.data?.message || 'Error saving staff', 'error');
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/api/staff/${staffId}`);
        showSnackbar('Staff member deleted successfully');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        showSnackbar(error.response?.data?.message || 'Error deleting staff', 'error');
      }
    }
  };

  const filteredStaff = staff.filter(staffMember =>
    staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staffMember.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStats = () => {
    const stats = { admin: 0, manager: 0, cashier: 0 };
    staff.forEach(member => {
      stats[member.role]++;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Staff Member
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {staff.length}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Staff
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
                <AdminPanelSettings color="error" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {roleStats.admin}
                  </Typography>
                  <Typography color="textSecondary">
                    Administrators
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
                <SupervisorAccount color="warning" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {roleStats.manager}
                  </Typography>
                  <Typography color="textSecondary">
                    Managers
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
                <Person color="info" />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {roleStats.cashier}
                  </Typography>
                  <Typography color="textSecondary">
                    Cashiers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Search staff members..."
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
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchStaff}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.staff_id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {staffMember.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {staffMember.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ID: {staffMember.staff_id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">
                        {staffMember.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={roleIcons[staffMember.role]}
                      label={staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1)}
                      color={roleColors[staffMember.role]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      Active
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(staffMember)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(staffMember.staff_id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Empty State */}
      {filteredStaff.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'No staff members found' : 'No staff members yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Add your first staff member to get started'
            }
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Staff Member
            </Button>
          )}
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required={!editingStaff}
                helperText={editingStaff ? "Leave empty to keep current password" : ""}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="cashier">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person />
                      Cashier
                    </Box>
                  </MenuItem>
                  <MenuItem value="manager">
                    <Box display="flex" alignItems="center" gap={1}>
                      <SupervisorAccount />
                      Manager
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box display="flex" alignItems="center" gap={1}>
                      <AdminPanelSettings />
                      Administrator
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingStaff ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
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

export default Staff;
