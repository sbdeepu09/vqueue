var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/home', function(req, res, next) {
  res.render('Qmanager/Qmanager-home.hbs',{Qmanager:true});
});

router.get('/', function(req, res, next) {
   
  res.render('Qmanager/create.hbs')
 });

module.exports = router;
