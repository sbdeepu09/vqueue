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
            console.log(hr,min);          
            let result = []
            let len=Object.keys(slots).length-2
            
            for(i=1;i<=len;i++){
                let obj={}
               if(slots[i]===true){
                
                obj.status=true
                obj.startHr=hr[i-1]
                obj.startMin=min[i-1]
                obj.endHr=hr[i]
                obj.endMin=min[i]
                result[i-1]=obj
               }
              
            }
            resolve(result)

        })     
    },
    getQName:(queueId)=>{
        return new Promise(async (resolve,reject)=>{
            let name = await db.get().collection(collection.QUEUE_COLLECTION).findOne({_id:ObjectId(queueId)})
            resolve(name.qname)  
        })
    }

}