var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var indexRouter = require('./routes/index');
var mongoose=require('mongoose');
var session=require('express-session');
//var csrf=require('csurf');
var passport=require('passport');
var bcrypt=require('bcrypt-nodejs');
var flash=require('connect-flash');
var validator=require('express-validator');
var MongoStore=require('connect-mongo')(session);
var routes = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
mongoose.connect('mongodb://localhost:27017/shopping-cart');
require('./config/passport');

// view engine setup
app.engine('.hbs',hbs({defaultLayout:'layout',extname:'.hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret:'mySecrett',
  resave:false,
  saveUninitialized:false,
  store:new MongoStore({ mongooseConnection:mongoose.connection }),
  cookie:{maxAge:180*60*1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// app.use(csrf({cookie: true}));
// app.use(function (req, res, next) {
//   var token = req.csrfToken();
//   res.cookie('XSRF-TOKEN', token);
//   res.locals.csrfToken = token;
//   next();
// });
// app.use(function (req, res, next) {
//   var token = req.csrfToken();
//   res.cookie('XSRF-TOKEN', token);
//   res.locals.csrfToken = token;
//   next();
// });
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.login=req.isAuthenticated();
  res.locals.session=req.session;
  next();
})

app.use('/user', usersRouter);
app.use('/', routes);


//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
