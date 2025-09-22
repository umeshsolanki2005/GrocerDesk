import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Container, 
  Card, 
  CardContent,
  Chip,
  Stack,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  IconButton,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Inventory, 
  People, 
  Assessment, 
  Security, 
  Speed, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowForward,
  PlayArrow,
  TrendingUp as TrendingUpIcon,
  Store,
  Analytics,
  Shield
} from '@mui/icons-material';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function Landing(){
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Inventory sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Smart Inventory Management",
      description: "Track stock levels, set reorder points, and manage suppliers with intelligent automation.",
      color: '#4CAF50'
    },
    {
      icon: <People sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Role-Based Access Control",
      description: "Secure staff management with customizable permissions for different store roles.",
      color: '#2196F3'
    },
    {
      icon: <Assessment sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Real-Time Analytics",
      description: "Comprehensive sales reports and insights to optimize your store performance.",
      color: '#FF9800'
    },
    {
      icon: <Security sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data and secure authentication protocols.",
      color: '#9C27B0'
    },
    {
      icon: <Speed sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant search, quick checkout, and responsive design.",
      color: '#F44336'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: "Growth Ready",
      description: "Scalable solution that grows with your business from single store to chain.",
      color: '#00BCD4'
    }
  ];

  const stats = [
    { number: "500+", label: "Stores Trust Us", icon: <Store /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUpIcon /> },
    { number: "24/7", label: "Support", icon: <Analytics /> },
    { number: "100%", label: "Secure", icon: <Shield /> }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: { xs: 8, md: 15 },
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Animated Background Elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${alpha('#fff', 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${alpha('#fff', 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha('#fff', 0.05)} 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite'
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={isVisible} timeout={1000}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Logo sx={{ fontSize: 60, color: 'white' }} />
                  <Box>
                    <Typography variant="h2" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                      GrocerDesk
                    </Typography>
                    <Chip 
                      label="Professional Staff Portal" 
                      sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '1rem',
                        px: 2,
                        py: 1
                      }} 
                    />
                  </Box>
                </Box>

                <Typography variant="h1" gutterBottom fontWeight={800} sx={{ 
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  lineHeight: 1.1,
                  mb: 3,
                  background: `linear-gradient(45deg, #fff 30%, ${alpha('#fff', 0.8)} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Streamline Your Grocery Store Operations
                </Typography>
                
                <Typography variant="h5" sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: '600px',
                  fontWeight: 400
                }}>
                  The all-in-one platform for inventory management, staff coordination, and business analytics. 
                  Built specifically for grocery stores that want to operate efficiently and profitably.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 6 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    component={RouterLink} 
                    to="/login" 
                    endIcon={<ArrowForward />}
                    sx={{ 
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.9),
                        transform: 'translateY(-3px)',
                        boxShadow: 8
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    component={RouterLink} 
                    to="/signup"
                    startIcon={<PlayArrow />}
                    sx={{ 
                      color: "white", 
                      borderColor: "white",
                      borderWidth: 2,
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.1),
                        borderColor: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                <Grid container spacing={4}>
                  {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Fade in={isVisible} timeout={1000 + index * 200}>
                        <Box textAlign="center" sx={{ 
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha('#fff', 0.1),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha('#fff', 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            bgcolor: alpha('#fff', 0.15)
                          }
                        }}>
                          <Box sx={{ mb: 1 }}>
                            {stat.icon}
                          </Box>
                          <Typography variant="h4" fontWeight={700} color="white">
                            {stat.number}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={6}>
                 <Zoom in={isVisible} timeout={1500}>
  <Box sx={{
    position: 'relative',
    height: { xs: 400, md: 500 },
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: `2px solid ${alpha('#fff', 0.3)}`,
    boxShadow: `0 20px 40px ${alpha('#000', 0.3)}`,
    backdropFilter: 'blur(20px)',
  }}>
    <img 
      src="unnamed.png"
      alt="Interactive Dashboard" 
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: '12px',
        objectFit: 'cover'
      }} 
    />
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(45deg, transparent 30%, ${alpha('#fff', 0.1)} 50%, transparent 70%),
        radial-gradient(circle at 50% 50%, ${alpha('#fff', 0.1)} 0%, transparent 70%)
      `,
      animation: 'shimmer 3s ease-in-out infinite'
    }} />
  </Box>
</Zoom>

              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, bgcolor: 'grey.50' }}>
        <Container>
          <Box textAlign="center" mb={10}>
            <Slide direction="up" in={isVisible} timeout={1000}>
              <Box>
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}>
                  Everything You Need to Run Your Store
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
                  Powerful features designed specifically for grocery stores to maximize efficiency and profitability
                </Typography>
              </Box>
            </Slide>
          </Box>

          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in={isVisible} timeout={1000 + index * 200}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(feature.color, 0.3)}`,
                        '& .feature-icon': {
                          transform: 'scale(1.2) rotate(5deg)'
                        }
                      }
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${feature.color} 0%, ${alpha(feature.color, 0.7)} 100%)`
                    }} />
                    <CardContent sx={{ p: 5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ 
                        mb: 4,
                        '& .feature-icon': {
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <Box className="feature-icon" sx={{ 
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: alpha(feature.color, 0.1),
                          mb: 2
                        }}>
                          {feature.icon}
                        </Box>
                      </Box>
                      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ 
                        lineHeight: 1.6,
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        py: 12,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 20%, ${alpha('#fff', 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, ${alpha('#fff', 0.1)} 0%, transparent 50%)
          `
        }} />
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Fade in={isVisible} timeout={1000}>
              <Box>
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 4
                }}>
                  Ready to Transform Your Store Operations?
                </Typography>
                <Typography variant="h5" sx={{ mb: 6, opacity: 0.9, fontWeight: 400 }}>
                  Join hundreds of stores already using GrocerDesk to streamline their operations
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: 'white' }} />
                    <Typography>Free 30-day trial</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: 'white' }} />
                    <Typography>No setup fees</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: 'white' }} />
                    <Typography>Cancel anytime</Typography>
                  </Box>
                </Stack>

                <Button 
                  variant="contained" 
                  size="large" 
                  component={RouterLink} 
                  to="/signup"
                  endIcon={<ArrowForward />}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 8,
                    py: 3,
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    borderRadius: 4,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.9),
                      transform: 'translateY(-4px)',
                      boxShadow: 12
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Start Your Free Trial
                </Button>
              </Box>
            </Fade>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
