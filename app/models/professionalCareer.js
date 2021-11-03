var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// User Mongoose Schema
var professionalCareer = new Schema({
    userID: { type: String, required: true},
    personalBrand: { type: String, required: true},
    phone: { type: String, required: true},
    companyName: { type: String, required: true},
    education: { type: String, required: true},
});

module.exports = mongoose.model('ProfessionalCareer',professionalCareer);

