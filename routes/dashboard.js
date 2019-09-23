var express = require('express');
var router = express.Router();
var stringtags = require('striptags');
var moment = require('moment');
var page_module = require('../public/javascripts/page_module')

/* GET users listing. */
router.get('/dashboard', function(req, res, next) {
res.send('respond with a resource');
});

// archives page setting
router.get('/archives', function(req, res, next) {
    let status = req.query.status || 'public'
    let db = req.con;
    var categories = []
    var articles = []
    let currentPage =  Number.parseInt(req.query.page) || 1 // 當前頁數
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
          if(status === element.article_status ){
                articles.push(element)
          }
        })
        const data = page_module(articles,currentPage , `dashboard/archives`)     
          res.render('dashboard/archives', {
            title: 'Express' ,
            categories,
            articles:data.data,
            moment,
            stringtags,
            status,
            uid,
            page:data.page
          })
      })
  })
})

// article pages setting
// 新增文章頁面
router.get('/article/create', function(req, res, next) {
  let db = req.con;
  let uid = req.session.uid
  db.query('SELECT * FROM category', function(err, rows) {
    if (err) {
        console.log(err);
    }
    let categories = rows
    let article={}
    res.render('dashboard/article', { 
      title: 'Express' ,
      categories,
      uid,
      article
    }); 
  });
});
//修改文章頁面 
router.get('/article/:id', function(req, res, next) {
  let id = req.param('id')
  let uid = req.session.uid
  console.log(req.session)
  let article ={}
  let db = req.con;
  db.query('SELECT * FROM article WHERE article_id = ?', id,function(err, rows) {
    if (err) {
        console.log(err);
    }
    article = rows[0]
  })
  db.query('SELECT * FROM category', function(err, rows) {
    if (err) {
        console.log(err);
    }
    let categories = rows
    res.render('dashboard/article', { 
      title: 'Express' ,
      categories,
      uid,
      article
    });
  })

});
//article insert into DB
router.post('/article/create', function(req, res, next) {
      let db = req.con;
      let updateTime = Math.floor(Date.now() / 1000)
      let data = {
        article_category:req.body.category,
        article_content:req.body.content,
        article_id:req.body.articleID,
        article_status: req.body.status,
        article_title: req.body.title,
        article_update_time: updateTime
      }
    db.query('INSERT INTO article SET ?', data, function(err, rows) {
      if (err) {
          console.log(err);
      }
      res.redirect('/dashboard/archives')
    })
})
//article update 
router.post('/article/update/:id', function(req, res, next) {
  let db = req.con;
  let id = req.param('id')
  let updateTime = Math.floor(Date.now() / 1000)
  let data = {
    article_category:req.body.category,
    article_content:req.body.content,
    article_status: req.body.status,
    article_title: req.body.title,
    article_update_time: updateTime
  }
  db.query('UPDATE  article SET  ?  WHERE article_id = ?', [data,id] , function(err, rows) {
    if (err) {
        console.log(err);
    }
  })
    res.redirect('/dashboard/archives')
})
//article delete
router.post('/article/delete/:id', function(req, res, next) {
  let db = req.con;
  let id = req.param('id')
  req.flash('info','文章已刪除！');
  res.send('文章已刪除！')
  db.query('DELETE FROM article WHERE article_id = ?',id, function(err, rows) {
        if (err) {
            console.log(err);
        }
      })
})
//article setting end

//分類頁面設置 CRUD
router.get('/categories', function(req, res, next) {
  let db = req.con;
  let uid = req.session.uid
  console.log(req.session)
  let message = req.flash('info')
  db.query('SELECT * FROM category', function(err, rows) {
    if (err) {
        console.log(err);
    }
    let categories = rows
  res.render('dashboard/categories', {    
          title: 'Express' ,  
          // es6縮寫categories:categories為底下
          categories ,
          message , 
          //判斷flash mseeage確實有存在session
          hasinfo: message.length > 0,
          uid
      });
  });
});
//category add
router.post('/categories/create', function(req, res, next) {
  let db = req.con;
  let data = {
    category_id:req.body.cateID,
    category_name:req.body.name,
    category_path:req.body.path
  }
  db.query('SELECT * FROM category', function(err, test) {
        if (err) {
            console.log(err);
        }
        let jedge = false;
        for( var i in test) {
          //判斷如果輸入的路徑已存在就提示並跳轉
          if (data.category_path  === test[i].category_path){
            jedge = true
          }
        }
        if(jedge === false){
          db.query('INSERT INTO category SET ?', data, function(err, rows) {
            if (err) {
                console.log(err);
            }
            res.redirect('/dashboard/categories');
          })
        }else{
          req.flash('info','已有相同路徑！')
          res.redirect('/dashboard/categories');
        }
  })
});
//category delete
router.post('/categories/delete/:id', function(req, res, next) {
  let db = req.con;
  let id = req.param('id')
  req.flash('info','欄位已刪除！');
  db.query('DELETE FROM category WHERE category_id = ?',id, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.setHeader('Content-Type', 'application/json');
      res.redirect('/dashboard/categories');
      })
});
//category end

module.exports = router;
