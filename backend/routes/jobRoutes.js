const express = require('express');
const jobController = require('../controllers/jobController');
const auth = require('../middlewares/auth');
const verifyAlumni=require("../middlewares/verifyAlumini");
const jwtAuth = require('../middlewares/jwtAuth');
const upload = require('../middlewares/upload');
const router = express.Router();
router.post('/post',jobController.postJob);
router.get('/applied',jwtAuth,jobController.getUserAppliedJobs);
router.get('/:jobId/applicants',jwtAuth,jobController.getJobApplicants);
router.get('/all',jobController.getAllJobs);
router.get('/:jobId',jobController.getJobById);
router.post('/checkUserApplied', jobController.checkUserApplied);
router.post('/getPostedJobs', jobController.getPostedJobs);



module.exports = router;
