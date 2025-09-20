import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, textAlign: 'center', mt: 'auto', bgcolor: '#f1f8f4' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} GrocerDesk — All Rights Reserved
      </Typography>
      <Typography variant="caption" display="block">
        Built with ❤️ for grocery stores
      </Typography>
      <Link href="https://grocerdesk.local" underline="hover" color="primary">
        www.grocerdesk.com
      </Link>
    </Box>
  );
}
