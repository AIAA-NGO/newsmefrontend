import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  AlertTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  Tooltip
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  LockReset as PasswordIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { fetchAllUsers } from "../../services/userService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAllUsers();
      setUsers(response);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      const errorMsg = typeof error === 'string' ? error : error.message || "Failed to load users";
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleEditUser = () => {
    navigate(`/users/edit/${selectedUserId}`);
    handleMenuClose();
  };

  const handleChangePassword = () => {
    navigate(`/users/change-password/${selectedUserId}`);
    handleMenuClose();
  };

  const handleCreateUser = () => {
    navigate("/users/create");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Users List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-active { background-color: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; }
            .status-inactive { background-color: #F44336; color: white; padding: 2px 6px; border-radius: 4px; }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Users Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.username}</td>
                  <td>${user.email || 'N/A'}</td>
                  <td>${user.fullName || 'N/A'}</td>
                  <td>${user.roles?.join(', ') || 'N/A'}</td>
                  <td>
                    <span class="${user.active ? 'status-active' : 'status-inactive'}">
                      ${user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      'ID': user.id,
      'Username': user.username,
      'Email': user.email || 'N/A',
      'Full Name': user.fullName || 'N/A',
      'Role': user.roles?.join(', ') || 'N/A',
      'Status': user.active ? 'Active' : 'Inactive',
      'Created At': formatCreatedAt(user.createdAt || user.created_at)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_" + new Date().toISOString().split('T')[0] + ".xlsx");
    toast.success('Excel export started successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const formatCreatedAt = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid Date';
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      width: '100%',
      overflow: 'hidden'
    }}>
      <ToastContainer />
      <div className="no-print">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4 
        }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            User Management
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            justifyContent: { xs: 'center', md: 'flex-end' } 
          }}>
            <Tooltip title="Print Users">
              <Button 
                onClick={handlePrint}
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                sx={{ textTransform: 'none' }}
              >
                Print
              </Button>
            </Tooltip>
            <Tooltip title="Export to Excel">
              <Button 
                onClick={handleExcelDownload}
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                sx={{ textTransform: 'none' }}
              >
                Excel
              </Button>
            </Tooltip>
            <Tooltip title="Create New User">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateUser}
                size="small"
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                New User
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.default'
              }
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {error && (
          <Box mb={2}>
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          </Box>
        )}
      </div>

      <Paper elevation={0} sx={{ 
        width: '100%',
        overflowX: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <TableContainer>
          <Table sx={{ 
            minWidth: isSmallScreen ? 300 : 600,
            '& .MuiTableCell-root': {
              py: 1.5,
              px: 2,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              maxWidth: isSmallScreen ? '120px' : '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ width: '60px', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                {!isSmallScreen && <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>}
                {!isMediumScreen && <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>}
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" className="no-print" sx={{ width: '60px', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm 
                        ? 'No users match your search criteria' 
                        : 'No users found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover 
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{user.username}</TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        {user.email ? (
                          <a href={`mailto:${user.email}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                            {user.email}
                          </a>
                        ) : 'N/A'}
                      </TableCell>
                    )}
                    {!isMediumScreen && (
                      <TableCell>{user.fullName || 'N/A'}</TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.roles?.map(role => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            sx={{
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          backgroundColor: user.active ? 'success.light' : 'error.light',
                          color: user.active ? 'success.contrastText' : 'error.contrastText',
                          fontWeight: 'medium',
                          width: '80px'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" className="no-print">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user.id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.selected'
                          }
                        }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: '180px',
            borderRadius: '8px',
            boxShadow: theme.shadows[3],
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              padding: '8px 16px'
            }
          }
        }}
      >
        <MenuItem onClick={handleEditUser}>
          <EditIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleChangePassword}>
          <PasswordIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} /> Change Password
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UsersList;