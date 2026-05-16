const fs =require('fs');
const path=require('path');
const processFileData=(callback)=>
{
    const filePath=path.join(__dirname,'..','data','task.json');
    fs.readFile(filePath,'utf8',(err,readDataFromJsonFile)=>
    {
        console.log('davinder');
        if(err)callback(err);
        callback(null,readDataFromJsonFile);
    })
}
const writeDataInjsonFile=(recivedDataFromClient)=>
{
    const filePath=path.join(__dirname,'..','data','task.json');
    processFileData((err,jsonFile)=>
    {
        let parsedIntoJsonFileOfdb=JSON.parse(jsonFile);
        console.log(`json data :${jsonFile}`,typeof parsedIntoJsonFileOfdb,`\n`,parsedIntoJsonFileOfdb);
        if(Array.isArray(parsedIntoJsonFileOfdb))
        {
            console.log('davinder');
            parsedIntoJsonFileOfdb.push(recivedDataFromClient);
            console.log(parsedIntoJsonFileOfdb);
            fs.writeFile(filePath,JSON.stringify(parsedIntoJsonFileOfdb),'utf8',(err)=>
            {
                if(err)throw err;
            })
        }   
    });
}
const Json={
    name:"davinder",
    roll:2,
};

//readJsonDataFromJsonFile();
module.exports={processFileData,writeDataInjsonFile};
