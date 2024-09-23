const https = require("https");


const notifications = {}
const { twilio } = require("./environment");


//send SMS using twilio API
notifications.sendTwilioSMS = async (phone, msg, callback) => {
    //input validation
    const userPhone = typeof (phone) == "string" && phone.trim().length == 11 ? `+88${phone.trim()}` : false;
    const userMsg = typeof (msg) == "string" && msg.trim().length > 0 && msg.trim().length <= 1600 ?
        msg.trim() : false;

    if (userPhone && userMsg) {
        const accountSid = twilio.accountSid;
        const authToken = twilio.authToken;
        const client = require('twilio')(accountSid, authToken);

        client.messages
            .create({ from: twilio.fromPhone, body: userMsg, to: userPhone })
            .then(message => {
                callback(false, message);
            });

    } else {
        callback(true, {error : "Given inputs are not valid"});
    }
};

//export module
module.exports = notifications