var express = require('express');
var router = express.Router();
var passport=require('passport');
var Product=require('../models/product');
var Cart=require('../models/cart');
var Order =require('../models/order');
/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg=req.flash('success')[0];
  Product.find(function(err,docs){
    var productChunk=[];
    var chunksize=3;
    for(var i=0; i<docs.length; i+=chunksize ){
      productChunk.push(docs.slice(i,i+chunksize));
    }
    res.render('shop/index', { title: 'shopping cart',products:productChunk,successMsg:successMsg,noMessages :!successMsg });
  });

});

router.get('/add-to-cart/:id',function(req,res,next){
  var productId=req.params.id;
  var cart=new Cart(req.session.cart ? req.session.cart: {items:{}});
  Product.findById(productId,function(err,product){
    if(err){
       return res.redirect('/');
    }
    cart.add(product,product.id);
    req.session.cart=cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});


router.get('/shopping-cart',function(req,res,next){
  if(!req.session.cart){
    return res.render('shop/shopping-cart',{products:null});
  }
  var cart=new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});

})
router.get('/checkout',isLoggedIn,function(req,res,next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart=new Cart(req.session.cart);
  var errMsg=req.flash('error')[0];
  res.render('shop/checkout',{total:cart.totalPrice,errMsg,noError:!errMsg});
})

router.post('/checkout',isLoggedIn,function(req,res,next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart=new Cart(req.session.cart);
  var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
    //  paymentId: charge.id
  });
  order.save(function(err, result) {
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.redirect('/');
  });
})
  // req.flash('successfully bought!');
  //   req.session.cart=null;
  //   res.redirect('/');
  //   })
//   var stripe= require("stripe") (
//   "sk_test_pweF4BTjmx6qkT3WgvKUK04"
// );

    //stripe.charges.create({
  //   amount:cart.totalPrice*100,
  //   currency:"usd",
  //   source:req.body.stripeToken,
  //   description:"chare for test@example.com"
  //
  // },function(err,charge){
  //     if(err)
  //     {
  //       req.flash('error',err.message);
  //       return res.redirect('/checkout');
  //     }
  //     req.req.flash('successfully bought!');
  //     req.cart=null;
  //     res.redirect('/');
  // })

module.exports = router;
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.oldUrl=req.url;
  res.redirect('/user/signin');
}
