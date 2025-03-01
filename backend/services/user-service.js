// const userRepository = require('../repository/user-repository');
// const recordRepository = require('../repository/record-repository');
// const bcrypt = require('bcrypt');
// // const registerUser = async({name,email,password,enrollmentNumber,yearOfPassout,collegeName,mobileNumber,role})=>{
//     const registerUser = async(userData)=>{
//     const profilePicture = req.file ? req.file.path : null;
//     if(userData.role==="admin")
//     {
//         const existingAdmin = await userRepository.findAdmin();
//         if(existingAdmin){
//             throw new Error('An admin already exist');

//         }
//         return userRepository.createUser(userData);
//     }
//     const Record = await recordRepository.findByEnrollmentAndYear(userData.enrollmentNumber,userData.yearOfPassout);
//     if(!Record){
//         throw new Error('Enrollment number and year of passout did not match the records');
//     }
//     const existingUser = await userRepository.findByEnrollmentNumber(userData.enrollmentNumber);
//     if(existingUser){
//         throw new Error('User Is Already Registered');
//     }
//     return userRepository.createUser(userData);

// }
// const loginUser = async({enrollmentNumber,password})=>{
//     const user = await userRepository.findByEnrollmentNumber(enrollmentNumber);
    
//     if(!user){
//         throw new Error('User Not Found');
//     }
//     const isMatch = await bcrypt.compare(password,user.password);
//     if(!isMatch){  
//         throw new Error('Invalid Credentials');
//     }
//     return user;
// };


// module.exports = {
//     registerUser,
//     loginUser
// };