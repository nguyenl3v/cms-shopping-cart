var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var fs  = require('fs-extra');
/* GET home page. */
router.get('/all-products', function (req, res, next) {
  Product.find(function (err, product) {
    if (err) console.log(err);
    res.render('products', {
      title: 'product',
      product: product
    });
  });
});

router.get('/:category', function (req, res, next) {
  var CategorySlug = req.params.category;
  Category.findOne({ slug: CategorySlug }, function (err, c) {
    Product.find({category:CategorySlug}, function (err, product) {
      if (err) console.log(err);
      res.render('cateProducts', {
        title: c.title,
        product: product
      });
    });
  });
});
router.get('/:category/:product', function (req, res, next) {
  var galleryImages = null;

      Product.findOne({slug:req.params.product}, function (err, product) {
        if(err){
          console.log(err)
        }else{
          var galleryDir = 'public/product_images/'+ product._id + '/gallery';
          fs.readdir(galleryDir, function(err,file){
            if(err){
              console.log(err)
            }else{
              galleryImages = file;
              res.render('productDetails', {
                title: product.title,
                p: product,
                galleryImages:galleryImages
              });
            }
          });
        }
    });
});


module.exports = router;
