var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var express=require('express');
var multer  = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Destination');
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log('Filename');
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage }).single('picture');

var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};

module.exports.uploadPhoto= function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            sendJsonResponse(res, 404, err);
            // An error occurred when uploading
        }



        sendJsonResponse(res, 200, {"message": "Uploaded!"});
        // Everything went fine
    })
};
module.exports.uploadPhotoList=function (req,res) {

};
module.exports.photosList=function (req,res) {

};
module.exports.getPhoto=function (req,res) {

};
module.exports.photoDelete=function (req,res) {

};