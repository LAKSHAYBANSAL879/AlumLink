const Blog = require("../models/blog");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalPosts = await Blog.countDocuments();
    const totalLikes = await Blog.aggregate([
      { $project: { likesCount: { $size: "$likes" } } }, 
      { $group: { _id: null, total: { $sum: "$likesCount" } } }
    ]);
    const totalComments = await Blog.aggregate([
      { $project: { commentsCount: { $size: "$comments" } } }, 
      { $group: { _id: null, total: { $sum: "$commentsCount" } } }
    ]);
    
    
    const userPostsComments = await Blog.aggregate([
      { $match: { author: userId } },
      { $project: { commentsCount: { $size: "$comments" } } },
      { $group: { _id: null, total: { $sum: "$commentsCount" } } }
    ]);
    
    const userPosts = await Blog.find({ author: userId }).select("title likes comments");
    const userPostsLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);

    const postPerformance = userPosts.map(post => ({
      title: post.title,
      likes: post.likes.length,
      comments: post.comments.length,
    }));
    
    // Categorization (enhanced with color assignment)
    const categoryData = await Blog.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } }
    ]);
    
    // Top posts on the platform (by likes)
    const topPosts = await Blog.aggregate([
      { $project: { 
        title: 1, 
        likesCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        category: 1,
        author: 1,
        createdAt: 1
      }},
      { $sort: { likesCount: -1 } },
      { $limit: 5 }
    ]).exec();
    
    // Populate author information for top posts
    await Blog.populate(topPosts, { path: "author", select: "name email" });
    
    res.json({
      totalPosts,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0,
      userPostsLikes: userPostsLikes || 0,
      userPostsComments: userPostsComments[0]?.total || 0,
      postPerformance,
      categoryData,
      topPosts: topPosts.map(post => ({
        id: post._id,
        title: post.title,
        likes: post.likesCount,
        comments: post.commentsCount,
        category: post.category,
        date: post.createdAt,
        author: post.author?.name || 'Anonymous'
      }))
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: "Error fetching dashboard data" });
  }
};


module.exports = {
  getDashboardStats
};