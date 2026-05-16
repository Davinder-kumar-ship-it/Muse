'use strict';
const fs=require('fs');
const path=require('path');
const renderFileForBrowser=(filepath,encoding)=>
{
    return new Promise((resolve,reject)=>
    {
        fs.readFile(filepath,encoding,(err,htmlFile)=>
        {
            if(err)reject(new Error('file has not found'));
            resolve(htmlFile);
        })
    })
}
const readHtmlFile=async ()=>
{
    try{
        const filepath=path.join(__dirname,'..','frontend','index.html');
        const encoding='utf8';
        const html=await renderFileForBrowser(filepath,encoding);
        console.log(html);
        return html;
    }
    catch(error)
    {
        console.log(error)
        return error;
    }
}
const readCssFile=async ()=>
{
    try{
        const filepath=path.join(__dirname,'..','frontend','css','style.css');
        const encoding='utf8';
        const html=await renderFileForBrowser(filepath,encoding);
        console.log(html);
        return html;
    }
    catch(error)
    {
        console.log(error)
        return error;
    }

}
const readJsFile=async ()=>
{
    try{
        const filepath=path.join(__dirname,'..','frontend','js','auth.js');
        const encoding='utf8';
        const js=await renderFileForBrowser(filepath,encoding);
        console.log(js);
        return js;
    }
    catch(error)
    {
        console.log(error)
        return error;
    }

}

module.exports={readHtmlFile,readCssFile,readJsFile};
