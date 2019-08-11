var express = require('express');
var router = express.Router();
var Category = require('../models/category');

router.get('/category', function(req, res){
    Category.find({},function(err,category){
        res.render('admin/category',{
            cate:category,
            title:'category'
        })
    })
});

router.post('/add-category', function(req, res, next) {
  
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
   var errors = [];
    if(title === '' && slug === ''){
      errors.push({msg:'title is not empty'})
    }
    if(title.length < 4 && slug.length < 4){
      errors.push({msg:'chareter to >= 4'})
    }
    if(errors.length > 0){
      console.log(errors)
      res.render('admin/add-category',{
        errors:errors,
        title:title,
        slug:slug
      });
    }else{
      Category.findOne({slug:slug}, function(err, cate){
          if(cate){
            req.flash('danger', 'Page slug exits choose onother!')
            res.render('admin/add-category',{
              title:title,
              slug:slug
            });
          }else{
            var cate = new Category({
              title:title,
              slug:slug,
              sorting:0
            });
            cate.save(function(err){
              if(err){console.log(err)}
              Category.find({}, function(err, cate){
                if(err){
                  console.log(err)
                }else{
                  req.app.locals.category = cate;
                }
              });
              req.flash('success', 'Page added!');
              res.redirect('/admin/category');
            });
          }
        })
    }
    
  });

  router.get('/add-category', function(req, res, next) {
    var title='';
    var slug='';
    res.render('admin/add-category',{
      title:title,
      slug:slug
    });
  });

  router.get('/edit-category/:slug', function(req, res, next) {
    Category.findOne({slug:req.params.slug}, function(err,page){
      if(err) return console.log(err);
      res.render('admin/edit-category',{
        title:page.title,
        slug:page.slug,
        id:page._id
      });
    })
  });

  router.post('/edit-category', function(req, res){
    var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.body.id;
 
  var errors = [];

  if(title === '' && content === ''){
    errors.push({msg:'title is not empty'})
  }
  if(title.length < 4 && content.length < 4){
    errors.push({msg:'chareter to >= 4'})
  }
  if(errors.length > 0){
    res.render('admin/edit-category',{
      errors:errors,
      title:title,
      slug:slug,
      id:id
    });
  }else{
      Category.findOne({slug:slug}, function(err, page){
        if(page){
          req.flash('danger', 'Page slug exits choose onother!')
          res.render('admin/edit-category',{
            danger:req.flash('danger'),
            title:title,
            slug:slug,
            id:id
          });
        }else{
          Category.findById(id,function(err,cate){
            cate.title = title;
            cate.slug = slug;
            cate.save(function(err){
              if(err){console.log(err)}
              Category.find({}, function(err, cate){
                if(err){
                  console.log(err)
                }else{
                  req.app.locals.category = cate;
                }
              });
              req.flash('success', 'Page added!');
              res.redirect('/admin/category');
            });
          });
        }
      })
  }
  });

  router.get('/delete-category/:id', function(req, res){
    Category.findByIdAndDelete(req.params.id, function(err, cate){
      cate.save(function(err){
        if(err){console.log(err)}
        Category.find({}, function(err, cate){
          if(err){
            console.log(err)
          }else{
            req.app.locals.category = cate;
          }
        });
        req.flash('success', 'delete added!');
        res.redirect('/admin/category');
      });
    });
  });
module.exports = router;