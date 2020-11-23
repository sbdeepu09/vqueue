var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const collections = require("../config/collections");
module.exports = {
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user.Qmanager) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed,password mismatch");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login failed,User not found");
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
      Qdetails.slots =
        Qdetails.availableTime / (Qdetails.slotHr * 60 + Qdetails.slotMin);

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
       console.log(Qdetails); 
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
      console.log(slothr);
      console.log(slotm);
    });
  },
  getQueues:(user)=>{
      console.log(user._id);
      return new Promise(async(resolve,reject)=>{
        let queues =await db.get().collection(collection.QUEUE_COLLECTION).find({userId:user._id}).toArray()
        resolve(queues)
      })
  }
};
