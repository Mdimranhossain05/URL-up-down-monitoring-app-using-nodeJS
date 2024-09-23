/*
 Title : Project initial file
 Description: Initial file to start the node server
 Author: Imran
 Date: 22/09/2024
*/

const server = require("./lib/server");
const workers = require("./lib/workers");

const app = {};

app.init = ()=>{
    //start the server
    server.init();

    //start ther workers
    workers.init();
};

app.init();

module.exports = app;