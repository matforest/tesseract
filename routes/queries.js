var pg = require('pg'),
  config = require('./../config');

var conString = "postgres://gis:mypassword@"+config.db.host+":"+config.db.port+"/gisdb";
var defaultSchema = 'gis_schema';

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
  console.log(conString);
  var client = new pg.Client(conString);
  client.connect();

  var results = [];

  var poly = createPolygon(pointArr);
  var sql = createGeoQuery(poly, type);

  //console.log('sql='+sql);
  
  var query = client.query(sql);

  query.on('row', function(row) {
    results.push({
      id: row.id,
      name: row.name,
      geom: JSON.parse(row.geom), 
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

// Find a single object of some type
exports.findById = function(id, type, callback) {

  var table = getTable(type);
  var sql = 'select * from ' + table + ' where id = $1';

  var client = new pg.Client(conString);
  client.connect();

  console.log('findById: ' + sql);

  var query = client.query(sql, [id]);

  var results = [];

  query.on('row', function(row) {
    results.push( JSON.parse(JSON.stringify(row)));
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    client.end();
    callback(results);
  });    
}


function createGeoQuery( polygonStr, type ) {

  var table = getTable(type);
  return "SELECT id, name, ST_AsGeoJSON(the_geom) as geom FROM " + table + " WHERE ST_within(the_geom, ST_SetSRID(ST_GeomFromText('" + polygonStr + "'), 4326) );";
}

function getTable(type) {

  var table = typesToTables[type]; 

  if (table) {
    return defaultSchema + '.' + table;
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




