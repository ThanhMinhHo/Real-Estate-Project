var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");
// User Mongoose Schema
var EmployeerSchema = new Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    businessName: { type: String, required: true},
    phoneNumber: { type: String, required: true},
    email: { type: String, required: true, lowercase: true},
});
EmployeerSchema.pre('save', function(next) {
    var user = this;
    //using bcriypt to encript the password
    bcrypt.hash(user.password, null, null, function(err, hash) {
        user.password = hash;
         
    next();
    });
  });
  
  EmployeerSchema.methods.ComparePassword = function(passwordToCompare)
  {
      return bcrypt.compareSync(passwordToCompare,this.password);
  }




module.exports = mongoose.model('Employeer',EmployeerSchema);