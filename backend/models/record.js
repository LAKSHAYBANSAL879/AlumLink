const mongoose = require('mongoose');
const RecordSchema = new mongoose.Schema({
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
    }
});
module.exports = mongoose.model('Record',RecordSchema);