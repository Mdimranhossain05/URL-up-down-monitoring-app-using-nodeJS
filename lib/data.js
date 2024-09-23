/*
 Title : Handle Data
 Description: Handle Data on .data folder (create/read/update)
 Author: Imran
 Date: 17/09/2024
*/

const fs = require('fs')
const path = require('path')

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+"/"+file+".json", "wx", (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (err1) => {
                if(!err){
                    fs.close(fileDescriptor, (err2) => {
                        if (!err2) {
                            callback(false);
                        }else {
                            callback("Error closing the file");
                        };
                    });
                }else {
                    callback("error writing new file error:",+err1);
                };
            });
        }else {
            callback("Could not create new file error:"+ err);
        };
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+"/"+file+".json", "utf8", (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(lib.baseDir+dir+"/"+file+".json", "r+", (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, (err1)=>{
                if (!err1) {
                    fs.writeFile(fileDescriptor, stringData, (err2) => {
                        if(!err2){
                            fs.close(fileDescriptor, (err3) => {
                                if (!err3) {
                                    callback(false);
                                }else {
                                    callback("Error closing the file");
                                };
                            });
                        }else {
                            callback("error writing new file error:",+err2);
                        };
                    });
                }
                else{
                    callback(err1)};
            });

            
        }else {
            callback("Could not create new file error:"+ err);
        };
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir+dir+"/"+file+".json", (err) => {
        if (!err){
            callback(false);
        }else {
            callback(`Error deleting file`);
        }
    })
};

//all list of directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.baseDir+dir}/`, (err, fileNames) => {
        if(!err && fileNames && fileNames.length > 0){
            let trimmedFileNames = [];
            fileNames.forEach((fileName)=>{
                trimmedFileNames.push(fileName.replace('.json', ""));
            });
            callback(err, trimmedFileNames);
        }else{
            callback(err, "Error reading directory");
        }
    });
};

module.exports = lib;