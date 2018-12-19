var passport=require('passport');
var User=require('../models/user');
var localStrategy=require('passport-local').Strategy;
const validator = require('validator');
passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id,function(err,user){
    done(err,user);
  })
});

passport.use('local.signup',new localStrategy({
  usernameField:'email',
  passwordField:'password',
  passReqtoCallback:true
},function(email,password,done){

  User.findOne({'email':email},function(err,user){
    if(err){
      return done(err);
    }

    if(user){
      return done(null,false,{message:'email is already in use'});
    }
    var newUser=new User();
    newUser.email=email;
    newUser.password=newUser.encryptpassword(password);
    newUser.save(function(err,result){
      if(!err){
      //  return done(err);
      return  done(null,newUser);
      }

    });
  });
}))

passport.use('local.signin',new localStrategy({
  usernameField:'email',
  passwordField:'password',
  passReqtoCallback:true
},function(email,password,done){

  User.findOne({'email':email},function(err,user){
    if(err){
      return done(err);
    }

    if(!user){
      return done(null,false,{message:'no user found'});
    }

    if(!user.validPassword(password)){
       return done(null,false,{message:'wrong password'});
    }
   return done(null,user);

    });
  }));
