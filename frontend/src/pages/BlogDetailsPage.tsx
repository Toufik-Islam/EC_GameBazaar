import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Reply,
  Edit,
  Delete,
  Share,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  blogType: string;
  frontpageImage: string;
  images: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  status: string;
  tags: string[];
  views: number;
  likes: string[];
  comments: BlogComment[];
  featured: boolean;
  readTime: number;
  slug: string;
  relatedGames: any[];
  createdAt: string;
  updatedAt: string;
}

interface BlogComment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  likes: string[];
  replies: BlogReply[];
  createdAt: string;
}

interface BlogReply {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  likes: string[];
  createdAt: string;
}

export default function BlogDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; commentId?: string }>({
    open: false,
    type: '',
    id: '',
    commentId: ''
  });

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/blogs/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.message || 'Blog not found');
      }
    } catch (err) {
      setError('Error loading blog');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBlog = async () => {
    if (!user || !token || !blog) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBlog(data.data);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleAddComment = async () => {
    if (!user || !token || !blog || !newComment.trim()) return;
    
    try {
      setCommenting(true);
      const response = await fetch(`/api/blogs/${blog._id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewComment('');
        await fetchBlog(); // Refresh to get updated comments
      } else {
        setError(data.message || 'Failed to add comment');
      }
    } catch (err) {
      setError('Error adding comment');
      console.error('Error adding comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !token || !blog || !newReply.trim()) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newReply.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        setNewReply('');
        setReplyingTo(null);
        await fetchBlog(); // Refresh to get updated comments
      } else {
        setError(data.message || 'Failed to add reply');
      }
    } catch (err) {
      setError('Error adding reply');
      console.error('Error adding reply:', err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !token || !blog || !editContent.trim()) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingComment(null);
        setEditContent('');
        await fetchBlog();
      } else {
        setError(data.message || 'Failed to update comment');
      }
    } catch (err) {
      setError('Error updating comment');
      console.error('Error updating comment:', err);
    }
  };

  const handleEditReply = async (commentId: string, replyId: string) => {
    if (!user || !token || !blog || !editContent.trim()) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}/reply/${replyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editContent.trim() })
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingReply(null);
        setEditContent('');
        await fetchBlog();
      } else {
        setError(data.message || 'Failed to update reply');
      }
    } catch (err) {
      setError('Error updating reply');
      console.error('Error updating reply:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !token || !blog) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBlog();
        setDeleteDialog({ open: false, type: '', id: '', commentId: '' });
      } else {
        setError(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Error deleting comment');
      console.error('Error deleting comment:', err);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!user || !token || !blog) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}/reply/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBlog();
        setDeleteDialog({ open: false, type: '', id: '', commentId: '' });
      } else {
        setError(data.message || 'Failed to delete reply');
      }
    } catch (err) {
      setError('Error deleting reply');
      console.error('Error deleting reply:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user || !token || !blog) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBlog();
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleLikeReply = async (commentId: string, replyId: string) => {
    if (!user || !token || !blog) return;
    
    try {
      const response = await fetch(`/api/blogs/${blog._id}/comment/${commentId}/reply/${replyId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBlog();
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Blog not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/blog')}>
          Back to Blogs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/blog')}
          sx={{ mb: 2 }}
        >
          Back to Blogs
        </Button>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={blog.blogType} 
            color={getBlogTypeColor(blog.blogType)}
            sx={{ mr: 1 }}
          />
          {blog.featured && (
            <Chip label="Featured" color="error" />
          )}
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom>
          {blog.title}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {blog.description}
        </Typography>
        
        {/* Author and Meta Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={blog.author.avatar}>
              {blog.author.name[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {blog.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(blog.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {blog.readTime} min read
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {blog.views} views
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={blog.likes.includes(user?.id || '') ? 'contained' : 'outlined'}
            startIcon={blog.likes.includes(user?.id || '') ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLikeBlog}
            disabled={!user}
          >
            {blog.likes.length} Likes
          </Button>
          <Button
            variant="outlined"
            startIcon={<Comment />}
          >
            {blog.comments.length} Comments
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => navigator.share?.({
              title: blog.title,
              text: blog.description,
              url: window.location.href
            })}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Featured Image */}
          <Box sx={{ mb: 4 }}>
            <img
              src={blog.frontpageImage}
              alt={blog.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </Box>
          
          {/* Blog Content */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.8,
                '& p': { mb: 2 },
                '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 3, mb: 2 },
                '& ul, & ol': { pl: 3 },
                '& blockquote': { 
                  borderLeft: '4px solid #ccc',
                  pl: 2,
                  fontStyle: 'italic',
                  my: 2
                }
              }}
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
            />
          </Paper>
          
          {/* Additional Images */}
          {blog.images && blog.images.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Additional Images
              </Typography>
              <Grid container spacing={2}>
                {blog.images.map((image, index) => (
                  <Grid item xs={6} md={4} key={index}>
                    <img
                      src={image}
                      alt={`${blog.title} - Image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {blog.tags.map((tag, index) => (
                  <Chip key={index} label={tag} variant="outlined" size="small" />
                ))}
              </Box>
            </Paper>
          )}
          
          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Comments ({blog.comments.length})
            </Typography>
            
            {/* Add Comment Form */}
            {user ? (
              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || commenting}
                >
                  {commenting ? <CircularProgress size={24} /> : 'Post Comment'}
                </Button>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 4 }}>
                Please log in to post comments
              </Alert>
            )}
            
            {/* Comments List */}
            {blog.comments.map((comment) => (
              <Box key={comment._id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Avatar src={comment.user.avatar}>
                    {comment.user.name[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {comment.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                    
                    {editingComment === comment._id ? (
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEditComment(comment._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {comment.content}
                      </Typography>
                    )}
                    
                    {/* Comment Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleLikeComment(comment._id)}
                        disabled={!user}
                        color={comment.likes.includes(user?.id || '') ? 'primary' : 'default'}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography variant="caption">
                        {comment.likes.length}
                      </Typography>
                      
                      <Button
                        size="small"
                        startIcon={<Reply />}
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        disabled={!user}
                      >
                        Reply
                      </Button>
                      
                      {user && (user.id === comment.user._id || user.role === 'admin') && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: 'comment',
                              id: comment._id,
                              commentId: ''
                            })}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                    
                    {/* Reply Form */}
                    {replyingTo === comment._id && (
                      <Box sx={{ mb: 3, pl: 2, borderLeft: '2px solid #eee' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Add a reply..."
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAddReply(comment._id)}
                            disabled={!newReply.trim()}
                          >
                            Reply
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setReplyingTo(null);
                              setNewReply('');
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                    
                    {/* Replies */}
                    {comment.replies.map((reply) => (
                      <Box key={reply._id} sx={{ pl: 4, mt: 2, borderLeft: '2px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar src={reply.user.avatar} sx={{ width: 32, height: 32 }}>
                            {reply.user.name[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle2">
                                {reply.user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(reply.createdAt)}
                              </Typography>
                            </Box>
                            
                            {editingReply === reply._id ? (
                              <Box sx={{ mb: 2 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  sx={{ mb: 1 }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleEditReply(comment._id, reply._id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setEditingReply(null);
                                      setEditContent('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {reply.content}
                              </Typography>
                            )}
                            
                            {/* Reply Actions */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleLikeReply(comment._id, reply._id)}
                                disabled={!user}
                                color={reply.likes.includes(user?.id || '') ? 'primary' : 'default'}
                              >
                                <ThumbUp fontSize="small" />
                              </IconButton>
                              <Typography variant="caption">
                                {reply.likes.length}
                              </Typography>
                              
                              {user && (user.id === reply.user._id || user.role === 'admin') && (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingReply(reply._id);
                                      setEditContent(reply.content);
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteDialog({
                                      open: true,
                                      type: 'reply',
                                      id: reply._id,
                                      commentId: comment._id
                                    })}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                {comment !== blog.comments[blog.comments.length - 1] && (
                  <Divider sx={{ mt: 3 }} />
                )}
              </Box>
            ))}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Related Games */}
          {blog.relatedGames && blog.relatedGames.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related Games
              </Typography>
              {blog.relatedGames.map((game) => (
                <Card key={game._id} sx={{ mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={game.images?.[0] || '/placeholder-game.jpg'}
                    alt={game.title}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {game.title}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${game.price}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}
          
          {/* Blog Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Blog Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Views:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {blog.views}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Likes:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {blog.likes.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Comments:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {blog.comments.length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Read Time:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {blog.readTime} min
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, type: '', id: '', commentId: '' })}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', id: '', commentId: '' })}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteDialog.type === 'comment') {
                handleDeleteComment(deleteDialog.id);
              } else if (deleteDialog.type === 'reply') {
                handleDeleteReply(deleteDialog.commentId!, deleteDialog.id);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
