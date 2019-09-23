var express = require('express');
var router = express.Router();
var stringtags = require('striptags');
var moment = require('moment');
var page_module = require('../public/javascripts/page_module')

/* GET home page. */
router.get('/', function(req, res, next) {
  let db = req.con;
  let uid = req.session.uid
  console.log(req.session.uid)
  var categories = []
  var articles = []
  let categoryId
  let currentPage =  Number.parseInt(req.query.page) || 1 // 當前頁數
  db.query('SELECT * FROM category ORDER BY category.category_name DESC', function(err, cates) {
    if (err) {
        console.log(err);
    }
     cates.forEach(element => {
      categories.push(element)
      categoryId = categories.category_path
    })
      db.query('SELECT * FROM article ORDER BY article.article_update_time DESC', function(err, arti) {
        if (err) {
            console.log(err);
        }
          arti.forEach(element => {
          if(element.article_status === 'public'){
                articles.push(element)
          }
        })
        const data = page_module(articles,currentPage)

          res.render('index', {
            title: 'Express' ,
            categories,
            categoryId,
            articles : data.data,
            moment,
            uid,
            stringtags,
            page:data.page
          })
      })
  })
});

//文章分類
router.get('/index/:category', (req, res) => {
  let db = req.con;
  const currentPage = Number.parseInt(req.query.page, 10) || 1;
  const categoryPath = req.param('category');
  var categories = []
  let categoryId
  var articles = []
  let uid = req.session.uid
  console.log(req.session.uid)

  db.query('SELECT * FROM category ORDER BY category.category_name DESC', function(err, cates) {
    if (err) {
        console.log(err);
    }
     cates.forEach(element => {
      categories.push(element)
    })
      db.query('SELECT * FROM article ORDER BY article.article_update_time DESC', function(err, arti) {
        if (err) {
            console.log(err);
        }
        arti.forEach(element => {
          for (let i=0; i <categories.length ;i++){
             if(categories[i].category_path === categoryPath){
                if(element.article_category === categories[i].category_id && element.article_status === 'public'){
                  categoryId = categories[i].category_id
                  articles.push(element)
                  }
              }
            }
        })
        
        const data = page_module(articles,currentPage,`index/${categoryPath}`)

          res.render('index', {
            title: 'Express' ,
            categories,
            categoryId,
            articles : data.data,
            moment,
            stringtags,
            uid,
            page:data.page,
            categoryPath
          })
      })
  })
});


router.get('/post/:id', function(req, res, next) {
  let id = req.param('id')
  let article ={}
  let uid = req.session.uid
  console.log(req.session.uid)
  let db = req.con;
  db.query('SELECT * FROM article WHERE article_id = ?', id,function(err, rows) {
    if (err) {
        console.log(err);
    }
    article = rows[0]
  })

  db.query('SELECT * FROM category ORDER BY category.category_name DESC', function(err, rows) {
    if (err) {
        console.log(err);
    }
    let categories = rows

if(!article){
   return res.render('error',{
    title : '找不到該文章'
  })
}

    for (var i = 0 ; i< categories.length ; i++){
      if(categories[i].category_id  === article.article_category){
        categoryId = categories[i].category_id
      }
    }
  
    res.render('post', { 
      title: 'Express' ,
      categories,
      categoryId,
      article,
      uid,
      moment
    })
  })
});

module.exports = router;
