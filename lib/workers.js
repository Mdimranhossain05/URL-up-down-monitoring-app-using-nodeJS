/*
 Title : Workers library library
 Description: Workers realated files
 Author: Imran
 Date: 22/09/2024
*/

const { parseJSON } = require("../helpers/utilities");
const data = require("./data");
const url = require('url');
const http = require("http");
const https = require("https");
const {sendTwilioSMS} = require("../helpers/notification");

const workers = {};

//validate individual check data

//lookup all checks
workers.ghatherAllChecks = () => {
    //get all the checks
    data.list("check", (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {

            checks.forEach(check => {
                //read the checkdata
                data.read("check", check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        workers.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log("Error:22 " + err2);
                    };
                });
            });
        } else {
            console.log("Error: " + err1);
        };
    });
};

//validate check data
workers.validateCheckData = (originalCheckData) => {
    if (originalCheckData && originalCheckData.id) {
        originalCheckData.state = typeof (originalCheckData.state) == 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

        originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == "number" &&
            originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        //pass to the next process
        workers.performCheck(originalCheckData);

    } else {
        console.log("Error: check was invalid or not properly formatted");
    };
};

workers.performCheck = (originalCheckData) => {

    //prepare the initial check outcome
    let checkOutCome = {
        "error": false,
        "responseCode": false
    };

    //mark the outcome has not sen yet
    let outcomeSent = false;

    //parse the host name from original data
    let parsedUrl = url.parse(originalCheckData.protocol + "://" + originalCheckData.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    //construct the request
    const requestDetailsObject = {
        'protocol': originalCheckData.protocol + ":",
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    const protocolToUse = originalCheckData.protocol == "http" ? http : https;

    let req = protocolToUse.request(requestDetailsObject, (res) => {
        //grab the status of the response
        const status = res.statusCode;

        //update the check outcome and pass to the next process
        checkOutCome.responseCode = status;

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };

    });

    req.on('error', (e) => {

        checkOutCome = {
            error: true,
            value: e
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };
    });

    req.on('timeout', (e) => {

        checkOutCome = {
            error: true,
            value: 'timeout'
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        };
    });

    //req send
    req.end();

};

workers.processCheckOutcome = (originalCheckData, checkOutCome) => {
    //checkoutcome up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && 
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    //decide whether we should alert the user or not
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state != state ? true : false;

    //update the checkdata 
    let newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //update the check
    data.update('check', newCheckData.id, newCheckData, (err)=>{
        if(!err){
            if(alertWanted){
            //save the checkdata to next process
            workers.alertUserToStatusChange(newCheckData);
            }else{
                console.log("Alert is not needed");
            }
        }else {
            console.log("Error trying to save check data of one of the checks")
        }
    });
}

//send message to user
workers.alertUserToStatusChange = (newCheckData) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} 
    ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwilioSMS(newCheckData.userPhone, msg, (err, message) => {
        if(!err){
            console.log(`Successed. SMS: ${msg}`)
        }else{
            console.log(message)
        }
    });
}

//timer to execute worker once per minuit
workers.loop = () => {
    setInterval(() => {
        workers.ghatherAllChecks();
    }, 8000);
};

workers.init = () => {
    //executes all the checks
    workers.ghatherAllChecks();

    //call the loops
    workers.loop();
};

module.exports = workers;