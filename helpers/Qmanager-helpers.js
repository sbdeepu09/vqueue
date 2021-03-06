var db = require("../config/connection");
let rn = require('random-number')
var collection = require("../config/collections");
let nodemailer = require('nodemailer')
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { resolve, reject } = require("promise");
const { response } = require("express");
module.exports = {
  doSignup:(details)=>{
    return new Promise(async(resolve,reject)=>{
        let QmData={}
        QmData.Name=details.Name
        QmData.Email=details.Email
        QmData.Phone = details.Phone
        QmData.Password = details.Password
        QmData.Password=await bcrypt.hash(QmData.Password,10)
        QmData.Qmanager=true;
        db.get().collection(collection.QM_COLLECTION).insertOne(QmData).then((data)=>{
            resolve(data.ops[0])
        })
    })
  },
  doLogin: (QmData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let Qm = await db
        .get()
        .collection(collection.QM_COLLECTION)
        .findOne({ Email: QmData.Email });
      if (Qm) {
        bcrypt.compare(QmData.Password, Qm.Password).then((status) => {
          if(status) {
            console.log("Qmanager Login Success");
            response.Qmanager = Qm;
            response.status = true;
            resolve(response);
          } else {
            console.log("Qmanager Login Failed,password mismatch");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Qmanager Login failed,User not found");
        resolve({ status: false });
      }
    });
  },
  storeQueueDetails: (Qdetails) => {
    return new Promise((resolve, reject) => {
      Qdetails.startHr = parseInt(Qdetails.startHr);
      Qdetails.startMin = parseInt(Qdetails.startMin);
      Qdetails.endHr = parseInt(Qdetails.endHr);
      Qdetails.endMin = parseInt(Qdetails.endMin);
      Qdetails.slotHr = parseInt(Qdetails.slotHr);
      Qdetails.slotMin = parseInt(Qdetails.slotMin);
      if (Qdetails.startHr > Qdetails.endHr)
        availableHr = 24 - (Qdetails.startHr - Qdetails.endHr);
      else if (Qdetails.startHr == Qdetails.endHr) availableHr = 24;
      else availableHr = Qdetails.endHr - Qdetails.startHr;

      Qdetails.availableTime =
        availableHr * 60 + (Qdetails.endMin - Qdetails.startMin);
      Qdetails.slots =Math.floor(Qdetails.availableTime / (Qdetails.slotHr * 60 + Qdetails.slotMin))
      
        
      db.get()
        .collection(collection.QUEUE_COLLECTION)
        .insertOne(Qdetails)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },
  createSlots: (queueDetails) => {
    return new Promise((resolve, reject) => {
      //console.log(queueDetails);
      let slots = {};
      for (i = 0; i <= queueDetails.slots; i++) {
        if (i == 0) {
          slots[i] = queueDetails._id;
        } else {
          slots[i] = true;
        }
      }
      //console.log(slots);
      db.get()
        .collection(collection.QUEUESLOT_COLLECTION)
        .insertOne(slots)
        .then((data) => {
          //console.log(data.ops[0]);
          resolve(data.ops[0])
        });
    });
  },
  gettimings: (Qdetails) => {
    return new Promise((resolve, reject) => {
      //console.log(Qdetails); 
      let slothr = {};
      let slotm = {};
      slots = Qdetails.slots;
      slotlen = (Qdetails.slotHr * 60 + Qdetails.slotMin);
      slothr[0] = Qdetails.startHr;
      slotm[0] = Qdetails.startMin;
      for (i = 1; i <= slots; i++) {
        min = slotm[i - 1] + slotlen;
        if (min >= 60) {
          if (Math.floor(slothr[i - 1] + 1 + (min - 60) / 60) > 23) {
            slothr[i] = Math.floor(slothr[i - 1] + 1 + (min - 60) / 60) - 24;
          } else {
            slothr[i] = Math.floor(slothr[i - 1] + 1 + (min - 60) / 60);
          }
          slotm[i] = (min - 60) % 60;
        } else {
          slothr[i] = slothr[i - 1];
          slotm[i] = min;
        }
      }
      slothr['Qid']=Qdetails._id
      slotm['Qid']=Qdetails._id
      //console.log(slothr);
      //console.log(slotm);
      db.get().collection(collection.HRTIMING_COLLECTION).insertOne(slothr).then((data)=>{
        db.get().collection(collection.MINTIMING_COLLECTION).insertOne(slotm).then((data1)=>{
          resolve(data.ops[0])
        })
      })
    });
  },
  getQueues:(Qm)=>{
      console.log(Qm._id);
      return new Promise(async(resolve,reject)=>{
        let queues =await db.get().collection(collection.QUEUE_COLLECTION).find({QmanagerId:Qm._id}).toArray()
        resolve(queues)
      })
  },
  displayHr:(queueId)=>{
    return new Promise(async (resolve,reject)=>{
      let hr=await db.get().collection(collection.HRTIMING_COLLECTION).findOne({Qid:ObjectId(queueId)})
      resolve(hr)
    })
  },
  getslots:(queueId)=>{
    return new Promise(async(resolve,reject)=>{
      let slots = await db.get().collection(collection.QUEUESLOT_COLLECTION).findOne({0:ObjectId(queueId)})
      resolve(slots)
    })
  },
  displayMin:(queueId)=>{
    return new Promise(async (resolve,reject)=>{
      let min=await db.get().collection(collection.MINTIMING_COLLECTION).findOne({Qid:ObjectId(queueId)})
      resolve(min)
    })
  },
  deletequeue:(qid)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.QUEUE_COLLECTION).removeOne({_id:ObjectId(qid)}).then((response)=>{
        resolve(response)
      })
    })
  },
  getQueueDetails:(qid)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.QUEUE_COLLECTION).findOne({_id:ObjectId(qid)}).then((editqueue)=>{
        resolve(editqueue)
      })
    })
  },
  display:(hr,min,slots)=>{
    return new Promise((resolve,reject)=>{
      let result = [];
      let len = Object.keys(slots).length - 2;
      for(i=1;i<=len;i++){
        let ob={}
        ob.slotno=i;
        ob.status=slots[i]
        ob.startHr=hr[i-1]
        ob.startMin=min[i-1]
        ob.endHr=hr[i]
        ob.endMin=min[i]
        ob.Qid=hr.Qid
        result[i-1]=ob
      }
      resolve(result)
    })
  },
  updateQueue:(qid,Qdetails)=>{    
    return new Promise((resolve,reject)=>{
      let availableHr=0 
      Qdetails.startHr = parseInt(Qdetails.startHr);
      Qdetails.startMin = parseInt(Qdetails.startMin);
      Qdetails.endHr = parseInt(Qdetails.endHr);
      Qdetails.endMin = parseInt(Qdetails.endMin);
      Qdetails.slotHr = parseInt(Qdetails.slotHr);
      Qdetails.slotMin = parseInt(Qdetails.slotMin);
      if (Qdetails.startHr > Qdetails.endHr){
        availableHr = 24 - (Qdetails.startHr - Qdetails.endHr);
      }
      else if (Qdetails.startHr === Qdetails.endHr) {
        availableHr = 24;       
      }
      else {       
        availableHr = Qdetails.endHr - Qdetails.startHr;
      }

      Qdetails.availableTime =
        availableHr * 60 + (Qdetails.endMin - Qdetails.startMin);
      Qdetails.slots =Math.floor(Qdetails.availableTime / (Qdetails.slotHr * 60 + Qdetails.slotMin))  
      db.get().collection(collection.QUEUE_COLLECTION).updateOne({_id:ObjectId(qid)},
      {        
        $set:{
          qname:Qdetails.qname,
          startHr:Qdetails.startHr,
          startMin:Qdetails.startMin,
          endHr:Qdetails.endHr,
          endMin:Qdetails.endMin,
          slotHr:Qdetails.slotHr,
          slotMin:Qdetails.slotMin,
          availableTime:Qdetails.availableTime,
          slots:Qdetails.slots
        }
      }
      ).then((response)=>{
        db.get().collection(collection.QUEUESLOT_COLLECTION).removeOne({0:ObjectId(qid)}).then((response1)=>{
          db.get().collection(collection.HRTIMING_COLLECTION).removeOne({Qid:ObjectId(qid)}).then((response2)=>{
            db.get().collection(collection.MINTIMING_COLLECTION).removeOne({Qid:ObjectId(qid)}).then((response3)=>{
              db.get().collection(collection.QUEUE_COLLECTION).findOne({_id:ObjectId(qid)}).then((response4)=>{
                resolve(response4);
              })
            })
          })
        })
      })
    })
  },
  getBookingDetails:(Qid,slotNo)=>{
    return new Promise(async (resolve,reject)=>{
      let details = await db.get().collection(collection.BOOKING_COLLECTION).findOne({queueId:Qid,slot:slotNo})
      resolve(details.user)
    })
  },
  getUserDetails:(userId)=>{
    return new Promise(async (resolve,reject)=>{
      let userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)})
      resolve(userDetails)
    })
  },
  sendMail:(mailID)=>{
    return new Promise((resolve,reject)=>{
        var options = {
          min:  1000,
           max:  9999,
          integer: true
        }
        var otp = rn(options)
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:'femishaju19@gmail.com',
            pass: 'Femi@123'
            }
        });
        var mailOptions={
        from:'femishaju19@gmail.com',
        to:mailID.toMail,
        subject:'Qmanager Registration',
        text:`Verification Required. Your OTP is `+otp+`.Kindly do not share the details with anyone`
        };
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
            console.log(error)
            }
            else{
            console.log('Email sent')
            }
        })
        resolve(otp)

    })
  },
  updateProfile:(Qmanager,QmanagerId)=>{
    return new Promise((resolve,reject)=>{
       db.get().collection(collection.QM_COLLECTION).updateOne({_id:ObjectId(QmanagerId)},
       {
           $set:{
               Name:Qmanager.Name,
               Email:Qmanager.Email,
               Phone:Qmanager.Phone
           }
       }
       ).then((response)=>{
           db.get().collection(collection.QM_COLLECTION).findOne({_id:ObjectId(QmanagerId)}).then((response)=>{
               resolve(response)
               //console.log(response)
           })
       })
    })
}
};  
