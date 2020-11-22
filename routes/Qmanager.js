const { response } = require('express');
var express = require('express');
var router = express.Router();
var QmanagerHelpers = require('../helpers/Qmanager-helpers')

/* GET users listing. */
router.get('/home', function(req, res, next) {
  let user = req.session.user
  res.render('Qmanager/Qmanager-home.hbs',{Qmanager:true,user});
});

router.get('/', function(req, res, next) {
   
  res.render('Qmanager/create.hbs')
 });

 router.get('/login',function(req,res) {
   res.render('Qmanager/login')

 })

 router.post('/login',(req,res) =>{
  QmanagerHelpers.doLogin(req.body).then((response) =>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/Qmanager/home')
    }else{
      req.session.loginErr = "Invalid username or password"
      res.redirect('/Qmanager/login')
    }
  })
})

router.get('/create-queue',(req,res) =>{
  let user = req.session.user
  res.render('Qmanager/create-queue',{user})
})

router.post('/create-queue',(req,res) =>{
  QmanagerHelpers.storeQueueDetails(req.body).then((queueDetails) =>{
    QmanagerHelpers.createSlots(queueDetails).then((response)=>{

    })
  })
})
module.exports = router;
