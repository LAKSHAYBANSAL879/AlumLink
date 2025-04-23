const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const blogController = require("../controllers/blogController");
const blogDashboard = require('../controllers/blogDashboardController');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blogs",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, crop: "limit" }], 
    format: async (req, file) => {
      if (file.mimetype.includes('jpeg') || file.mimetype.includes('jpg')) return 'jpg';
      if (file.mimetype.includes('png')) return 'png';
      if (file.mimetype.includes('gif')) return 'gif';
      if (file.mimetype.includes('webp')) return 'webp';
      return 'jpg'; 
    },
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."), false);
  }
};


const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Blog routes
router.post("/create", upload.single("coverPhoto"), blogController.createBlog);
router.get("/allBlogs", blogController.getAllBlogs);
router.get("/:blogId", blogController.getBlogById);
router.put("/update/:blogId", upload.single("coverPhoto"), blogController.updateBlog); 
router.delete("/delete/:id", blogController.deleteBlog);
router.post("/addLike", blogController.addLike);
router.post("/removeLike", blogController.removeLike);
router.get("/getLikedBlogs/:userId", blogController.getAllLikedPosts);
router.post("/:blogId/addComment", blogController.addComment);
router.get('/dashboardStats/:userId', blogDashboard.getDashboardStats);


router.use('/uploadss', express.static('uploads/blogs'));

module.exports = router;