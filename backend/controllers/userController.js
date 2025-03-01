const User = require('../models/User'); 
const Job=require('../models/job')
const Record = require('../models/Record');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer=require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'lbansal879880@gmail.com',
    pass: 'tajuooanjzkslnnn'
  }
});


exports.registerUser = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            enrollmentNumber, 
            yearOfPassout, 
            collegeName, 
            mobileNumber, 
            currentSemester, 
            branch, 
            workingOrganisation, 
            position, 
            role 
        } = req.body;

        
        if (role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount > 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'An admin already exists. Cannot register a new admin.' 
                });
            }
        }

        const record = await Record.findOne({ enrollmentNumber });
        if (!record) {
            return res.status(400).json({ 
                success: false, 
                message: 'Enrollment number does not exist in the record database.' 
            });
        }

       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered.' 
            });
        }

        
        const profileImageUrl = req.file ? req.file.filename : null;

       
        const user = await User.create({
            name,
            email,
            password,
            enrollmentNumber,
            yearOfPassout,
            collegeName,
            mobileNumber,
            currentSemester,
            branch,
            workingOrganisation,
            position,
            role,
            profileImageUrl
        });

        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.signin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }
  
      const token = jwt.sign({ userId: user._id,name: user.name  }, process.env.SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({
        success: true,
        message: 'User signed in successfully',
        token,
        user,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User already registered with this email',
        });
      } else {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  };
  
  exports.googleLogin = async (req, res) => {
    try {
      const { email} = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }
  
      const token = jwt.sign({ userId: user._id,name: user.name  }, process.env.SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({
        success: true,
        message: 'User signed in successfully',
        token,
        user,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User already registered with this email',
        });
      } else {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
  };
  
// Logout User
exports.userLogout = (req, res, next) => {
    try {
      const cookieOptions = {
        expires: new Date(0), 
        httpOnly: true,
      };
  
      res.cookie("token", null, cookieOptions);
      
      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// Get Single User
exports.getuser = async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      return res.status(200).send({
        success: true,
        message: "User Fetched Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "unable to get current user",
        error,
      });
    }
};
// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getUniqueCollegeNames = async (req, res) => {
    try {
      
      const collegeNames = await Record.distinct('collegeName');
      
      res.status(200).json({
        success: true,
        data: collegeNames,
      });
    } catch (error) {
      console.error('Error fetching unique college names:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch college names',
        error: error.message,
      });
    }
  };
  exports.updateUser = async (req, res) => {
    try {
      // const { userId } = req.context; 
      const { name, phone,workingOrganisation,position,currentSemester,branch } = req.body;
      const user = await User.findOne({ _id: req.body.userId });
      
      let profileImageUrl;
      if (req.file) {
        profileImageUrl = req.file.filename;
      }
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      user.name = name || user.name;
      user.workingOrganisation = workingOrganisation || user.workingOrganisation;
      user.phone = phone || user.phone;
      user.position = position || user.position;
      user.currentSemester = currentSemester || user.currentSemester; 
      user.branch = branch || user.branch; 

      
      if (profileImageUrl) {
        user.profileImageUrl = profileImageUrl;
      }
  
     
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        data: { user },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  exports.forgotPassword = async (req, res, next) => {
    const email = req.body.email;
  
    // return response with error message if email is undefined
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
  
    try {
      // retrieve user using the given email.
      const user = await User.findOne({ email });
  
      // return response with error message if user not found
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found"
        });
      }
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Hash OTP and set it with expiry
      user.forgotPasswordToken = crypto.createHash("sha256").update(otp).digest("hex");
      user.forgotPasswordExpiryDate = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  
      await user.save();
  
      // Send OTP via email
      const mailOptions = {
        from: 'lbansal879880@gmail.com',
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is ${otp}. This OTP is valid for 10 minutes.`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          return res.status(500).json({
            success: false,
            message: 'Error sending OTP email'
          });
        }
        console.log('Email sent: ' + info.response);
      });
  
      return res.status(200).json({
        success: true,
        message: "OTP sent to your email"
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  exports.resetPassword = async (req, res) => {
    const { otp, password } = req.body;
    console.log('OTP:', otp);
    console.log('New Password:', password);
  
    // Return error message if OTP or password is missing
    if (!otp || !password) {
      return res.status(400).json({
        success: false,
        message: "OTP and new password are required"
      });
    }
  
    const hashToken = crypto.createHash("sha256").update(otp).digest("hex");
  
    try {
      // Find the user using the hashed OTP and check the expiration date
      const user = await User.findOne({
        forgotPasswordToken: hashToken,
        forgotPasswordExpiryDate: {
          $gt: new Date() // forgotPasswordExpiryDate greater than the current date
        }
      });
  
      // Return the message if user not found
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP or OTP is expired"
        });
      }
  
      // Update the user's password and save to the database
      user.password = password;
      // Clear the OTP and expiry date fields
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiryDate = undefined;
  
      await user.save();
  
      // Log success message and send the response
      console.log('Password successfully reset for user:', user.email);
      return res.status(200).json({
        success: true,
        message: "Successfully reset the password"
      });
    } catch (error) {
      // Log the error and send an error response
      console.error('Error resetting password:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };  
  exports.saveJob = async (req, res) => {
    try {
        const { jobId, userId } = req.body;
       

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if already saved
        if (user.savedJobs.includes(jobId)) {
            return res.status(400).json({ message: 'Job already saved' });
        }

        user.savedJobs.push(jobId);
        await user.save();

        res.status(200).json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Remove a job from saved jobs
exports.unsaveJob = async (req, res) => {
    try {
        const { jobId,userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
        await user.save();

        res.status(200).json({ message: 'Job removed from saved jobs', savedJobs: user.savedJobs });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get all saved jobs for a user

exports.getSavedJobs = async (req, res) => {
    try {
        const {userId} = req.body;

        const user = await User.findById(userId).populate('savedJobs');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ savedJobs: user.savedJobs });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};