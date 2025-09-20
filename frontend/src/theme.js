import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' }, // green
    secondary: { main: '#f57c00' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial',
  },
});

export default theme;
