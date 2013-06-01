var config = {};

config.title = 'Tesseract';
config.subtitle = 'Doing awesum stuff with gov\'t data';

config.http_port = process.env.NODE_ENV ? 80 : 3000;
config.db = process.env.NODE_ENV ? 127.0.0.1 : 115.146.86.91;

module.exports = config;