const express = require('express');
const router = express.Router();
let  crypto = require('crypto')
let md5 = crypto.createHash('md5');

router.get('/signup', (req, res) => {
  const messages = req.flash('error');
  res.render('dashboard/signup', {
    messages,
    hasErrors: messages.length > 0,
  });
});

router.post('/signup', (req, res) => {
  let db = req.con;
  //取得現在時間，並將格式轉成YYYY-MM-DD HH:MM:SS
const onTime = () => {
  const date = new Date();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const hh = date.getHours();
  const mi = date.getMinutes();
  const ss = date.getSeconds();

  return [date.getFullYear(), "-" +
      (mm > 9 ? '' : '0') + mm, "-" +
      (dd > 9 ? '' : '0') + dd, " " +
      (hh > 9 ? '' : '0') + hh, ":" +
      (mi > 9 ? '' : '0') + mi, ":" +
      (ss > 9 ? '' : '0') + ss
  ].join('');
}
 
if(req.body.password.length < 6){
  req.flash('error', '密碼長度至少6字元');
 return  res.redirect('/sign/signup');
 }

//設置加密密碼
  let userPwd = md5.update(req.body.password).digest('hex');
  
  let data = {
    user_account : req.body.account,
    user_password : userPwd,
    user_available : 0,
    user_created_at:onTime()
  }

  db.query('select COUNT(1) AS num from user info where `user_account` =  ? ', data.user_account, function(err, rows) {
    let doubleAccount = false
    if (err) {
        console.log(err);
    }   

    if(rows[0].num == 1){
      doubleAccount = true
    }

        if (doubleAccount === true && req.body.password == req.body.confirm_password) {
          req.flash('error', '帳號已被註冊過');
          res.redirect('/sign/signup');
        }else if (doubleAccount === true && req.body.password !== req.body.confirm_password){
          req.flash('error', '兩個密碼輸入不一致');
          req.flash('error', '帳號已被註冊過');
          res.redirect('/sign/signup');
        }else if(doubleAccount === false && req.body.password !== req.body.confirm_password){
          req.flash('error', '兩個密碼輸入不一致');
          res.redirect('/sign/signup');
        }else {
          // 輸入正確，寫入DB
          db.query('INSERT INTO user SET ?', data, function(err, rows) {
            if (err) {
                console.log(err);
            }    
          // res.json({
          //   status :'signup success',
          //   result:data
          // })
          res.redirect('/sign/login');
        })
      }
  })  
});

router.get('/login', (req, res) => {
  const messages = req.flash('error');
  let uid = req.session.uid
  res.render('dashboard/login', {
    messages,
    uid,
    hasErrors: messages.length > 0,
  });
});

router.post('/login', (req, res) => {
  let db = req.con;
  let data = {
    login_account : req.body.account,
    login_password : (crypto.createHash('md5').update(req.body.password).digest('hex'))
  }
    // 撈取帳號
    db.query('SELECT * FROM user WHERE user_account = ?', data.login_account, function (err, rows) {
      if (err) {
        console.log(err);
    } 
    if(!rows[0]){
      req.flash('error', '找不到該用戶，請重新確認帳號密碼！');
      res.redirect('/sign/login');
    }else if(rows[0].user_password !== data.login_password){
      req.flash('error', '密碼錯誤，請重新確認密碼！');
      res.redirect('/sign/login');
      }
      else{
        //設定session
        // req.session.uid = (crypto.createHash('md5').update(data.login_account).digest('hex'));
        req.session.uid = data.login_account;
        res.redirect('/sign/welcome')
      }
  })
})

router.get('/welcome', (req, res) => {
  let uid = req.session.uid
  console.log(req.session.uid)
  res.render('dashboard/welcome', {
    uid,
  });
});

router.get('/logout', (req, res) => {
  req.session.uid = '';
  // console.log(req.session); 
  res.redirect('/sign/login');
});

module.exports = router;