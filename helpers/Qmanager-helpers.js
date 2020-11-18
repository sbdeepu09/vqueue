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
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.QUEUE_COLLECTION).insertOne(Qdetails).then((data) =>{
                console.log(data.ops[0].start);
            })
        })
    }

}