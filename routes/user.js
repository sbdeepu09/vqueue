var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let services=[
    {
      name:"K P Stores",
      category:"Retail shop",
      image:""
    },
    {
      name:"Ayush Clinic",
      category:"Clinic",
      image:""
    }
  ]
  res.render('user/user-home.hbs',{ services });
});

module.exports = router;
