var pg = require('pg');
var config = require('./../config');

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
  console.log(req.query);
  console.log('NorthWest coord:' + req.query.nw);
  
  var poly = createPolygon( [req.query.nw, req.query.ne, req.query.se, req.query.sw]  );
  var query = createGeoQuery( poly );

  console.log( 'Query: ' + query );

  res.json({
    text: 'success'
  });
  res.end;
}

function createGeoQuery( polygonStr ) {

  return "SELECT count(*) FROM playgrounds WHERE ST_within(the_geom, ST_SetSRID(ST_GeomFromText('" + polygonStr + "'), 4326) );";
}


function createPolygon(points) {

    var poly = 'POLYGON((';

        for (var i = 0; i < points.length; ++i) {

            var point = points[i];
            // Remove crud
            point = cleanPoint( point );
            poly += point;
            poly += ',';
        }

        // Loop back to the first point
        poly += cleanPoint(points[0]);

    return poly + "))";
}

function cleanPoint( pointString ) {
  // Clean up the incoming string, 'LatLng(-34.87692, 138.43632)' and flip the lat+long

    var regEx = /LatLng\((.+), (.+)\)/;
    var lat = pointString.match(regEx)[1];
    var long = pointString.match(regEx)[2];
    return long + ' ' + lat;
}


