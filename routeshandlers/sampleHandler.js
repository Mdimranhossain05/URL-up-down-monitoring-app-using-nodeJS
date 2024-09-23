/*
 Title : Sample Handler
 Description: Handle Sample Routes
 Author: Imran
 Date: 17/09/2024
*/
const handler = {}

handler.sampleHandler = (requestProperties, callBack) => {
    console.log(requestProperties);
    callBack(200, {message: "From Sample Handler"});
};

module.exports = handler
