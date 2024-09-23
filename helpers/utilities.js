
const crypto = require('crypto');
const environment = require("../helpers/environment");

const utilities = {};

utilities.parseJSON = (stringData) => {
    let output;

    try {
        output = JSON.parse(stringData);
    } catch {
        output = {}
    }

    return output;
}

utilities.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');
        return hash;
    } else {
        return false
    };
};

utilities.createRandomString = (strLength) => {
    let length = strLength;

    length = typeof strLength == "number" && strLength > 0 ? strLength : false;

    let output = '';

    if (length) {
        chars = "abcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++) {
            output += chars.charAt(Math.floor(Math.random() * chars.length));
        };

        return output;
    } else {
        return false
    }

};

module.exports = utilities;