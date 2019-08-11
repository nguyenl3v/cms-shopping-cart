var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminPages = require('./routes/adminPages');
var adminCategory = require('./routes/adminCategory');
var adminProducts = require('./routes/adminProducts');
var session = require('express-session');
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');
var Page = require('./models/pages');
var Category = require('./models/category');
var app = express();


var mongoose = require('mongoose');
const db = require('./config/keys').MongoURL;
mongoose.connect(db, {useNewUrlParser: true})
.then(()=>console.log('mongoose connected'))
.catch(err=>console.log(err));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000 * 24}
}));
app.use(flash());
app.use((req,res,next)=>{
  res.locals.danger = null;
  res.locals.success = req.flash('success');
  res.locals.errors = null;
  next();
});


Page.find({}, function(err, page){
  if(err){
    console.log(err)
  }else{
    app.locals.page = page;
  }
});
Category.find({}, function(err, cate){
  if(err){
    console.log(err)
  }else{
    app.locals.category = cate;
  }
});

app.get('*', function(req, res, next){
  res.locals.cart = req.session.cart;
  next();
});

var pages = require('./routes/pages');
var products = require('./routes/products');
var cart = require('./routes/cart');
app.use('/admin/pages', adminPages);
app.use('/admin', adminCategory);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages);

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
