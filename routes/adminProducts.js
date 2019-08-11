var express = require('express');
var router = express.Router();
const Products = require('../models/product');
const Category = require('../models/category');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const mkdirp = require('mkdirp');


/* GET users listing. */
router.get('/', function (req, res) {
    var count = 0;
    Products.count(function (err, c) {
        count = c;
        Products.find({}, function (err, product) {
            res.render('admin/product', {
                product: product,
                count: count,
                title: 'product'
            })
        });
    });
});

router.get('/add-product', function (req, res, next) {
    var title = '';
    var desc = '';
    var price = '';
    Category.find({}, function (err, category) {
        res.render('admin/add-product', {
            title: title,
            desc: desc,
            category:category,
            price:price
        });
    })
});
router.post('/add-product', function(req, res, next) {
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '' ; 
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
   var errors = [];
    if(title === '' && slug === ''){
      errors.push({msg:'title is not empty'})
    }
    if(title.length < 4 ){
      errors.push({msg:'chareter to >= 4'})
    }
    
    if(errors.length > 0){
        Category.find({}, function (err, category) {
            res.render('admin/add-product', {
                errors:errors,
                title: title,
                desc: desc,
                category:category,
                price:price
            });
        })
    }else{
      Products.findOne({slug:slug}, function(err, product){
          if(product){
            req.flash('danger', 'Page slug exits choose onother!')
            Category.find({}, function (err, category) {
                res.render('admin/add-product', {
                    title: title,
                    desc: desc,
                    category:category,
                    price:price
                });
            })
          }else{
            var price2 = parseFloat(price).toFixed(2);
            var product = new Products({
                title: title,
                slug:slug,
                desc: desc,
                category:category,
                price:price2,
                image:imageFile
            });
            product.save(function(err){
              if(err){console.log(err)}
              mkdirp('public/product_images/'+ product._id, function(err){
                    return console.log(err)
                });
              mkdirp('public/product_images/'+ product._id + '/gallery', function(err){
                  return console.log(err)
              });
              mkdirp('public/product_images/'+ product._id + '/gallery/thumbs', function(err){
                  return console.log(err)
              });
              if(imageFile != ''){
                  var productImage = req.files.image;
                  var path = 'public/product_images/' + product._id + '/'+ imageFile;
                  productImage.mv(path, function(err){
                      return console.log(err)
                  });
              }
              req.flash('success', 'product added!');
              res.redirect('/admin/products');
            });
          }
        })
    }
  });
  router.get('/edit-product/:id', function(req, res, next) {
      var errors;
      if(req.session.errors) errors = req.session.errors;
      req.session.errors = null;
      Category.find({}, function (err, category) {
        Products.findById(req.params.id, function(err,p){
            if(err){
                return console.log(err)
            }else{
                var galleryDir = 'public/product_images/'+p._id+'/gallery';
                var galleryImages = null;
                fs.readdir(galleryDir,function(err,file){
                    if(err){
                        return console.log(err)
                    }else{
                        galleryImages = file;
                        res.render('admin/edit-product',{
                            title:p.title,
                            errors:errors,
                            slug:p.slug,
                            desc:p.desc,
                            category:category,
                            categr:p.category.replace(/\s+/g,'-').toLowerCase(),
                            price:p.price,
                            image:p.image,
                            galleryImages:galleryImages,
                            id:p._id
                          });
                    };

                });
            };
          })
    })
  });


  router.get('/delete-product/:id', function(req, res){
    Products.findByIdAndDelete(req.params.id, function(err, product){
        product.save(function(err){
        if(err){console.log(err)}
        req.flash('success', 'delete added!');
        res.redirect('/admin/products');
      });
    });
  });

  router.post('/edit-product/:id', function(req, res){
    var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '' ; 
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
   var errors = [];
    if(title === '' && slug === ''){
      errors.push({msg:'title is not empty'})
    }
    if(title.length < 4 ){
      errors.push({msg:'chareter to >= 4'})
    }
    if(errors.length > 0){
        req.session.errors = errors;
        console.log(errors)
        res.redirect('/admin/products/edit-product/'+ id)
    }else{
        Products.findOne({slug:slug}, function(err,p){
            if(err) console.log(err);
            if(p){
                req.session.errors = errors;
                res.redirect('/admin/products/edit-product/'+ id)
            }else{
                Products.findById(id, function(err,p){
                    console.log(p)
                    if(err) console.log(err);
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile !== ''){
                        p.image = imageFile;
                    }
                    p.save(function(err){
                        if(err) console.log(err);
                        if(imageFile !== ''){
                            if(pimage !== ''){
                                fs.remove('public/product_images/'+ id + '/' + pimage , function(err){
                                    if(err) console.log(err);
                                });
                            }
    
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/'+ imageFile;
                            productImage.mv(path, function(err){
                                return console.log(err)
                            });
                        }
                        res.redirect('/admin/products')
                    });
                });
            }
        });
    }
  });

  router.post('/product-gallery/:id', function(req, res){
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, function(err){
        console.log(err);
        resizeImg(fs.readFileSync(path),{width:100,height:100}).then(function(buf){
            fs.writeFileSync(thumbsPath,buf)
        })
    });
    res.sendStatus(200);
  });
//delete gallery image
  router.get('/delete-image/:image', function(req, res){
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    fs.remove(originalImage, function(err){
        if(err){
            console.log(err)
        }else{
            fs.remove(thumbImage, function(err){
                if(err) console.log(err);
                res.redirect('/admin/products/edit-product/' + req.query.id)
            });
        }

    });
  });
module.exports = router;