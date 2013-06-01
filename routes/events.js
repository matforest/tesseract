var pg = require('pg'),
config = require('./../config');

var conString = config.conString;

exports.insertEvent = function(eventDetails, callback) {

  var point = createWKTPoint(eventDetails.lat, eventDetails.lng);

  var table = config.defaultSchema + '.events';
  var sql = 'insert into ' + table + ' (name, description, creator, location_type, fid, geom) values ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326))';

  var client = new pg.Client(conString);
  client.connect();

  var results = [];

  var params = [eventDetails.name, eventDetails.desc, eventDetails.creator, eventDetails.location_type, eventDetails.fid, point];

  var query = client.query(sql, params);

  query.on('row', function(row) {
    console.log(row);
  });

  query.on('error', function(err) {
    console.log('Error: ', err);
  });
  
  query.on('end', function() { 
    client.end();
    callback(results);
  });   
}

function createWKTPoint(lat, lng) {

  return 'POINT('+lng+' '+lat+')';
}