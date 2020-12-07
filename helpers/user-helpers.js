var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { resolve, reject } = require('promise')
const { ObjectId } = require('mongodb')
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops[0])
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
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
    getAllQueues:()=>{
        return new Promise(async(resolve,reject)=>{
            let queues =await db.get().collection(collection.QUEUE_COLLECTION).find().toArray()
            resolve(queues)
          })
    },
    display:(hr,min,slots)=>{ 
        return new Promise((resolve,reject)=>{         
            let result = []
            let len=Object.keys(slots).length-2
            
            for(i=1;i<=len;i++){
                let obj={}
               if(slots[i]===true){
                obj.slotno=i
                obj.status=true
                obj.startHr=hr[i-1]
                obj.startMin=min[i-1]
                obj.endHr=hr[i]
                obj.endMin=min[i]
                obj.Qid=hr.Qid
                result[i-1]=obj
               }
               else{
                   continue
               }
            }
            resolve(result)
        })     
    },
    getQName:(queueId)=>{
        return new Promise(async (resolve,reject)=>{
            let Qdetails = await db.get().collection(collection.QUEUE_COLLECTION).findOne({_id:ObjectId(queueId)})
            resolve(Qdetails)  
        })
    },
    bookSlot:(Qid,slotNo,userId)=>{
        return new Promise((resolve,reject)=>{
         db.get().collection(collection.QUEUESLOT_COLLECTION).updateOne({0:ObjectId(Qid)},
         {
             $set:{
              [slotNo]:false  
             }
         }
         )
         resolve(Qid)
         db.get().collection(collection.BOOKING_COLLECTION).insert({queueId:Qid,slot:slotNo,user:userId})
        })
    },
    getSlotDetails:(Qid,slotNo)=>{
        return new Promise(async (resolve,reject)=>{
            eh=parseInt(slotNo)
            sh=eh-1
            eh=eh.toString()
            sh=sh.toString()
            let hrObj= await db.get().collection(collection.HRTIMING_COLLECTION).findOne({Qid:ObjectId(Qid)})
            let minObj = await db.get().collection(collection.MINTIMING_COLLECTION).findOne({Qid:ObjectId(Qid)})
            let resultObj={}
            resultObj.startHr=hrObj[sh]
            resultObj.startMin=minObj[sh]
            resultObj.endHr=hrObj[eh]
            resultObj.endMin=minObj[eh]
            resultObj.slotNo=slotNo
            
            resolve(resultObj)
        })
    },
    updateprofile:(user,userid)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userid)},
           {
               $set:{
                   Name:user.Name,
                   Email:user.Email,
                   Phone:user.Phone
               }
           }
           ).then((response)=>{
               db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userid)}).then((response)=>{
                   resolve(response)
                   console.log(response)
               })
           })

        })
    }
    
    
}