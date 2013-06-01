var pg = require('pg'),
config = require('./../config');

var conString = config.conString;

exports.insertEvent = function(reportDetails, callback) {

  var point = createWKTPoint(reportDetails.lat, reportDetails.lng);

  var table = config.defaultSchema + '.reports';
  var sql = 'insert into ' + table + ' (type, description, creator_email, creator_name, notify_creator, reported_on, fid, geom) ' + 
            ' values ($1, $2, $3, $4, $5, now, %6, ST_SetSRID(ST_GeomFromText($7), 4326))';

  var client = new pg.Client(conString);
  client.connect();

  var results = [];

  var params = [reportDetails.type, reportDetails.desc, reportDetails.creator_email, 
                  reportDetails.creator_name, reportDetails.notify_creator, reportDetails.fid, point];

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

// FIXME this is duplicated, urg
function createWKTPoint(lat, lng) {

  if (lat == undefined || lng == undefined) {
    throw new Error('bad coords, lat=' + lat + ', lng=' + lng);
  }

  return 'POINT(' + lng + ' ' + lat + ')';
}