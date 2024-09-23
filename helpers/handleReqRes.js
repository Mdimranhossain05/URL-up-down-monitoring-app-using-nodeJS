/*
 Title : Handle Request Response
 Description: Handle Request and Response
 Author: Imran
 Date: 17/09/2024
*/

const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../routeshandlers/notFoundHandler');
const {parseJSON} = require("./utilities");

const handler = {}

handler.handleReq = (req, res) => {

    //ignoring favicon request
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
      }

    const parsedUrl = url.parse(req.url, true);
    const trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, ""); //trimming extra slash of url
    const method = req.method.toLowerCase();        //getting the request method
    const queryStringObj = parsedUrl.query;         //getting the queries if given
    const headersObj = req.headers;                 //getting all headers that provided with request
    
    const requestProperties = {trimmedPath, method, queryStringObj, headersObj};

    const chosenHandler = routes[trimmedPath]? routes[trimmedPath] : notFoundHandler;

    //to decode the bodysString provided with req
    const decoder = new StringDecoder('utf-8');
    var reqBody = "";

    req.on('data', (buffer) => {
        reqBody += decoder.write(buffer);
    });

    req.on('end', () => {
        
        reqBody += decoder.end();

        //avoiding the error if bodyString is not valid JSON format with parseJSON function
        requestProperties.body = parseJSON(reqBody);

        chosenHandler(requestProperties, (statusCode, payLoad) => {

            statusCode = typeof statusCode == 'number' ? statusCode : 500;

            payLoad = typeof payLoad == 'object' ? payLoad : {};
            
            payLoadString = JSON.stringify(payLoad);
    
            res.setHeader('Content-Type', "application/json"); //to get the response as JSON
            res.writeHead(statusCode);
            res.end(payLoadString);
        });

    });
};

module.exports = handler