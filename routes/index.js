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
      lat: req.query.lat,
      lng: req.query.lng,
      name: req.query.name,
      desc: req.query.desc,
      creator: req.query.creator,
      location_type: req.query.location_type,
      fid: req.query.fid
    };

    console.log('createEvent called; query: ', query);

    events.insertEvent(query, function(results) {
      res.json(results);
      res.end();
  });

}
