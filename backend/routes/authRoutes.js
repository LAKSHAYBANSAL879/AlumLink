const express = require('express');
const upload = require('../middlewares/upload');
const userController = require('../controllers/userController');
const jwtAuth = require('../middlewares/jwtAuth');
const router = express.Router();
router.post('/register',upload.single('profileImageUrl'),userController.registerUser);
router.post('/signin',userController.signin);
router.post('/googleLogin',userController.googleLogin);
router.put('/update',upload.single('profileImageUrl'),jwtAuth,userController.updateUser);
router.get('/getUser',jwtAuth,userController.getuser);
router.get('/allUsers',userController.getAllUsers);
router.get('/clgNames',userController.getUniqueCollegeNames);
router.use('/uploadss',express.static('uploads'))
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/saveJob', userController.saveJob);
router.post('/unsaveJob', userController.unsaveJob);
router.post('/getSavedJobs', userController.getSavedJobs);
router.post('/saveBlog', userController.saveBlog);
router.post('/unsaveBlog', userController.unsaveBlog);
router.get('/getSavedBlogs/:userId', userController.getSavedBlogs);
router.post('/logout/:userId',userController.userLogout);



module.exports = router;
