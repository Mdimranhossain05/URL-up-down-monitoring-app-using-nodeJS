/*
 Title : Environment
 Description: Handle Environment (staging / production)
 Author: Imran
 Date: 18/09/2024
*/

const environment = {};

environment.staging = {
    port : 3000,
    envName : "staging",
    secretKey : "stasta",
    maxCheck : 5,
    twilio : {
        // fromPhone : '+13319996145',
        // accountSid : 'ACbe8548bde4affed0dfb2170e582e9050',
        // authToken : '0672a2dac7d067b688ee913499168b8a'
    }
};

environment.production = {
    port : 5000,
    envName : "production",
    secretKey : "propro",
    maxCheck : 5,
    twilio : {
        // fromPhone : '+13319996145',
        // accountSid : 'ACbe8548bde4affed0dfb2170e582e9050',
        // authToken : '0672a2dac7d067b688ee913499168b8a'
    }
};

const currEnv = typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV : 'staging';

const envToExport = typeof environment[currEnv] == 'object' ? environment[currEnv] : environment.staging;

module.exports = envToExport;