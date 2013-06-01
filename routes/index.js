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

    var query = {
      lat: req.body.lat,
      lng: req.body.lng,
      name: req.body.name,
      desc: req.body.desc,
      creator: req.body.creator,
      location_type: req.body.location_type,
      fid: req.body.fid
    };

    console.log('createEvent called; query: ', query);

    events.insertEvent(query, function(results) {
      res.json(results);
      res.end();
  });

}

exports.findAuthority = function(req, res) {

    queries.findLocalGov(req.query.lat, req.query.lng, function(results) {
      res.json(results);
      res.end();
    });
}


