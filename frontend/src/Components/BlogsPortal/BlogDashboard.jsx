import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Paper, Container, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Stack, IconButton,
  Chip, CircularProgress
} from '@mui/material';
import { 
  Book, 
  ThumbUp, 
  Comment, 
  Bookmark, 
  Favorite,
  TrendingUp,
  Star
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { UserContext } from '../../userContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PieChartIcon, ThumbsUp } from 'lucide-react';

// Custom tooltip for PieChart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
        <Typography variant="body2">
          {payload[0].name}: {payload[0].value} posts
        </Typography>
      </Paper>
    );
  }
  return null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

const BlogDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  
  // Get the userId from localStorage or your auth context
  const userId = user?._id;

  const fetchLikedBlogs = async () => {
    try {
      if (!user?._id) return;

      const response = await axios.get(`http://localhost:8080/api/v1/blogs/getLikedBlogs/${userId}`);
      
      const processedLikedBlogs = response.data.map(post => ({
        id: post._id,
        title: post.title,
        likes: post.likes?.length,
        date: new Date(post.createdAt).toLocaleDateString('en-IN').split('T')[0],
        category: post.category,
        postedBy: post.author?.name || 'Anonymous'
      }));

      setLikedBlogs(processedLikedBlogs);
    } catch (error) {
      console.error('Error fetching liked blogs:', error);
      toast.error('Failed to load liked blogs');
    }
  };

  const fetchSavedBlogs = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(`http://localhost:8080/api/v1/auth/getSavedBlogs/${userId}`);
      const processedSavedBlogs = response.data.savedBlogs.map(post => ({
        id: post._id,
        title: post.title,
        likes: post.likes.length || 0,
        date: new Date(post.createdAt).toLocaleDateString('en-IN').split('T')[0],
        category: post.category,
        postedBy: post.author?.name || 'Anonymous'
      }));
      setSavedBlogs(processedSavedBlogs);
    } catch (error) {
      console.error('Error fetching saved blogs:', error);
      toast.error('Failed to load saved blogs');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/v1/blogs/dashboardStats/${userId}`);
        
        const data = response.data;
        
        // Process category data with colors
        const processedCategoryData = data.categoryData 
          ? data.categoryData.map((item, index) => ({
              name: item.category,
              value: item.count,
              color: COLORS[index % COLORS.length]
            }))
          : [];
          
        setDashboardData({
          totalPosts: data.totalPosts,
          totalLikes: data.totalLikes,
          totalComments: data.totalComments,
          userPostsLikes: data.userPostsLikes || 0,
          userPostsComments: data.userPostsComments || 0,
          categoryData: processedCategoryData,
          topPosts: data.topPosts || [],
          postPerformanceData: data.postPerformance.map((post, index) => ({
            name: `Post ${index + 1}`,
            title: post.title,
            likes: post.likes,
            comments: post.comments
          }))
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedBlogs();
    fetchSavedBlogs();
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card elevation={3}>
      <CardContent sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Box>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ 
          bgcolor: color, 
          width: 56, 
          height: 56 
        }}>
          <Icon />
        </Avatar>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !dashboardData) {
    return (
      <Container>
        <Typography color="error" variant="h6">
          Error loading dashboard data. Please try again later.
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Blog Dashboard
      </Typography>

      {/* Top Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={Book} 
            title="Total Posts" 
            value={dashboardData.totalPosts} 
            color="primary.light" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={ThumbUp} 
            title="Total Likes" 
            value={dashboardData.totalLikes} 
            color="success.light" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={Comment} 
            title="Total Comments" 
            value={dashboardData.totalComments} 
            color="warning.light" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={ThumbsUp} 
            title="My Likes" 
            value={dashboardData.userPostsLikes} 
            color="info.light" 
          />
        </Grid>
      </Grid>

      {/* Detailed Analytics Section */}
      <Grid container spacing={3}>
        {/* Performance Chart */}
        <Grid item xs={12}>
  <Paper 
    elevation={4} 
    sx={{ 
      p: 3, 
      borderRadius: 3, 
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      background: 'linear-gradient(to right, #ffffff, #f5f9ff)'
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      mb: 3 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.light', 
            mr: 2, 
            width: 48, 
            height: 48,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
          }}
        >
          <TrendingUp sx={{ color: 'primary.dark' }} />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary.dark">
            Your Posts Performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Engagement comparison across your published content
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: 1, 
            bgcolor: '#2196f3', 
            mr: 1 
          }} />
          <Typography variant="body2">Likes</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: 1, 
            bgcolor: '#4caf50', 
            mr: 1 
          }} />
          <Typography variant="body2">Comments</Typography>
        </Box>
      </Box>
    </Box>
    
    <Box sx={{ 
      height: 350, 
      width: '100%', 
      backgroundColor: 'rgba(245, 249, 255, 0.7)',
      borderRadius: 2, 
      p: 2,
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
    }}>
      {dashboardData.postPerformanceData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={dashboardData.postPerformanceData} 
            barGap={12} 
            barSize={35}
            margin={{
              top: 20,
              right: 30,
              left: 10,
              bottom: 10,
            }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 13, fill: '#555', fontWeight: 500 }} 
              axisLine={{ stroke: '#e0e0e0' }} 
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <RechartsTooltip 
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                      backgroundColor: '#fff',
                      maxWidth: 300,
                      border: '1px solid #f0f0f0'
                    }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" gutterBottom>
                        {payload[0].payload.title}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ThumbUp sx={{ fontSize: 18, color: '#2196f3', mr: 0.5 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {payload[0].value} Likes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Comment sx={{ fontSize: 18, color: '#4caf50', mr: 0.5 }} />
                          <Typography variant="body2" fontWeight="medium">
                            {payload[1].value} Comments
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {payload[0].value > payload[1].value 
                          ? 'More likes than comments'
                          : 'More comments than likes'}
                      </Typography>
                    </Paper>
                  );
                }
                return null;
              }} 
            />
            <Bar 
              dataKey="likes" 
              fill="url(#likesGradient)" 
              radius={[6, 6, 0, 0]} 
              name="Likes"
              animationDuration={1500}
              isAnimationActive={true}
            />
            <Bar 
              dataKey="comments" 
              fill="url(#commentsGradient)" 
              radius={[6, 6, 0, 0]} 
              name="Comments"
              animationDuration={1500}
              animationBegin={300}
              isAnimationActive={true}
            />
            <defs>
              <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1976d2" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="commentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#66bb6a" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Box sx={{ mb: 2, opacity: 0.7 }}>
            <TrendingUp sx={{ fontSize: 48, color: 'text.disabled' }} />
          </Box>
          <Typography variant="h6" color="text.secondary">
            No post performance data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Publish more content to see analytics here
          </Typography>
        </Box>
      )}
    </Box>
    
    {dashboardData.postPerformanceData.length > 0 && (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="caption" color="text.secondary">
          {`Showing data for ${dashboardData.postPerformanceData.length} posts`}
        </Typography>
      </Box>
    )}
  </Paper>
</Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PieChartIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Category Distribution</Typography>
            </Box>
            <Box sx={{ height: 300, width: '100%' }}>
              {dashboardData.categoryData && dashboardData.categoryData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography>No category data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Posts Table */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Star sx={{ mr: 2, color: 'warning.main' }} />
              <Typography variant="h6">Top Posts on Platform</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell align="right">Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.topPosts && dashboardData.topPosts.length > 0 ? (
                    dashboardData.topPosts.map((post) => (
                      <TableRow key={post.id} hover>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={post.category} 
                            size="small" 
                            color="warning" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell align="right">{post.likes}</TableCell>
                        <TableCell align="right">{post.comments}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No top posts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Liked Posts Table */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Favorite sx={{ mr: 2, color: 'error.main' }} />
              <Typography variant="h6">Blogs You Liked</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {likedBlogs.length > 0 ? (
                    likedBlogs.map((post) => (
                      <TableRow key={post.id} hover>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={post.category} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>{post.postedBy}</TableCell>
                        <TableCell align="right">{post.likes}</TableCell>
                        <TableCell>{post.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No liked posts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Saved Posts Table */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Bookmark sx={{ mr: 2, color: 'info.main' }} />
              <Typography variant="h6">Blogs You Saved</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedBlogs.length > 0 ? (
                    savedBlogs.map((post) => (
                      <TableRow key={post.id} hover>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={post.category} 
                            size="small" 
                            color="secondary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>{post.postedBy}</TableCell>
                        <TableCell align="right">{post.likes}</TableCell>
                        <TableCell>{post.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No saved posts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BlogDashboard;