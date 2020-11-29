const { log } = require('debug');
const { response } = require('express');
var express = require('express');
var router = express.Router();
var QmanagerHelpers = require('../helpers/Qmanager-helpers')

/* GET users listing. */
router.get('/home', function(req, res, next) {
  let user = req.session.user
  QmanagerHelpers.getQueues(user).then((queues)=>{
    res.render('Qmanager/Qmanager-home.hbs',{Qmanager:true,user,queues});
  })
  
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
      req.session.loginErr=false
    }
  })
})

router.get('/create-queue',(req,res) =>{
  let user = req.session.user
  res.render('Qmanager/create-queue',{user})
})

router.get('/edit/:id',async(req,res)=>{
  let editqueue=await QmanagerHelpers.getQueueDetails(req.params.id)
  res.render('Qmanager/edit',{editqueue})
})

router.post('/edit/:id',(req,res)=>{
  console.log(req.params.id)
  QmanagerHelpers.updateQueue(req.params.id,req.body).then(()=>{
    res.redirect('/Qmanager/home')
  })
})

router.get('/delete/:id',(req,res)=>{
  let qid=req.params.id
  QmanagerHelpers.deletequeue(qid).then((response)=>{
    res.redirect('/Qmanager/home')

  })
 
})

router.post('/create-queue',(req,res) =>{
  QmanagerHelpers.storeQueueDetails(req.body).then((queueDetails) =>{
    QmanagerHelpers.createSlots(queueDetails).then((response)=>{
     QmanagerHelpers.gettimings(queueDetails).then((slotHr)=>{
      res.redirect('/Qmanager/home')
     })

    })
  })
})
module.exports = router;
