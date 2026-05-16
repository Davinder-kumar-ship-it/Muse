'use strict';
const fs=require('fs');
const writingDataIntoFile=(filepath,data)=>
{
    return new Promise((resolve,reject)=>
    {
        fs.writeFile(filepath,data,'utf-8',(err)=>{
            if(err)reject('file is not write succesfully')
            resolve('file successfully write');
        });
    })
}
const writeFile=async (filepath,data)=>
{
   const statusOFFile=await writingDataIntoFile(filepath,data);
   return statusOFFile;
}
module.exports={writeFile};