var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var express=require('express');
var multer  = require('multer');
/*var storage = multer.diskStorage({
    // destination
    destination: function (req, file, cb) {
        cb(null, './uploads/')
        console.log("111111111")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        console.log('222222222222')
    }
});
var upload = multer({ storage: storage }).single('photo');*/
var upload = multer({ destination: 'uploads/' }).single('photo');


var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};

module.exports.uploadPhoto=function (req,res) {
    upload(req,res, function (err) {
        if(err){
            return err;
            console.log(err);
        }

        sendJsonResponse(res, 200, {'message':'OKKKKKKKKK'});
    });

};
module.exports.uploadPhoto= function (req,res) {

};
module.exports.uploadPhotoList=function (req,res) {

};
module.exports.photosList=function (req,res) {

};
module.exports.getPhoto=function (req,res) {

};
module.exports.photoDelete=function (req,res) {

};