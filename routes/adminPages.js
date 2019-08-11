var express = require('express');
var router = express.Router();
const Page = require('../models/pages');


/* GET users listing. */
router.get('/add-pages', function (req, res, next) {
  var title = '';
  var slug = '';
  var content = '';
  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });
});
/* post users listing. */
router.post('/add-pages', function (req, res, next) {

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  var errors = [];

  if (title === '' && content === '') {
    errors.push({ msg: 'title is not empty' })
  }
  if (title.length < 4 && content.length < 4) {
    errors.push({ msg: 'chareter to >= 4' })
  }
  if (errors.length > 0) {
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({ slug: slug }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exits choose onother!')
        res.render('admin/add_page', {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 0
        });
        page.save(function (err) {
          if (err) { console.log(err) }
          Page.find({}).sort({ sorting: 1 }).exec(function (err, page) {
            if (err) {
              console.log(err)
            } else {
              req.app.locals.page = page;
            }
          });
          req.flash('success', 'Page added!');
          res.redirect('/admin/pages');
        });
      }
    })
  }

});


router.get('/', function (req, res, next) {
  Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
    res.render('admin/pages', { pages: pages, title: 'page' })
  });
});

function sortPage(ids, cb) {
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    (function (count) {
      Page.findById(id, function (err, page) {
        if (err) console.log(err)
          page.sorting = count;
          page.save(err => {
            if (err) console.log(err);
            count++;
            if (count >= ids.length) {
              cb();
            }
          });
      });
    })(count);
  };
};

router.post('/render-pages', function (req, res) {
  var ids = req.body['id[]'];
  sortPage(ids, function () {
    Page.find({}).sort({ sorting: 1 }).exec(function (err, page) {
      if (err) {
        console.log(err)
      } else {
        req.app.locals.page = page;
      }
    });
  });

});

router.get('/edit-page/:slug', function (req, res, next) {
  Page.findOne({ slug: req.params.slug }, function (err, page) {
    if (err) return console.log(err);
    res.render('admin/edit-page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  })
});

router.post('/edit-page', function (req, res, next) {
  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;
  var id = req.body.id;

  var errors = [];

  if (title === '' && content === '') {
    errors.push({ msg: 'title is not empty' })
  }
  if (title.length < 4 && content.length < 4) {
    errors.push({ msg: 'chareter to >= 4' })
  }
  if (errors.length > 0) {
    res.render('admin/edit-page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exits choose onother!')
        res.render('admin/edit-page', {
          danger: req.flash('danger'),
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, function (err, page) {
          page.title = title;
          page.slug = slug;
          page.content = content;
          page.save(function (err) {
            if (err) { console.log(err) }
            Page.find({}).sort({ sorting: 1 }).exec(function (err, page) {
              if (err) {
                console.log(err)
              } else {
                req.app.locals.page = page;
              }
            });
            req.flash('success', 'Page added!');
            res.redirect('/admin/pages');
          });
        });
      }
    })
  }
});
router.get('/delete-page/:id', function (req, res) {
  Page.findByIdAndRemove(req.params.id, function (err, page) {
    page.save(function (err) {
      if (err) { console.log(err) }
      Page.find({}).sort({ sorting: 1 }).exec(function (err, page) {
        if (err) {
          console.log(err)
        } else {
          req.app.locals.page = page;
        }
      });
      req.flash('success', 'delete added!');
      res.redirect('/admin/pages');
    });
  })
});

module.exports = router;
