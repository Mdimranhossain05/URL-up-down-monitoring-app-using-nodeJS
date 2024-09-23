var data = require("../lib/data");
const { hash, parseJSON, createRandomString } = require("../helpers/utilities");

const handler = {}


handler.tokenHandler = (requestProperties, callBack) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(405); //405 is code for not accepted request
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {

    const phone = typeof (requestProperties.body.phone) == "string" &&
        requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) == "string" &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password){

        data.read("users", phone, (err1, u) => {
            let hashedPassword = hash(password);
            userData = parseJSON(u);

            if(!err1 && hashedPassword == userData.password ){
                let tokenID = createRandomString(20);
                let expires = Date.now() + 60*60*1000;
                let tokenObject = {
                    "phone" : phone,
                    "id" : tokenID,
                    "expires" : expires
                };

                data.create("tokens", tokenID, tokenObject, (err2) => {
                    if (!err2){
                        callback(200, tokenObject)
                    }else{
                        callback(500, {error: "There was a problem in the server side"});
                    }
                });

            }else {
                callback(400, {error : "Wrong password and phone"});
            }
        });

    }else {
        callback(400, {error : "You have problem in your request"});
    }
};

handler._token.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObj.id) == "string" &&
        requestProperties.queryStringObj.id.trim().length == 20 ? requestProperties.queryStringObj.id : false;

    if (id) {
        data.read('tokens', id, (err, u) => {

            const tokenObj = {...parseJSON(u)}; //making deep copy

            if(!err && tokenObj){
                callback(200, tokenObj);
            }else {
                callback(404, {
                    error : "Requested token was not found"
                });
            };
        });
    }else {
        callback(400, {error : "There is problem in your reqest"});
    };
};

handler._token.put = (requestProperties, callback) => {

    const id = typeof(requestProperties.body.id) == "string" &&
        requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    
    const extend = typeof(requestProperties.body.extend) == "boolean" && 
    requestProperties.body.extend == true ? true : false;

    if (id && extend){
        data.read("tokens", id, (err1, u) => {

            const tokenData = {...parseJSON(u)};

            if (tokenData.expires > Date.now()) {
                if(!err1 && tokenData){
                    tokenData.expires = Date.now() * 60 * 60 * 1000 ;

                    data.update("tokens", id, tokenData,(err2) => {
                        if(!err2){
                            callback(200, {message : "token updated successfully"});
                        }else {
                            callback(500, {error : "There was a server side error"});
                        }
                    });
                }else {
                    callback(504, {error : "Requested token was not found"});
                };
            }else {
                callback(400, {error : "Token already expired"});
            };
        });
    }else{
        callback(400, {error : "Bad request"});
    }

};

handler._token.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObj.id) == "string" &&
        requestProperties.queryStringObj.id.trim().length == 20 ? requestProperties.queryStringObj.id : false;

    if(id){
        data.read('tokens', id, (err1, u) => {
            if(!err1 && u){
                data.delete("tokens", id, (err2)=>{
                    if(!err2){
                        callback(200, {message : "Token successfully deleted"});
                    }else{
                        callback(500, {error : "There was a server side error"});
                    };
                });
            }else{
                callback(500, {error : "Token was not found"})
            };
        });
    }else {
        callback(400, {error : "Bad request"});
    };
};

handler._token.verifyToken = (id, phone, callback) => {
    data.read("tokens",id, (err1, t) => {
        if(!err1 && t){
            tokenData = {...parseJSON(t)};

            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            }else {
                callback(false);
            };
        }else{
            callback(false);
        };
    });
};

module.exports = handler