var pg = require('pg'),
config = require('./../config');
var async = require('async');

var conString = config.conString;

var typesToTables = {
  'playground' : 'playgrounds',
  'adult_education' : 'ace',
  //'local_gov' : 'lga',
  'library' : 'libraries',
  'school' : 'schools',
  'event' : 'events',
  'report' : 'reports_view'
};

// Find all types of objects in the search area
exports.findAll = function(pointArr, callback) {
  
  var types = [];
  for (var type in typesToTables) {
    types.push(type);
  }

  // Call doFind for everya given type
  var exec = function(item, seqCallback) {
    doFind(pointArr, item, function(results) { // doFind callbacl
      seqCallback(null, results); // async's callback
    });
  }

  // Sequenially call 'exec' above with each of the types from typesToTables
  async.map(types, exec, function(err, asyncResults) {

    // console.log('asyncResults: ', asyncResults);

    // async.map puts the individual results into an array, concatenate
    // all of them into a single result array
    var results = [];

    // asyncResults is an array of arrays
    for (var i = 0; i < asyncResults.length; ++i) {
      var arr = asyncResults[i];
      results = results.concat(arr);
    }

    callback(results);
  });
}

// Execute a find, expects to be already connected
function doFind(pointArr, type, callback) {

  var client = new pg.Client(conString);
  client.connect();

  var results = [];

  var poly = createPolygon(pointArr);
  var sql = createGeoQuery(poly, type);
  
  // console.log('SQL: ' + sql);

  var query = client.query(sql);

  query.on('row', function(row) {
    results.push(createFeature(row, type));
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    // console.log('results: ', results);
    client.end();
    callback(results);
  });    
}

// Find the specified type of object in the search area
exports.find = function(pointArr, type, callback) {
  doFind(pointArr, type, callback);
}

// Find a single object of some type
exports.findById = function(id, type, callback) {

  var table = getTable(type);
  var sql = 'select * from ' + table + ' where id = $1';

  var client = new pg.Client(conString);
  client.connect();

  // console.log('findById: ' + sql);

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
  return "SELECT id, name, ST_AsGeoJSON(geom) as geom FROM " + table + " WHERE ST_within(geom, ST_SetSRID(ST_GeomFromText('" + polygonStr + "'), 4326) );";
}

function getTable(type) {

  var table = typesToTables[type]; 

  if (table) {
    return config.defaultSchema + '.' + table;
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

// Returns a GeoJSON feature for the given postgres row
function createFeature(row, type) {
  return { 
    "type": "Feature", 
    "properties": {
      id: row.id,
      name: row.name,
      type: type
    },
    "geometry": JSON.parse(row.geom)
  };
}


exports.findLocalGov = function(lat, lng, callback){

  var pointString = createWKTPoint(lat, lng);
  var sql = "SELECT id, objectid, lgatype, abbname, lga" + 
              " FROM " + config.defaultSchema + ".lga " + 
              " WHERE ST_within(ST_SetSRID(ST_GeomFromText($1), 4326), geom);";

  var client = new pg.Client(conString);
  client.connect();

  var query = client.query(sql, [pointString]);

  var results = [];

  query.on('row', function(row) {
    results.push( JSON.parse(JSON.stringify(row) )); 
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    client.end();
    callback(results);
  });
}

// Duplicated in events.js
function createWKTPoint(lat, lng) {

  if (lat == undefined || lng == undefined) {
    throw new Error('bad coords, lat=' + lat + ', lng=' + lng);
  }

  return 'POINT(' + lng + ' ' + lat + ')';
}


exports.findAllLocalGovs = function(callback) {

  var sql = "SELECT id, abbname, ST_AsGeoJSON(ST_Centroid(geom)) as centroid " + 
  " FROM " + config.defaultSchema + ".lga order by abbname;";

  var client = new pg.Client(conString);
  client.connect();

  var query = client.query(sql);

  var results = [];

  query.on('row', function(row) {
    results.push( {
      id: row.id,
      abbname: row.abbname,
      centroid: JSON.parse(row.centroid)
    }); 
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    client.end();
    callback(results);
  });  
}