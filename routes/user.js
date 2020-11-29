var express = require('express');
const QmanagerHelpers = require('../helpers/Qmanager-helpers');
const userHelpers = require('../helpers/user-helpers');
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

router.get('/select-slot/:id',(req,res)=>{
  QmanagerHelpers.displayHr(req.params.id).then((hr)=>{
    QmanagerHelpers.displayMin(req.params.id).then((min)=>{
      QmanagerHelpers.getslots(req.params.id).then((slots)=>{
        userHelper.display(hr,min,slots).then((result)=>{
          userHelper.getQName(req.params.id).then((QName)=>{
            res.render('user/select-slot',{result,QName})
          })
        })
        
      })
    })

  })
 
 

})

module.exports = router;
