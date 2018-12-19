var express = require('express');
var router = express.Router();
var passport=require('passport');
var Product=require('../models/product');
var Cart=require('../models/cart');
var Order =require('../models/order');

router.get('/profile', isLoggedIn, function (req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    });
});

router.get('/logout',isLoggedIn,function(req,res,next){
  req.logout();
  res.redirect('/');
})

router.use('/',notLoggedIn,function(req,res,next){
  next();
})

router.get('/signup',function(req,res,next){
  var messages=req.flash('error');
  res.render('user/signup',{messages:messages,hasErrors:messages.length >0});
  // ,{csrfToken:req.csrfToken()}
});

router.post('/signup',passport.authenticate('local.signup',{
//  successRedirect:'/user/profile',
  failureRedirect:'/user/signup',
  failureFlash:true
}),function(req,res,next){
  if(req.session.oldUrl){
    var oldUrl=req.session.oldUrl
    req.session.oldUrl=null;
    res.redirect(oldUrl);

  }else {
    res.redirect('/user/profile');
  }
})


router.get('/signin',function(req,res,next){
  var messages=req.flash('error');
  res.render('user/signin',{messages:messages,hasErrors:messages.length >0});
});

router.post('/signin',passport.authenticate('local.signin',{
  //successRedirect:'/user/profile',
  failureRedirect:'/user/signin',
  failureFlash:true
}),function(req,res,next){
  if(req.session.oldUrl){
    var oldUrl=req.session.oldUrl
    req.session.oldUrl=null;
    res.redirect(oldUrl);
  }else {
    res.redirect('/user/profile');
  }
});





module.exports = router;

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req,res,next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
