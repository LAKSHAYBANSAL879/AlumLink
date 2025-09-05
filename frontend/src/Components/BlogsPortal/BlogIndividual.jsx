import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bookmark, Share, Heart, MessageSquare, X, Copy } from 'lucide-react';
import { Avatar } from '@mui/material';
import { Facebook, Twitter, WhatsApp } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { UserContext } from '../../userContext';
import CodeBlockHighlighter from './CodeBlockHighlighter';

const BlogIndividual = () => {
  const [blog, setBlog] = useState(null);
  const [allBlogs,setAllBlogs]=useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {user} = useContext(UserContext)
  const [blogInteractions, setBlogInteractions] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const dropdownRef = useRef(null);
  const { blogId } = useParams();

  const shareUrl = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("Check out this fascinating article about Irish traditions!");

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${text} ${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
  };

  useEffect(() => {
    if (blogId) {
      fetchBlogDetails();
    }
    fetchBlogs();
handleCommentSubmit();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  },[user,blogId]);

  useEffect(() => {
    if (allBlogs.length > 0) { 
      // console.log("Calling fetchRecommendations with allBlogs:", allBlogs);
      fetchSimilarBlogs()
    }
  }, [allBlogs]); 
  // console.log("Saved Blogs:", user?.savedBlogs);/
const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/blogs/allBlogs');

      setAllBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    }
  };

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/v1/blogs/${blogId}`);
      setBlog(response.data);
      // Initialize blog interactions
      setBlogInteractions(prev => ({
        ...prev,
        [blogId]: {
          liked: user && response.data.likes 
          ? response.data.likes.some(like => String(like) === String(user._id))
          : false,
          likeCount: response.data.likes.length,
          saved: user?.savedBlogs?.includes(blogId)
        }
      }));
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog details');
      toast.error('Unable to fetch blog details');
    } finally {
      setLoading(false);
    }
  };



  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
  
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/blogs/${blogId}/addcomment`,
        {
          userId: user._id, 
          text: commentText,
        }
      );
  
      setBlog(response.data); 
      setCommentText(''); 
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like a blog');
      return;
    }
  
    const isLiked = blogInteractions[blogId]?.liked;
  
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/blogs/${isLiked ? 'removeLike' : 'addLike'}`,
        { blogId, userId: user._id }
      );
  
      setBlogInteractions(prev => ({
        ...prev,
        [blogId]: {
          ...prev[blogId],
          liked: !isLiked, 
          likeCount: response.data.likes.length
        }
      }));
  
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please log in to save a blog');
      return;
    }

    try {
      const isSaved = blogInteractions[blogId]?.saved;
      const url = isSaved 
        ? 'http://localhost:8080/api/v1/auth/unsaveBlog'
        : 'http://localhost:8080/api/v1/auth/saveBlog';

      await axios.post(url, { 
        blogId, 
        userId: user._id 
      });

      setBlogInteractions(prev => ({
        ...prev,
        [blogId]: {
          ...prev[blogId],
          saved: !isSaved
        }
      }));

      toast.success(isSaved ? 'Blog unsaved' : 'Blog saved');
    } catch (error) {
      console.error('Error saving/unsaving blog:', error);
      toast.error('Failed to save/unsave blog');
    }
  };
  const fetchSimilarBlogs = async () => {
    // setIsLoading(true);
    try {
      // Prepare blogs for recommendation
      const processedAllBlogs = allBlogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        subtitle: blog.subtitle,
        category: blog.category,
        content: blog.content,
        authorName:blog.author.name
      }));

      // Call similar blogs endpoint
      const response = await axios.post('https://alumlinkpythoncode.onrender.com/get_similar_blogs', {
        all_blogs: processedAllBlogs,
        blog_id: blogId,
        top_n: 5
      });

      // Process similar blogs
      const processedSimilarBlogs = response.data.map(blog => {
        // Find the original blog to get full details
        const originalBlog = allBlogs.find(b => b._id === blog.id) || {};
        
        return {
          ...originalBlog,
          ...blog,
          _id: blog.id,
          id: blog.id,
          timeAgo: formatTimeAgo(originalBlog.createdAt || new Date()),
          categories: ['all', 'similar', blog.category || 'other'],
          author: originalBlog.author || {
          name: blog.authorName || 'Anonymous'
          }
        };
      });

     setRecommendedBlogs(processedSimilarBlogs);
    } catch (error) {
      console.error('Error fetching similar blogs:', error);
      toast.error('Failed to fetch similar blogs');
      return [];
    } finally {
      // setIsLoading(false);
    }
  };
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center py-10">No blog found</div>;
  }

  // console.log("blog html content is ",blog?.content);
  return (
    <div className="mx-auto p-6 bg-white">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Recommended Blogs - Left Sidebar */}
        <div className="w-full lg:w-1/4 order-2 lg:order-1">
          <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-xl mb-5 text-gray-800">Recommended Blogs</h3>
            
            <div className="space-y-4">
              {recommendedBlogs.map((item, index) => (
                <Link to={`/blogIndi/${item.id}`} key={index}>
                <div className="group cursor-pointer border-b-2 border-b-gray-300 last:border-b-0">
                  <div className="flex flex-col text-left justify-start align-baseline pb-4 transition duration-200 hover:bg-gray-200 p-3">
                    <div className="flex gap-2 text- justify-start mb-2 items-center">
                      <Avatar src={item.authorName} alt={item.authorName}/>
                      <span className="font-medium text-gray-700">{item.authorName}</span>
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-800 group-hover:text-green-600 transition-colors">{item.title}</h4>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{item.subtitle}</span>
                      {/* <span className="w-1 h-1 bg-gray-400 rounded-full"></span> */}
                      {/* <span>{item.date}</span> */}
                    </div>
                  </div>
                </div>
                </Link>
              ))}
            </div>
            
            <button className="w-full mt-5 py-2.5 border border-green-600 text-green-600 rounded-full hover:bg-green-50 font-medium transition duration-200 text-sm">
              See more recommendations
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-1/2 flex flex-col order-1 lg:order-2">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{blog.title}</h1>
          
          <h2 className="text-xl text-gray-600 mb-6">{blog.subtitle}</h2>
          
          <div className="flex items-center text-left gap-4 mb-6">
            <Avatar src={blog.author?.name} alt={blog.author?.name} className="w-full h-full object-cover" />
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{blog?.author?.name}</span>
              </div>
              
              <div className="text-sm text-gray-500 flex flex-wrap items-center  gap-x-1">
                <span>Published By</span>
                <span className="text-gray-700 font-medium">{blog?.author?.name}</span>
                <span className="text-gray-400 mx-1">·</span>
                <span>3 min read</span>
                <span className="text-gray-400 mx-1">·</span>
                <span>{formatTimeAgo(blog?.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-8 pb-5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
                onClick={handleLike}
              >
                <Heart 
                  size={22} 
                  className={blogInteractions[blogId]?.liked ? "text-red-500 fill-red-500" : "text-gray-600"} 
                />
              </button>
              <span className="text-gray-700 font-medium">{blogInteractions[blogId]?.likeCount || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className={`p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none ${showComments ? 'bg-gray-100' : ''}`}
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare 
                  size={22} 
                  className={showComments ? "text-green-600" : "text-gray-600"} 
                />
              </button>
              <span className="text-gray-700 font-medium">{blog?.comments.length}</span>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center gap-4">
              <button 
                className={`p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none flex items-center gap-1.5 ${blogInteractions[blogId]?.saved ? 'bg-blue-50' : ''}`}
                onClick={handleSave}
              >
                <Bookmark
                  size={20}
                  className={blogInteractions[blogId]?.saved ? "text-blue-600 fill-blue-600" : "text-gray-600"} 
                />
                <span className={`text-sm ${blogInteractions[blogId]?.saved ? 'text-blue-600' : 'text-gray-600'} font-medium`}>Save</span>
              </button>
              
              {/* Share Button and Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className={`p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none flex items-center gap-1.5 ${isOpen ? 'bg-gray-100' : ''}`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <Share size={20} className={isOpen ? "text-green-600" : "text-gray-600"} />
                  <span className={`text-sm ${isOpen ? 'text-green-600' : 'text-gray-600'} font-medium`}>Share</span>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10 py-2 overflow-hidden transition-all duration-200 ease-in-out">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Share this article</h3>
                    </div>
                    
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition duration-150"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <Copy size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium">Copy link</span>
                        {copySuccess && <span className="text-green-500 text-xs block">✓ Copied to clipboard!</span>}
                      </div>
                    </button>
                    
                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition duration-150"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center mr-3">
                        <Twitter className="text-white" style={{ fontSize: '16px' }} />
                      </div>
                      <span className="text-gray-800 font-medium">Share on X</span>
                    </a>
                    
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition duration-150"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                        <Facebook className="text-white" style={{ fontSize: '16px' }} />
                      </div>
                      <span className="text-gray-800 font-medium">Share on Facebook</span>
                    </a>
                    
                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition duration-150"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                        <WhatsApp className="text-white" style={{ fontSize: '16px' }} />
                      </div>
                      <span className="text-gray-800 font-medium">Share on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Blog Content */}
          <div className="prose max-w-none mb-8 text-gray-800">
          <CodeBlockHighlighter blogId={blog?._id} />
          </div>
          
          {/* Author info and tags */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <div className="flex items-center gap-4 mb-4">
              {/* <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center"> */}
                <Avatar src={blog?.author?.name} className="text-white font-bold text-lg"></Avatar>
              {/* </div> */}
              <div className='flex flex-col text-left'>
                <h4 className="font-semibold">{blog.author?.name}</h4>
                <p className="text-sm text-gray-600">Published in AlumLink</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              
                <span 
                 
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                >
                  {blog.category}
                </span>
              
            </div>
          </div>
        </div>
        
        {/* Comments Section - Right Sidebar */}
        {showComments && (
          <div className="w-full lg:w-80 shrink-0 order-3 relative">
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-xl text-gray-800">Comments ({blog?.comments.length})</h3>
                <button 
                  className="p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
                  onClick={() => setShowComments(false)}
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-5 mb-5 max-h-96 overflow-y-auto pr-1 ">
                {blog?.comments.map((comment) => (
                  <div key={comment.id} className="pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex gap-3 mb-2">
                    <Avatar src={comment?.user?.name} alt={comment?.user?.name} className="w-full h-full object-cover" />
                      <div className='flex flex-col text-left'>
                        <div className="flex items-center gap-2 text-left justify-start">
                          <span className="font-medium text-base text-gray-800">{comment.user?.name}</span>
                          <span className="text-xs font-light text-gray-700">{formatTimeAgo(comment?.date)}</span>
                        </div>
                        <p className="text-sm mt-1 font-normal text-gray-700">{comment?.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:border-green-500 focus:ring focus:ring-green-100 focus:outline-none transition resize-none"
                  rows="3"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <button 
                  className="px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition focus:outline-none focus:ring focus:ring-green-200 font-medium text-sm"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || !user}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogIndividual;