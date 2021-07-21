var createError = require('http-errors');
var express = require('express');
var path = require('path');
var validator = require('express-validator');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var dashboard = require('./routes/dashboard');
var sign = require('./routes/sign');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',require('express-ejs-extend'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret : 'type some text',
  resave : true,
  saveUninitialized : true,
  cookie : { maxAge: 100 * 1000 }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
require('dotenv').config()

// DataBase set
var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: process.env.DBaccount,
    password: process.env.DBpwd,
    database: "blog"
});

con.connect(function(err) {
    if (err) {
        console.log('connecting error');
        return;
    }
    console.log('connecting success');
});
// DataBase set end

// db state set
app.use(function(req, res, next) {
  req.con = con;
  next();
});

const authCheck = function( req , res , next) {
  console.log('middlewre' , req.session.uid)
  if( req.session.uid){
    return next() 
  }
  return res.redirect('/sign/welcome')
}

app.use('/', indexRouter);
app.use('/dashboard', authCheck , dashboard);
app.use('/sign', sign);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error();
  err.status = 404
  res.render('error',{
    title : '查看的頁面不存在 ! '
  })
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

//test jenkins 2

module.exports = app;
