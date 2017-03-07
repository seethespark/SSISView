/*jslint node: true */
/*jslint esversion: 6 */
'use strict';

const knex = require('knex')({
  client: 'mssql',
  connection: {
    driver   : 'msnodesqlv8',
    host     : 'localhost',
    //user     : settings.dbUsername,
    //password : settings.dbPassword,
    database : 'netley',
    
    options: {
      trustedConnection : true,
      //encrypt: true,
      //database : settings.dbDatabase,
      //port: 1433
    }
  }
});
const router = require('express').Router();
var mostRecentSSISID = 0;

router.get('/', function(req, res, next) {
  //res.send('Made it');
  res.render('index');
});

router.get('/ssis', function(req, res, next) {
  knex
    .select('*')
    .from('sysssislog')
    .then(function(rows) {
      rows.forEach(function(row) {
        if (row.id > mostRecentSSISID) {
          mostRecentSSISID = row.id;
        }
      });
      res.send(rows);
    })
    .catch(function(err) {
      return next(err);
    });
});

setInterval(function() {
  knex
    .select('*')
    .from('sysssislog')
    .where('id', '>', mostRecentSSISID)
    .orderBy('id')
    .then(function(rows) {
      rows.forEach(function(row) {
        if (row.id > mostRecentSSISID) {
          mostRecentSSISID = row.id;
        }
        sendSsisEvent(row);
      }); 
    })
    .catch(function(err) {
      console.log(err);
    });

}, 5000);

var ssisRecipients = [];
router.get('/events', function (req, res, next) {
  //req.socket.setTimeout(Infinity);
  res.connection.setTimeout(0);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
    });
  //res.write('event: pageview\nid: '+  (new Date()).toLocaleTimeString() +'\ndata: ' + refreshId + '\n\n');
  res.flushHeaders();
  ssisRecipients.push(res);
  req.once('close', function () {
    ssisRecipients.pop(res);
  });
});

function sendSsisEvent(eventText) {
  ssisRecipients.forEach((res) => {
    res.write('event: ssisevents\ndata: ' + JSON.stringify(eventText) + '\n\n');
  });
}



module.exports = router;