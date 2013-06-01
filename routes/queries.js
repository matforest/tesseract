var pg = require('pg');

var conString = "postgres://gis:mypassword@192.168.128.61:5432/tesseract2";

var typesToTables = {
  'playground' : 'playgrounds'
};

// Find all types of objects in the search area
exports.findAll = function(pointArr, callback) {
  
  var results = []; 

  // FIXME conection is closed and reopened for each type
  for (var type in typesToTables) {
    find(pointArr, type, function(resultsInner) {
      results.push.apply(resultsInner);
    });
  }

  callback(results);
}

// Find the specified type of object in the search area
exports.find = function(pointArr, type, callback) {

  var client = new pg.Client(conString);
  client.connect();

  var results = [];

  var poly = createPolygon(pointArr);
  var sql = createGeoQuery(poly, type);

  //console.log('sql='+sql);
  
  var query = client.query(sql);

  query.on('row', function(row) {
    results.push({
      id: row.gid,
      name: row.name,
      geom: row.geom, 
      type: type
    });
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    //console.log('results: ', results);
    client.end();
    callback(results);
  });    
}


function createGeoQuery( polygonStr, type ) {

  var table = typesToTables[type];

  if (table) {
    return "SELECT gid, name, ST_AsGeoJSON(the_geom) as geom FROM " + table + " WHERE ST_within(the_geom, ST_SetSRID(ST_GeomFromText('" + polygonStr + "'), 4326) );";
  } else {
    throw new Error('unknown type: ' + type);
  }
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