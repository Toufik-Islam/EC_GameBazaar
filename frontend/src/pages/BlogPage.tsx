import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import { Search, Visibility, ThumbUp, Comment, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  blogType: string;
  frontpageImage: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: string;
  tags: string[];
  views: number;
  likes: string[];
  comments: any[];
  featured: boolean;
  readTime: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

const BLOG_TYPES = [
  'All',
  'Game News',
  'Gaming Tips',
  'Installation Troubleshooting',
  'Game Reviews',
  'Industry Updates',
  'Hardware & Tech',
  'Game Guides',
  'Gaming Culture'
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1);
    if (newValue === 0) {
      setSelectedCategory('All');
      fetchBlogs();
    } else if (newValue === 1) {
      fetchFeaturedBlogs();
    }
  };

  const fetchBlogs = async (page = 1, category = 'All', search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/blogs?page=${page}&limit=9`;
      
      if (category !== 'All') {
        url += `&blogType=${encodeURIComponent(category)}`;
      }
      
      if (search.trim()) {
        url = `/api/blogs/search?q=${encodeURIComponent(search)}&page=${page}&limit=9`;
        if (category !== 'All') {
          url += `&blogType=${encodeURIComponent(category)}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data);
        setTotalPages(Math.ceil((data.total || data.count) / 9));
        setTotalBlogs(data.total || data.count);
      } else {
        setError(data.message || 'Failed to fetch blogs');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/blogs/featured?limit=6');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedBlogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch featured blogs');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching featured blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchBlogs(currentPage, selectedCategory, searchTerm);
    } else {
      fetchFeaturedBlogs();
    }
  }, [currentPage, selectedCategory, tabValue]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
    fetchBlogs(1, selectedCategory, searchTerm);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchBlogs(1, category, searchTerm);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBlogTypeColor = (type: string) => {
    const colors: { [key: string]: any } = {
      'Game News': 'primary',
      'Gaming Tips': 'secondary',
      'Installation Guide': 'success',
      'Troubleshooting': 'warning',
      'Review': 'info',
      'General': 'default'
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BlogCard = ({ blog }: { blog: Blog }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={blog.frontpageImage || '/placeholder-blog.jpg'}
        alt={blog.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={blog.blogType} 
            color={getBlogTypeColor(blog.blogType)}
            size="small"
            sx={{ mb: 1 }}
          />
          {blog.featured && (
            <Chip 
              label="Featured" 
              color="error"
              size="small"
              sx={{ ml: 1, mb: 1 }}
            />
          )}
        </Box>
        
        <Typography gutterBottom variant="h6" component="h2" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '3.5em'
        }}>
          {blog.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          mb: 2
        }}>
          {blog.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={blog.author.avatar}
            sx={{ width: 24, height: 24, mr: 1 }}
          >
            {blog.author.name[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {blog.author.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {blog.readTime} min read
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Visibility fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {blog.views}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          {formatDate(blog.createdAt)}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          variant="contained"
          onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
          fullWidth
        >
          Read More
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        GameBazaar Blog
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Game news, tips, installation guides, and troubleshooting
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="All Blogs" />
          <Tab label="Featured" />
        </Tabs>
      </Box>

      {/* Search and Filter Controls */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                />
              </form>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {BLOG_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                onClick={() => handleSearch({ preventDefault: () => {} } as any)}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          {totalBlogs > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing {blogs.length} of {totalBlogs} blogs
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </Typography>
          )}
        </Paper>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Blog Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {(tabValue === 0 ? blogs : featuredBlogs).map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <BlogCard blog={blog} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {!loading && blogs.length === 0 && tabValue === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No blogs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or category filter
          </Typography>
        </Paper>
      )}

      {!loading && featuredBlogs.length === 0 && tabValue === 1 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No featured blogs available
          </Typography>
        </Paper>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && tabValue === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
}
