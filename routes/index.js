var pg = require('pg');
var config = require('./../config');

// FIXME move this
var conString = "postgres://gis:mypassword@192.168.128.61:5432/tesseract2";
var client = new pg.Client(conString);
client.connect();

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
  // console.log(req.query);
  // console.log('NorthWest coord:' + req.query.nw);
  
  var poly = createPolygon( [req.query.nw, req.query.ne, req.query.se, req.query.sw]  );
  var sql = createGeoQuery( poly );

  console.log( 'sql: ' + sql );

  var query = client.query(sql);

  var results = []; //store for the json

  query.on('row', function(row) {
    results.push({
      id: row.gid,
      name: row.name,
      wkt: row.wkt
    });
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    console.log('results: ', results);
    
    res.json(results);
    res.end;
  });

}

// client.end();


function createGeoQuery( polygonStr ) {

  return "SELECT gid, name, ST_AsGeoJSON(the_geom) as wkt FROM playgrounds WHERE ST_within(the_geom, ST_SetSRID(ST_GeomFromText('" + polygonStr + "'), 4326) );";
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


