var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let services=[
    {
      name:"K P Stores",
      category:"Retail shop",
      image:"data:image/jpeg;base64,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"
    },
    {
      name:"Ayush Clinic",
      category:"Clinic",
      image:"data:image/png;base64,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"
    }
  ]
  res.render('user/user-home.hbs',{ services });
});

module.exports = router;
