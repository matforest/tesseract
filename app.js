
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  config = require('./config')
;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || config.http_port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/help', routes.help);
app.get('/getpoints', routes.getpoints);
app.get('/getdetails', routes.getdetails);
app.get('/findAuthority', routes.findAuthority);
app.get('/findAllLocalGovs', routes.findAllLocalGovs);
//app.get('/users', user.list);

app.post('/createEvent', routes.createEvent);
app.post('/createReport', routes.createReport);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
