const Blog = require('../models/blog');
const User = require('../models/User');
const Notification = require('../models/notification');

// Create a new blog
const createBlog = async (req, res) => {
    try {
        const { title, subtitle, content, category, author } = req.body;
        const coverPhoto = req.file ? req.file.filename : null;

        const blog = new Blog({ title, subtitle, content, category, coverPhoto, author });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: "Error creating blog" });
    }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate("author");
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: "Error fetching blogs" });
    }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
    try {
        const {blogId}=req.params;
        const blog = await Blog.findById(blogId)
        .populate("author")
        .populate("comments.user"); 
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: "Error fetching blog" });
    }
};

// Update a blog
const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findByIdAndUpdate(blogId, req.body, { new: true });

        if (!blog) return res.status(404).json({ error: "Blog not found" });

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: "Error updating blog" });
    }
};


// Delete a blog
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting blog" });
    }
};

// Add a like to a blog
const addLike = async (req, res) => {
    try {
        const { blogId, userId } = req.body;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (!blog.likes.includes(userId)) {
            blog.likes.push(userId);
            await blog.save();

        }

          const likedBy = await User.findById(userId);
          const blogPoster = blog.author;
              
              const notificationToAuthor = new Notification({
                userId: blogPoster,
                type: 'blog',
                title: blog.title,
                message: `${likedBy.name} liked your blog`,
                sourceId: blog._id,
                refModel: 'Blog',
                sourceName: likedBy.name
              });
              
              const savedAuthorNotification = await notificationToAuthor.save();
              
             
              if (req.app.io) {
                req.app.io.to(`user-${blogPoster}`).emit('new_notification', savedAuthorNotification);
              }
        res.status(200).json({ message: "Blog liked", likes: blog.likes });
    } catch (error) {
        res.status(500).json({ error: "Error liking blog" });
    }
};

// Remove a like from a blog
const removeLike = async (req, res) => {
    try {
        const { blogId, userId } = req.body;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        blog.likes = blog.likes.filter(id => id.toString() !== userId);
        await blog.save();

        res.status(200).json({ message: "Blog unliked", likes: blog.likes });
    } catch (error) {
        res.status(500).json({ error: "Error unliking blog" });
    }
};

// Get all liked posts by a user
const getAllLikedPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const blogs = await Blog.find({ likes: { $in: [userId] } }).populate("author");
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        res.status(500).json({ error: "Error fetching liked posts" });
    }
};


// Add a comment to a blog
const addComment = async (req, res) => {
    try {
        const {blogId}=req.params;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        const comment = { user: req.body.userId, comment: req.body.text };
        blog.comments.push(comment);
        await blog.save();
        res.status(200).json(blog);

        const commentBy = await User.findById(comment?.user);
        const blogPoster = blog.author;
            
            const notificationToAuthor = new Notification({
              userId: blogPoster,
              type: 'blog',
              title: blog.title,
              message: `${commentBy.name} commented on your blog`,
              sourceId: blog._id,
              refModel: 'Blog',
              sourceName: commentBy.name
            });
            
            const savedAuthorNotification = await notificationToAuthor.save();
            
           
            if (req.app.io) {
              req.app.io.to(`user-${blogPoster}`).emit('new_notification', savedAuthorNotification);
            }

    } catch (error) {
        res.status(500).json({ error: "Error commenting on blog" });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    addLike,
    removeLike,
    getAllLikedPosts,
    addComment
};
