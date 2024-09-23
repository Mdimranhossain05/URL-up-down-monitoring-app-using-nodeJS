var data = require("../lib/data");
const { hash, parseJSON, createRandomString } = require("../helpers/utilities");
const tokenHandler = require("../routeshandlers/tokenHandler");
const {maxCheck} = require("../helpers/environment");

const handler = {}


handler.checkHandler = (requestProperties, callBack) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(405); //405 is code for not accepted request
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    const protocol = typeof (requestProperties.body.protocol) == "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof (requestProperties.body.url) == "string" &&
    requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof (requestProperties.body.method) == "string" &&
    ["get","post","put","delete"].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof (requestProperties.body.successCodes) == "object" &&
    (requestProperties.body.successCodes)instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) == "number" &&
    requestProperties.body.timeoutSeconds % 1 == 0 && requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;


    if (protocol && url && method && successCodes && timeoutSeconds){

        //verifyng user with token from header objct
        let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        data.read("tokens", token, (err1, t) => {
            
            if(!err1 && t){
                tokenData = parseJSON(t);

                let userPhone = tokenData.phone;

                data.read("users", userPhone, (err2, u) => {
                    if(!err2 && u){
                        tokenHandler._token.verifyToken(token, userPhone, (tokenBool) => {
                            if(tokenBool){
                                let userObject = parseJSON(u);

                                let userChecks = typeof(userObject.checks) == "object" && 
                                userObject.checks instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxCheck){
                                    let checkID = createRandomString(20);
                                    let checkObject = {
                                        "id" : checkID,
                                        "userPhone" : userPhone,
                                        "protocol" : protocol,
                                        "url" : url,
                                        "method" : method,
                                        "successCodes" : successCodes,
                                        "timeoutSeconds": timeoutSeconds
                                    };
                                    //save

                                    data.create("check", checkID, checkObject, (err3)=>{
                                        if(!err3){
                                            //add check Id to user object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkID);

                                            //save the new user 
                                            data.update("users", userPhone, userObject, (err4)=>{
                                                if(!err4){
                                                    //return data
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500, {error : "Server side error"});
                                                }
                                            });
                                        }else{
                                            callback(500, {error : "Server side problem"})
                                        }
                                    });

                                }else{
                                    callback(401, {error: "Max checks limit reached"})
                                }
                                
                            }else {
                                callback(403, {error : "Authintaction problem"});
                            };
                        });
                    }else {
                        callback(403, {error : "User not found"});
                    }
                });

            }else{
                callback(403, {error : "Authintication problem"});
            }
        });

    }else {
        callback(400, {error : "You have problem in your request"});
    };
};

handler._check.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObj.id) == "string" &&
        requestProperties.queryStringObj.id.trim().length == 20 ? requestProperties.queryStringObj.id : false;

    if(id){
        data.read("check", id, (err1, c) => {
            checkData = {...parseJSON(c)};
            if(!err1 && checkData){
                let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, checkData.userPhone, (tokenBool)=>{
            if(tokenBool){
                callback(200, checkData);
            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            }
        });
            }else {
                callback(500, {error : "Problem in your request"});
            };
        });
    }else{
        callback(400, {error : "Problem in your request"});
    }
};

handler._check.put = (requestProperties, callback) => {

    const id = typeof (requestProperties.body.id) == "string" &&
        requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    
    const protocol = typeof (requestProperties.body.protocol) == "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof (requestProperties.body.url) == "string" &&
    requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof (requestProperties.body.method) == "string" &&
    ["get","post","put","delete"].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof (requestProperties.body.successCodes) == "object" &&
    (requestProperties.body.successCodes)instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) == "number" &&
    requestProperties.body.timeoutSeconds % 1 == 0 && requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if(id){

        if(protocol || url || method || successCodes || timeoutSeconds){

            data.read("check", id, (err1, c)=>{

                if(!err1 && c){
                    let checkObject = {...parseJSON(c)};

                    let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, checkObject.userPhone, (tokenBool)=>{
            if(tokenBool){

                if(protocol){
                    checkObject.protocol = protocol;
                }
                if(url){
                    checkObject.url = url;
                }
                if(method){
                    checkObject.method = method;
                }
                if(successCodes){
                    checkObject.successCodes = successCodes;
                }
                if(timeoutSeconds){
                    checkObject.timeoutSeconds = timeoutSeconds;
                };

                data.update("check", id, checkObject, (err2)=>{
                    if(!err2){
                        callback(200, checkObject);
                    }else{
                        callback(500, {error: "Server side error"});
                    };
                });

            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            };
        });

                }else{
                    callback(500, {error : "Server side error"});
                };

            });

        }else{
            callback(400, {error : "You have to provide at least one field"});
        }

    }else{
        callback(400, {error : "You have problem in your request"});
    };
    
};

handler._check.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObj.id) == "string" &&
        requestProperties.queryStringObj.id.trim().length == 20 ? requestProperties.queryStringObj.id : false;

    if(id){
        data.read("check", id, (err1, c) => {
            checkData = {...parseJSON(c)};
            if(!err1 && checkData){
                let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, checkData.userPhone, (tokenBool)=>{
            if(tokenBool){
                data.delete("check", id, (err2)=>{
                    if(!err2){
                        // deleting checkid fromuser
                        data.read("users", checkData.userPhone, (err3, u)=>{
                            if(!err3 && u){
                                const userObject = {...parseJSON(u)};

                                const userChecks = typeof(userObject.checks) == "object" &&
                                userObject.checks instanceof Array ? userObject.checks : [];
                                
                                let checkPosition = userChecks.indexOf(id);
                                if(checkPosition > -1){
                                    userChecks.splice(checkPosition, 1);

                                    userObject.checks = userChecks;

                                    data.update("users", userObject.phone, userObject, (err4)=>{
                                        if(!err4){
                                            callback(200, {message: "Successfully deleted"});
                                        }else{
                                            callback(500, {error :"Server side error"});
                                        };
                                    });
                                }else{
                                    callback(500, {error : "Id not exist"});
                                };
                            }else{
                                callback(500, {error : "Server side problem"})
                            }
                        })
                    }else{
                        callback(500, {error : "There was a server side problem"});
                    };
                });
            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            }
        });
            }else {
                callback(500, {error : "Problem in your request"});
            };
        });
    }else{
        callback(400, {error : "Problem in your request"});
    };
};

module.exports = handler