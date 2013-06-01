var config = {};

config.title = 'Tesseract';
config.subtitle = 'Doing awesum stuff with gov\'t data';

config.http_port = process.env.NODE_ENV ? 80 : 3000;
config.db = {};
config.db.host = process.env.NODE_ENV ? '127.0.0.1' : 'localhost';
config.db.port = process.env.NODE_ENV ? 5432 : 3333;

config.conString = "postgres://gis:mypassword@"+config.db.host+":"+config.db.port+"/gisdb";

config.defaultSchema = 'gis_schema';

module.exports = config;