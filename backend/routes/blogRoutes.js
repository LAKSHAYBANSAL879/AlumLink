const express = require("express");
const multer = require("multer");
const path = require("path");
const blogController = require("../controllers/blogController");
const blogDashboard=require('../controllers/blogDashboardController');

const router = express.Router();

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/blogs"); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp","image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });

// Blog routes
router.post("/create", upload.single("coverPhoto"), blogController.createBlog);
router.get("/allBlogs", blogController.getAllBlogs);
router.get("/:blogId", blogController.getBlogById);
router.put("/update/:blogId", blogController.updateBlog);
router.delete("/delete/:id", blogController.deleteBlog);
router.post("/addLike", blogController.addLike);
router.post("/removeLike", blogController.removeLike);
router.get("/getLikedBlogs/:userId", blogController.getAllLikedPosts);

router.post("/:blogId/addComment", blogController.addComment);
router.use('/uploadss',express.static('uploads/blogs'))

router.get('/dashboardStats/:userId',blogDashboard.getDashboardStats);

module.exports = router;
