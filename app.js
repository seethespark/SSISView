/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

//const compression = require('compression');
const express = require('express');
const http = require('http');
const path = require('path');


const app = express();
const server = http.createServer(app);


//app.use(compression({ flush: require('zlib').Z_SYNC_FLUSH }));
//app.get('/teapot', teapot);

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'hbs');
app.set('view cache', false);
app.use(express.static(path.join(__dirname, './public')));




app.use('/', require('./routes/index'));


app.use('/privacy', function(req, res, next) {
  res.send('<html><body><h1>Default privacy page.</h1><p>This site uses cookies and may store personal information.</p></body></html>  ');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.NODE_ENV === 'development') {
  app.use(function (err, req, res, next) {
    console.log('DEFAULT ERROR HANDLER', req.url, err);
    res.status(err.status || 500);
    // console.log(req.headers);
    if (req.headers.accept === 'application/json' || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      res.send({error: err.message});
    } else {
        res.render('error', {
        message: err.message + ' ' + err.code,
        error: err,
        layout: err.layout,
        siteTheme: err.siteTheme,
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  if (req.headers.accept === 'application/json' || req.headers['x-requested-with'] === 'XMLHttpRequest') {
    res.send({error: err.message});
  } else {
    res.render('error', {
      message: err.message,
      error: {},
      layout: err.layout,
        siteTheme: err.siteTheme,
    });
  }
});


server.listen(3000, 'localhost', function() {
    var addr = this.address();
    console.log('SSIS viewer server is listening on %s:%d at %s', addr.address, addr.port, new Date());
});
