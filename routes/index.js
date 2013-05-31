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