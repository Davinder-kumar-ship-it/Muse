'use strict';
const fs=require('fs');
const path=require('path');
const downloadFile=(filepath,encoding='utf8')=>
{
    return new Promise((resolve,reject)=>
    {
        fs.readFile(filepath,encoding,(err,fileData)=>{
                
            if(!err) return resolve(fileData);
            reject(err);
        })
    })
}
const readFile=async (mood)=>
{
    try{
        const filepath=path.join(__dirname,'..','data',`${mood}.json`);
        const encoding='utf8';
        const userDataWhichAlreadyLogin=await downloadFile(filepath,encoding);
        return userDataWhichAlreadyLogin;
    }
    catch(err)
    {
        throw err;
    }
}
module.exports=readFile;