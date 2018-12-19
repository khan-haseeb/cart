var mongoose=require('mongoose');
const validator = require('validator');

var Schema=mongoose.Schema;
var bcrypt=require('bcrypt-nodejs');

var userSchema = new Schema({
  email:
     {
       type:String,
       required:true,
      validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    },
},
  password:{type:String,required:true,minlength:4}
});
userSchema.methods.encryptpassword=function(password){
  return bcrypt.hashSync(password,bcrypt.genSaltSync(5),null);
}

userSchema.methods.validPassword=function(password){
  return bcrypt.compareSync(password,this.password);
}
module.exports=mongoose.model('User',userSchema);
