/*
 Title : Handle Routes
 Description: Handle Routes by url path
 Author: Imran
 Date: 17/09/2024
*/

const { sampleHandler } = require("./routeshandlers/sampleHandler");
const { userhandler } = require("./routeshandlers/userHandler");
const { tokenHandler } = require("./routeshandlers/tokenHandler");
const { checkHandler } = require("./routeshandlers/checkHandler");

const routes = {
    "sample" : sampleHandler,
    "user" : userhandler,
    "token" : tokenHandler,
    "check" : checkHandler
}

module.exports = routes