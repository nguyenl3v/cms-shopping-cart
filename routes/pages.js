var express = require('express');
var router = express.Router();
var Page = require('../models/pages');
/* GET home page. */
router.get('/', function(req, res, next) {
  Page.findOne({slug:'home'}, function(err,page){
    if(err) console.log(err);
      res.render('index', {
         title: 'Home' ,
         content:page.content
        });
  });
});

router.get('/:slug', function(req, res, next) {
  var slug = req.params.slug;
  Page.findOne({slug:slug}, function(err,page){
    if(err) console.log(err);
    if(!page){
      res.redirect('/')
    }else{
      res.render('index', {
         title: 'Home' ,
         content:page.content
        });
    }
  });
});

module.exports = router;
