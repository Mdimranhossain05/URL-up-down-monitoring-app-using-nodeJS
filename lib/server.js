/*
 Title : Server library
 Description: Server realated files
 Author: Imran
 Date: 22/09/2024
*/


const http = require('http');
const { handleReq } = require("../helpers/handleReqRes");
const environment = require("../helpers/environment");

const server = {};


server.config = {
    port: environment.port,
};

server.createServer = () => {
    const createServerVariable = http.createServer(handleReq);            //handleReq function is just handling request that is imported from helpers folder
    createServerVariable.listen(server.config.port, () => {
        console.log(`Listening to port number ${server.config.port}`);
        console.log(`Running on ${environment.envName}`);
    });
};


server.init = () => { 
    server.createServer(); 
};

module.exports = server;