/*
 Title : Not Found Handler
 Description: Not found Routes
 Author: Imran
 Date: 17/09/2024
*/
const handler = {}

handler.notFoundHandler = (requestProperties, callBack) => {
    callBack(404, {
        message: "This page is not found"
    });
};

module.exports = handler
