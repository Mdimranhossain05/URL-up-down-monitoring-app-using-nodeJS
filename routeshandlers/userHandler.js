/*
 Title : User Handler
 Description: Handle User if he wanted to crate/update/delete user 
 Author: Imran
 Date: 17/09/2024
*/

var data = require("../lib/data");
const { hash, parseJSON } = require("../helpers/utilities");
const tokenHandler = require("../routeshandlers/tokenHandler");

const handler = {}


handler.userhandler = (requestProperties, callBack) => {

    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._user[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(405); //405 is code for not accepted request
    }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {

    const firstName = typeof (requestProperties.body.firstName) == "string" &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) == "string" &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) == "string" &&
        requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) == "string" &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof (requestProperties.body.tosAgreement) == "boolean" ? requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('users', phone, (err1) => {
            if (err1) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };

                //store the user to database
                data.create("users", phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, { message: "User created successfully" })
                    } else {
                        callback(500, { error: "could not create user" });
                    };
                });

            } else {
                callback(500, {
                    error: "User already exist"
                });
            };
        });
    } else {
        callback(400, {
            error: "There is a problem in your request",
        });
    };
};

handler._user.get = (requestProperties, callback) => {
    const phone = typeof (requestProperties.queryStringObj.phone) == "string" &&
        requestProperties.queryStringObj.phone.trim().length === 11 ? requestProperties.queryStringObj.phone : false;

    if (phone) {
        //verifyng user with token from header objct
        let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, phone, (tokenBool)=>{
            if(tokenBool){

                data.read('users', phone, (err, u) => {
                    const user = {...parseJSON(u)}; //making deep copy
                    delete user.password;       //deleting the password for user
        
                    if(!err && user){
                        callback(200, user);
                    }else {
                        callback(404, {
                            error : "Requested user was not found"
                        });
                    };
                });

            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            }
        });

    }else {
        callback(400, {error : "There is problem in your reqest"});
    };
};

handler._user.put = (requestProperties, callback) => {

    const phone = typeof (requestProperties.body.phone) == "string" &&
        requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const firstName = typeof (requestProperties.body.firstName) == "string" &&
        requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) == "string" &&
        requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const password = typeof (requestProperties.body.password) == "string" &&
        requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if(phone) {
        if (firstName || lastName || password){

            //verifyng user with token from header objct
        let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, phone, (tokenBool)=>{
            if(tokenBool){
                
                data.read("users", phone, (err1, u) => {

                    userData = {...parseJSON(u)};
                    if(!err1 && userData){
    
                        if(firstName){
                            userData.firstName = firstName
                        };
                        if(lastName){
                            userData.lastName = lastName
                        };
                        if(password){
                            userData.password = hash(password);
                        };
    
                        //save to file
                        data.update("users", phone, userData, (err2) => {
                            if(!err2){
                                callback(200, {
                                    message: "user updated successfuly",
                                });
                            }else {
                                callback(500, {
                                    error : "There was a problem in the server side"
                                })
                            }
                        })
    
                    }else {
                        callback(400, {
                            error : "You have problem in your request"
                        });
                    }
                });

            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            }
        });

            
        }else {
            callback(400, {
                error : "You have problem in your request"
            });
        };
    }else {
        callback(400, {
            error : "Invalid phone number, Try again with a valid phone number."
        });
    };
    
};

handler._user.delete = (requestProperties, callback) => {
    const phone = typeof (requestProperties.queryStringObj.phone) == "string" &&
        requestProperties.queryStringObj.phone.trim().length === 11 ? requestProperties.queryStringObj.phone : false;

    if (phone){

        //verifyng user with token from header objct
        let token = typeof(requestProperties.headersObj.token) == "string" ?
        requestProperties.headersObj.token : false;

        tokenHandler._token.verifyToken(token, phone, (tokenBool)=>{
            if(tokenBool){

                data.read("users", phone, (err1, userData) => {
                    if (!err1 && userData){
        
                        data.delete("users", phone, (err2) => {
                            if(!err2){
                                callback(200, {
                                    message : "User was successfully deleted!"
                                });
                            }else {
                                callback(500, {
                                    error: "There was a server side error"
                                });
                            };
                        });
        
                    }else{
                        callback(500, {
                            error : "User was not found"
                        });
                    };
                });

            }else{
                callback(403, {error: "Authorization error"}); //403 for auth error
            }
        });

    }else {
        callback(400, {
            "error" : "There was a aproblem in your request"
        });
    };
};

module.exports = handler