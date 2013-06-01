var queries = require('./queries'),
    events = require('./events'),
  config = require('./../config');

/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { 
    constants: config,
    page: 'home'
  });
};

exports.about = function(req, res) {
  res.render('about', {
    constants: config,
    page: 'about'
  });
}

exports.contact = function(req, res) {
  res.render('contact', {
    constants: config,
    page: 'contact'
  });
}

exports.getpoints = function(req, res) {
  console.log('received request at getpoints');

  queries.findAll( [req.query.nw, req.query.ne, req.query.se, req.query.sw], function(results) {
      res.json(results);
      res.end();
  } );

}

exports.getdetails = function(req, res) {

  queries.findById(req.query.id, req.query.type, function(results) {
      res.json(results);
      res.end();
  });

}

exports.createEvent = function(req, res) {

    console.log('createEvent called');

    var query = {
      lat: '-34.92542',
      lng: '138.59367',
      name: 'test',
      desc: 'a test event, it\'s gonna be great',
      creator: 'Mat',
      location_type: 'custom',
      fid: null
    };

    events.insertEvent(query, function(results) {
      res.json(results);
      res.end();
  });

}