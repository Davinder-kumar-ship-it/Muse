
'use strict';
const crypto=require('crypto');
const activeSession={
    

    checkToken:function(objectInJson)
    {
        console.log('we are checking: the user exist or not');
        if(this[objectInJson.token])return true;
        else false;
    },
    deleteToken:function(objectInJson)
    {
        delete this[objectInJson.token];
    }
};

const token=(recivedObject)=>
{
    const newTokenGeneration=crypto.randomBytes(16).toString('hex');
    activeSession[newTokenGeneration]=recivedObject.username;
    console.log(activeSession.checkToken({"token":newTokenGeneration}));
    console.log(typeof newTokenGeneration);
    return {"token":newTokenGeneration};
}
const removeFromActiveSession=(tokenDataInJson)=>
{
    activeSession.deleteToken(tokenDataInJson);
    return {'message':'sucessfully logout'};
}
const checkingToken=(tokenDataInJson)=>
{
    console.log(tokenDataInJson.token);
    return activeSession.checkToken(tokenDataInJson);
}
module.exports={token,checkingToken,removeFromActiveSession};


