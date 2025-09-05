import React, { useContext, useEffect, useState } from 'react';
import { 
  Container,  Typography,   Button,   Card,   CardContent,  Grid,  Box,  Avatar,  Fade} from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../userContext';
import { Briefcase, Crown, User } from 'lucide-react';

const HomePage = () => {
  // Hardcoded testimonials data
  const {user}=useContext(UserContext);
  const currentDate = new Date();
  const [animationStarted, setAnimationStarted] = useState(false);
    const [donationRequests, setDonationRequests] = useState([]);
  
  useEffect(() => {
    // Start animation after component mounts
    setAnimationStarted(true);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Software Engineer, Google (Class of 2018)",
      feedback: "The alumni network helped me land my dream job at Google. The mentorship I received was invaluable and the connections I made continue to shape my career path.",
      avatar: "/images/testimonials/sarah.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Entrepreneur, Tech Innovators (Class of 2015)",
      feedback: "As a startup founder, the support from our alumni community provided me with crucial advice and initial investors. This network is truly a lifelong resource.",
      avatar: "/images/testimonials/michael.jpg"
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: "Marketing Director, Netflix (Class of 2012)",
      feedback: "Through our alumni mentorship program, I found guidance that propelled my career forward. Now I enjoy giving back by mentoring current students and recent graduates.",
      avatar: "/images/testimonials/jessica.jpg"
    }
  ];

  // Hardcoded jobs data
    const [jobsData, setJobsData] = useState([]);
      useEffect(() => {
        const fetchJobs = async () => {
          try {
            const response = await axios.get('http://localhost:8080/api/v1/jobs/all'); 
            // console.log("job data is",response.data);
            setJobsData(response.data);
          } catch (error) {
            console.error('Error fetching job data:', error);
          }
        };
    
        fetchJobs();
      }, []);
    const navigate=useNavigate();
      const handleJobClick = (job) => {
    navigate(`/jobDesc/${job?._id}`)
      };
      const filteredJobs = jobsData.filter(job => 
        (job.postedBy?._id !== user?._id) &&  
        (!job.appliedDate || new Date(job.appliedDate) >= currentDate)).slice(0,3);
  // Hardcoded donations data
    useEffect(() => {
      fetchDonations();
    }, []);
  
  const fetchDonations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/donations/all');
        
        const currentDate = new Date();
        const filteredDonations = Array.isArray(response.data) 
          ? response.data.filter(donation => {
              const deadlineDate = new Date(donation.deadline);
              return deadlineDate >= currentDate;
            }).slice(0,2)
          : [];
        
        setDonationRequests(filteredDonations);
      } catch (err) {
        console.error("error occured")
      } 
    };
 
 
  const timeAgo = (postedDate) => {
    if (!postedDate) return "Unknown";
    const postedTime = new Date(postedDate);
    const now = new Date();
    const diffMs = now - postedTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };
  // Carousel logic with hardcoded data
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = React.useState(0);
  const [fadeIn, setFadeIn] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentTestimonialIndex(prevIndex => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
        setFadeIn(true);
      }, 500);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const changeTestimonial = (index) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentTestimonialIndex(index);
      setFadeIn(true);
    }, 500);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section - Modern Gradient Overlay */}
      <Box
      sx={{
        position: 'relative',
        height: '75vh',
        minHeight: '550px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.9)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        mb: 6,
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            opacity: animationStarted ? 1 : 0,
            animation: animationStarted ? 'fadeIn 1.2s ease' : 'none',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Typography
            variant="overline"
            component="div"
            sx={{
              mb: 1.5,
              fontWeight: 500,
              letterSpacing: '3px',
              fontSize: '1rem',
              opacity: 0.9
            }}
          >
            Alumni Connect Network
          </Typography>

          {/* Circular sunshine animation container */}
          <Box
            sx={{
              position: 'relative',
              height: '4px',
              width: '160px',
              mx: 'auto',
              mb: 3,
              overflow: 'visible'
            }}
          > 
            {/* Radial glow effect */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '60px',
                height: '60px',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
                animation: animationStarted ? 'glowPulse 3.5s infinite alternate' : 'none',
                '@keyframes glowPulse': {
                  '0%': { 
                    opacity: 0.3,
                    transform: 'translate(-50%, -50%) scale(1)'
                  },
                  '100%': { 
                    opacity: 0.8,
                    transform: 'translate(-50%, -50%) scale(6)'
                  }
                }
              }}
            />
          </Box>

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2,
              mb: 2.5
            }}
          >
            The Power of Alumni Networks
          </Typography>

          <Typography
            variant="h5"
            sx={{
              maxWidth: '650px',
              mx: 'auto',
              fontWeight: 400,
              mb: 4,
              lineHeight: 1.5,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Building bridges that connect past, present, and future generations of excellence.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#2563eb',
                fontWeight: 600,
                px: 3.5,
                py: 1.25,
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Join Our Network
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.8)',
                fontWeight: 500,
                px: 3.5,
                py: 1.25,
                borderRadius: '4px',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: '80px',
                  height: '80px',
                  bgcolor: 'rgba(58, 134, 255, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
               <User/>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Connect & Network
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Build meaningful relationships with alumni from various industries and backgrounds.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: '80px',
                  height: '80px',
                  bgcolor: 'rgba(58, 134, 255, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
              <Briefcase/>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Career Opportunities
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Discover exclusive job openings shared by our alumni community.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: '80px',
                  height: '80px',
                  bgcolor: 'rgba(58, 134, 255, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
              <Crown/>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Mentorship
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Give back by mentoring students or receive guidance from experienced alumni.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials Section - Elegant Card Design */}
      <Box sx={{ bgcolor: '#f0f4f8', py: 10, mb: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ fontWeight: 700, mb: 2 }}
            >
              What Our Community Says
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ maxWidth: '650px', mx: 'auto' }}
            >
              Hear from alumni who have experienced the power of our network
            </Typography>
          </Box>

          <Box 
            sx={{ 
              position: 'relative',
              maxWidth: '850px',
              mx: 'auto',
              px: { xs: 2, md: 8 }
            }}
          >
            <Fade in={fadeIn} timeout={500}>
              <Box 
                sx={{
                  bgcolor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  p: { xs: 3, md: 5 },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <FormatQuoteIcon 
                  sx={{ 
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    fontSize: '64px',
                    color: 'rgba(58, 134, 255, 0.1)',
                    transform: 'rotate(180deg)'
                  }}
                />
                
                <Typography 
                  variant="body1" 
                  component="p" 
                  sx={{ 
                    fontSize: '1.25rem',
                    lineHeight: 1.6,
                    mb: 4,
                    pt: 4,
                    px: { xs: 0, sm: 4 }
                  }}
                >
                  {testimonials[currentTestimonialIndex]?.feedback}
                </Typography>
                
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}
                >
                  <Avatar 
                    src={testimonials[currentTestimonialIndex]?.avatar} 
                    alt={testimonials[currentTestimonialIndex]?.name}
                    sx={{ 
                      width: 60, 
                      height: 60,
                      border: '3px solid #f0f4f8'
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {testimonials[currentTestimonialIndex]?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonials[currentTestimonialIndex]?.role}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
            
            {/* Indicator dots */}
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4
              }}
            >
              {testimonials.map((_, index) => (
                <Box 
                  key={index}
                  onClick={() => changeTestimonial(index)}
                  sx={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    mx: 0.8,
                    bgcolor: index === currentTestimonialIndex ? '#3a86ff' : 'rgba(58, 134, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Job Postings Section - Modern Cards */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 5,
            flexDirection: { xs: 'column', md: 'row' },
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          <Box sx={{ mb: { xs: 3, md: 0 } }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Career Opportunities
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Exclusive jobs shared by fellow alumni
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="primary" 
            endIcon={<ArrowForwardIcon />}
            href="/jobPortal"
            sx={{
              borderRadius: '30px',
              px: 3,
              py: 1,
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                bgcolor: 'rgba(58, 134, 255, 0.05)'
              }
            }}
          >
            View All Jobs
          </Button>
        </Box>

        <Grid container spacing={4}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={4} key={job._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    height: '8px', 
                    bgcolor: '#3a86ff'
                  }} 
                />
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 3
                    }}
                  >
                    <Avatar
                      src={job?.companyImageUrl 
                        ? `${job.companyImageUrl}` 
                        : 'https://tse2.mm.bing.net/th?id=OIP.qW3gSMjOUOxIxsdMw3fHVgHaHk&pid=Api&P=0&h=180'} 
                      alt="Company Logo" 
                      className='w-12 h-12 object-cover rounded-full'
                    >
                      {job.type}
                    </Avatar>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Posted {timeAgo(job.createdAt)}
                    </Typography>
                  </Box>
                
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    {job.title}
                  </Typography>
                  
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 1
                    }}
                  >
                    <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{job.company}</Typography>
                  </Box>
                  
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 3
                    }}
                  >
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  
                  <Button 
                    variant="text" 
                    color="primary"
                    sx={{ 
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(58, 134, 255, 0.08)'
                      }
                    }}
                    onClick={()=>handleJobClick(job)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Donation Requests Section - Modern Cards with Progress */}
      <Box sx={{ bgcolor: '#f0f4f8', py: 10, mb: 8 }}>
        <Container maxWidth="lg">
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 5,
              flexDirection: { xs: 'column', md: 'row' },
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            <Box sx={{ mb: { xs: 3, md: 0 } }}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Support Our Community
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Make an impact with our giving back initiatives
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary" 
              endIcon={<ArrowForwardIcon />}
              href="/donationPortal"
              sx={{
                borderRadius: '30px',
                px: 3,
                py: 1,
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  bgcolor: 'rgba(58, 134, 255, 0.05)'
                }
              }}
            >
              View All Initiatives
            </Button>
          </Box>

          <Grid container spacing={4}>
            {donationRequests.map((donation) => (
              <Grid item xs={12} md={6} key={donation.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 700, mb: 2 }}
                    >
                      {donation.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                      {donation.description}
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Raised: {donation.amountRaised}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Goal: {donation.amountRequired}
                        </Typography>
                      </Box>
                   
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      sx={{ 
                        borderRadius: '30px',
                        py: 1.2,
                        fontWeight: 600,
                        bgcolor: '#3a86ff',
                        '&:hover': {
                          bgcolor: '#2667d9',
                        },
                      }}
                    >
                      Contribute Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action - Modern Design */}
      <Box 
        sx={{
          position: 'relative',
          py: 12,
          textAlign: 'center',
          bgcolor: '#191919', 
          color: 'white',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 800, mb: 3 }}
          >
            Ready to Connect with Fellow Alumni?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 5, 
              maxWidth: '700px', 
              mx: 'auto',
              fontWeight: 400,
              opacity: 0.9
            }}
          >
            Join our vibrant community of alumni and students. Share opportunities, 
            find mentors, and stay connected with your alma mater.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              href='/LogIn'
              sx={{ 
                bgcolor: 'white',
                color: '#3a86ff',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                }
              }}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{ 
                color: 'white',
                borderColor: 'white',
                borderWidth: '2px',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: '2px',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Explore Benefits
            </Button>
          </Box>
        </Container>
      </Box>
      
    </Box>
  );
};

export default HomePage;
