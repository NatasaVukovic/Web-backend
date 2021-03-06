require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var uglifyJs = require("uglify-js");
var fs = require('fs');
var busboyBodyParser = require('busboy-body-parser');
var cors = require('cors');
require('./app_api/models/db');
require('./app_api/config/passport');

var routesApi = require('./app_api/routes/index');


var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'app_server', 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));

app.use(passport.initialize());
app.use(busboyBodyParser());

app.use('/api', routesApi);
//require('/app_api/routes')(api);


// catch 404 and 401 and forward to error handler
app.use(function(err, req, res, next) {
    //console.log(err, req);
    if(err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"message" : err.name + " : " + err.message});
    }
  var err = new Error('Not Found');
  console.log(err);
  err.status = 404;
  next(err);
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*'); //Will change to actual Internal network IP
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, PUT, DELETE, OPTIONS');
  next();
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
