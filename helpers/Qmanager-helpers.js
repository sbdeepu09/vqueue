var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const collections = require('../config/collections')
module.exports={
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user.Qmanager){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log('Login Success');
                        response.user=user
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log("Login Failed,password mismatch");
                        resolve({status:false});
                    }
                })
            }else{
                console.log("Login failed,User not found");
                resolve({status:false});

            }
        })
    },
    createQueue:(Qdetails)=>{
        return new Promise((resolve,reject)=>{
            Qdetails.startHr=parseInt(Qdetails.startHr)
            Qdetails.startMin=parseInt(Qdetails.startMin)
            Qdetails.endHr=parseInt(Qdetails.endHr)
            Qdetails.endMin=parseInt(Qdetails.endMin)
            Qdetails.slotHr=parseInt(Qdetails.slotHr)
            Qdetails.slotMin=parseInt(Qdetails.slotMin);
            if(Qdetails.startHr>Qdetails.endHr)
                availableHr = 24-(Qdetails.startHr-Qdetails.endHr);

            else if(Qdetails.startHr==Qdetails.endHr)
                availableHr = 24;
            else
                availableHr=Qdetails.endHr-Qdetails.startHr;
            
            Qdetails.availableTime=(availableHr*60)+(Qdetails.endMin-Qdetails.startMin);
            Qdetails.slots=Qdetails.availableTime/((Qdetails.slotHr*60)+Qdetails.slotMin);
            
            db.get().collection(collection.QUEUE_COLLECTION).insertOne(Qdetails).then((data) =>{
                console.log(data.ops[0]);
            })
        })
    }

}