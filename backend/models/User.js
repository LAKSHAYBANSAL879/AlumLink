const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //stroing password important credentials in hashed manner
const salt=require('salt')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true
    },
    yearOfPassout:{
        type: Number,
        required: true
    },
    collegeName:{
        type: String,
        required: true
    },
    mobileNumber:{
        type: String,
        required: true
    },
    currentSemester:{
        type: Number
    },
    branch:{
        type:String
    },
    workingOrganisation:{
        type: String
    },
    position:{
type:String
    },
    role: {
        type: String,
        enum: ['student','alumini','admin'],
        required: true
    },
    forgotPasswordToken: {
        type: String
      },
      profileImageUrl: {
        type: String,
      },
      forgotPasswordExpiryDate: {
        type: Date
      },
    isVerifiedAlumini:{
        type: Boolean,
        default: false
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    savedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
    online: {
      type: Boolean,
      default: false
  },
  contacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }],
});
userSchema.pre('save',async function (next){
    if(!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});
userSchema.methods = {
    jwtToken() {
      return jwt.sign(
        {
          id: this._id,
          email: this.email,
          role: this.role
        },
        process.env.SECRET,
        { expiresIn: '96h' }
      );
    },
    getForgotPasswordToken() {
      const forgotToken = crypto.randomBytes(20).toString('hex');
      // Step 1 - save to DB
      this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(forgotToken)
        .digest('hex');
  
      // Forgot password expiry date
      this.forgotPasswordExpiryDate = Date.now() + 120 * 60 * 1000;
  
      // Step 2 - return values to user
      return forgotToken;
    }
  };
  
  // Ensure only one admin exists
  userSchema.statics.ensureAdminExists = async function () {
    const adminCount = await this.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      // Create a default admin
      await this.create({
        name: 'Lakshay Bansal',
        email: 'lakshaybansal879@gmail.com',
        password: 'lb879',
        collegeName:"xyz", 
        mobileNumber: '9205869712',
        role: 'admin',
        yearOfPassout:1,
        enrollmentNumber:"EN1111"
      });
    }
  };
  
module.exports = mongoose.model('User',userSchema);