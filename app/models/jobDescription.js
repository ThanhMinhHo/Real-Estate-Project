var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User Mongoose Schema
var jobDescriptionSchema = new Schema({
    id: { type: String, required: true},
    title: { type: String, required: true},
    location: { type: String, required: true},
    jobCategory: { type: String, required: true},
    jobtype: { type: String, required: true},
    salary: { type: String, required: true, },
    keyPoint: { type: String, required: true, },
    jobSumary: { type: String, required: true, },
    role: { type: String, required: true, },
   
});

module.exports = mongoose.model('JobDescription',jobDescriptionSchema);