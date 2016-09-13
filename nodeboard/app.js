var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
// var classroom = require('./routes/classroom');

//extra requires
var mongoose      =     require('mongoose');
var passport      =     require('passport');
var LocalStrategy =     require('passport-local').Strategy;
var flash         =     require('connect-flash');
var db            =     require('./db.js');
var dbConfig      =     require('./creditentials');

var app           =     express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// //app.use('/', routes);
// //app.use('/users', users);
// app.use('/classroom', classroom);


app.use(session({ secret: 'ihazasecret' })); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//

var Account = require('./models/account'); //NOTE: ADD THIS MODEL
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//connect to mongoose
mongoose.connect(dbConfig.mongoURL, function(err){
  if(err) console.log("Could not connect to the db");
});

app.use('/', require('./routes'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
