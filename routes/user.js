const { response } = require('express');
var express = require('express');
const QmanagerHelpers = require('../helpers/Qmanager-helpers');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
var userHelper=require('../helpers/user-helpers')
/* GET home page. */
router.get('/',(req,res)=>{
  if(req.session.userloggedIn){
    res.redirect('/home')
  }else{
    res.render('user/land',{"loginErr":req.session.userloginErr})
    req.session.userloginErr=false
  }
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
      req.session.userloggedIn=true;
      req.session.user=response.user;
      res.redirect('/home')
    }else{
      req.session.userloginErr="Invalid user or Password"
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
          userHelper.getQName(req.params.id).then((Qdetails)=>{
            res.render('user/select-slot',{result,Qdetails})
          })
        })
      })
    })
  })
})

router.get('/bookslot/:Qid/:slotNo',(req,res)=>{
  let Qid=req.params.Qid
  let slotNo=req.params.slotNo  
  userHelper.getSlotDetails(Qid,slotNo).then((result)=>{
   userHelper.getQName(Qid).then((Qdetails)=>{
    
    res.render('user/book-slot',{result,Qdetails})
   })
  })
})

router.get('/confirm/:Qid/:slotNo',(req,res)=>{
  let Qid=req.params.Qid
  let slotNo=req.params.slotNo  
  let user = req.session.user._id
  userHelper.bookSlot(Qid,slotNo,user).then((Qid)=>{   
    
      res.redirect('/')
  })
})

router.get('/profile',(req,res)=>{
  let name=req.session.user.Name;
  let email=req.session.user.Email;
  let phone=req.session.user.Phone;
  res.render('user/profile',{name, email, phone})
 
})

router.get('/editprofile',(req,res)=>{
  let name=req.session.user.Name;
  let email=req.session.user.Email;
  let phone=req.session.user.Phone;
  let password=req.session.user.Phone;
  res.render('user/editprofile',{name, email, phone,password})
 
})

router.post('/editprofile',(req,res)=>
  userHelpers.updateprofile(req.body,req.session.user._id).then((userDetails)=>{
    req.session.user=userDetails
    res.redirect('/home')
  })
)
module.exports = router;
