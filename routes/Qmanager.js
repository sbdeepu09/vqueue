const { log } = require('debug');
const { response } = require('express');
var express = require('express');
var router = express.Router();
var QmanagerHelpers = require('../helpers/Qmanager-helpers')
var userHelper=require('../helpers/user-helpers')
var nodemailer = require('nodemailer');

/* GET users listing. */
router.get('/home', function(req, res, next) {
  let Qmanager = req.session.Qmanager
  QmanagerHelpers.getQueues(Qmanager).then((queues)=>{
    res.render('Qmanager/Qmanager-home.hbs',{Qmanager:true,Qmanager,queues});
  })
  
});

router.get('/', function(req, res, next) {
  res.render('Qmanager/create.hbs')
 });

 router.get('/login',function(req,res) {
   res.render('Qmanager/login',{"loginErr":req.session.QmanagerloginErr})
   req.session.QmanagerloginErr=false 
  })

 router.post('/login',(req,res) =>{
  QmanagerHelpers.doLogin(req.body).then((response) =>{
    if(response.status){
      req.session.QmanagerloggedIn=true;
      req.session.Qmanager=response.Qmanager;
      res.redirect('/Qmanager/home');
    }else{
      req.session.QmanagerloginErr = "Invalid username or password"
      res.redirect('/Qmanager/login')
      req.session.QmanagerloginErr=false
    }
  })
})
router.get('/register',(req,res)=>{
  res.render('Qmanager/Qm-register');
})

router.post('/sendotp',(req,res)=>{
  QmanagerHelpers.sendMail(req.body).then((otp)=>{
    let response = {}
    response.otp = otp
    response.status = true
    res.json(response)
  })
})

router.post('/register',(req,res)=>{
    QmanagerHelpers.doSignup(req.body).then((response)=>{
      res.render('Qmanager/login')
    })

})

router.get('/create-queue',(req,res) =>{
  let Qmanager = req.session.Qmanager
  res.render('Qmanager/create-queue',{Qmanager})
})

router.get('/edit/:id',async(req,res)=>{
  let editqueue=await QmanagerHelpers.getQueueDetails(req.params.id)
  res.render('Qmanager/edit',{editqueue, Qmanager:true} )
})

router.post('/edit/:id',(req,res)=>{
  QmanagerHelpers.updateQueue(req.params.id,req.body).then((Qdetails)=>{
    QmanagerHelpers.createSlots(Qdetails).then((response)=>{
      QmanagerHelpers.gettimings(Qdetails).then((response1)=>{
        res.redirect('/Qmanager/home')
      })
    })
  })
})

router.get('/delete/:id',(req,res)=>{
  let qid=req.params.id
  QmanagerHelpers.deletequeue(qid).then((response)=>{
    res.redirect('/Qmanager/home')
  })
})

router.post('/create-queue',(req,res) =>{
  console.log(req.body);
  QmanagerHelpers.storeQueueDetails(req.body).then((queueDetails) =>{
    QmanagerHelpers.createSlots(queueDetails).then((response)=>{
     QmanagerHelpers.gettimings(queueDetails).then((slotHr)=>{
      res.redirect('/Qmanager/home')
     })
    })
  })
})

router.get('/viewQueue/:id',(req,res)=>{
  QmanagerHelpers.displayHr(req.params.id).then((hr)=>{
    QmanagerHelpers.displayMin(req.params.id).then((min)=>{
      QmanagerHelpers.getslots(req.params.id).then((slots)=>{
        QmanagerHelpers.display(hr,min,slots).then((result)=>{
          userHelper.getQName(req.params.id).then((Qdetails)=>{
            res.render('Qmanager/view-Queue',{result,Qdetails,Qmanager:true});
          })
        })
      })
    })
  })
})

router.get('/booking-details/:Qid/:slotNo',(req,res)=>{
  QmanagerHelpers.getBookingDetails(req.params.Qid,req.params.slotNo).then((userId)=>{
    QmanagerHelpers.getUserDetails(userId).then((userDetails)=>{
      res.render('Qmanager/booking-details',{userId,userDetails, Qmanager:true})
     

    })

  })
})
router.get('/Qprofile',(req,res)=>{
  let name=req.session.Qmanager.Name;
  let email=req.session.Qmanager.Email;
  let phone=req.session.Qmanager.Phone;
  res.render('Qmanager/Qprofile',{name, email, phone,Qmanager:true})
})


module.exports = router;
