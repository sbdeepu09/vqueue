var express = require('express');
var router = express.Router();
var userHelper=require('../helpers/user-helpers')
/* GET home page. */
router.get('/',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/home')
  }else{
    res.render('user/land',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
  //res.render('user/land');
});

router.get('/home', function(req, res, next) {
  let user=req.session.user
  userHelper.getAllQueues().then((queues)=>{
    console.log(queues);
    res.render('user/user-home.hbs',{ queues,user });
  })
});

router.get('/signup',(req,res)=>{
  res.render('user/usersignup');
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    res.redirect('/')
  })
})

router.post('/',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/home')
    }else{
      req.session.loginErr="Invalid user or Password"
      res.redirect('/')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
