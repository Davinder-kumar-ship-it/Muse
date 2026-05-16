'use strict';
const fs=require('../fileHandler/writeFile')
const crypto=require('crypto');
const dbOfWhichUserAlreadyExit=require('../fileHandler/readFileOfUser');//here we can use destructing of object when we do destructing then name should be same
//check the use user exit or not 
const path=require('path');

const scrypt=(password,randomSalt)=>
{
    return new Promise((resolve,reject)=>{
        crypto.scrypt(password,randomSalt,64,(err,hash)=>{
            if(err)reject(err);
            resolve(hash.toString('hex'));
        })
    })
}
const createHashWithSalt=async (password)=>
{
    const randomSalt=crypto.randomBytes(16).toString('hex');
    const hash=await scrypt(password,randomSalt,64);
    return `${randomSalt}:${hash}`;
}

// the user will distinct from their name
const filepath=path.join('authorization');
async function main(userRequestData){
   
    const data=await dbOfWhichUserAlreadyExit(filepath,'utf8');
    console.log(data,'1');
    const dataIntoJson=JSON.parse(data);
    //we have to get post method.
    // now checking method
    if(Array.isArray(dataIntoJson))
    {
        console.log(`the data is Array`);
        console.log(userRequestData);
        for(let item of dataIntoJson)
        {
            let {username}=item;
            console.log(username)
            if(username===userRequestData.username){
                return false;
            }
            
        }   
        //pushing data into actual file
        const hashingWithSalt=await createHashWithSalt(userRequestData.password);//return value salt:hashing
        userRequestData.password=hashingWithSalt;
        console.log(userRequestData);
        dataIntoJson.push(userRequestData);
        console.log(JSON.stringify(dataIntoJson));
        const message=await fs.writeFile(filepath,JSON.stringify(dataIntoJson));
        console.log(message);
        return true;//what status user is exist or not....
    }    
}
module.exports=main;
