
/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { 
    title: 'Tessaract',
    subtitle: 'Doing awesum stuff with gov\'t data'
  });
};