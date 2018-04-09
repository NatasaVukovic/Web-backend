var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var express=require('express');
var multer  = require('multer');
let path = require('path');
let fs = require('fs');
var jwt = require('jsonwebtoken');
var user=mongoose.model('User');

var getAuthor= function (req, res, callback) {
    var decoded = jwt.decode(req.query.token);
    if (decoded.email){
      user
          .findOne({email : decoded.email})
          .exec(function (err, user) {
              if(!user){
                  sendJsonResponse(res, 404, {"message" : "User not found!"});
                  return;
              } else if(err){
                  sendJsonResponse(res, 404, err);
                  return;
              }
              callback(req, res, user);

          })
    }  else {
        sendJsonResponse(res, 404, { "message" : "Email not found!"});
        return;
    }
}




var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};

module.exports.uploadPhoto= function (req, res) {
    console.log('uploaded ' + req.files.file.name);

    fs.writeFile(path.join(__dirname, './uploads/') + req.files.file.name, req.files.file.data, (err, data) => {
        if (err) sendJsonResponse(res, 400, err);
      
        else {
           
            getAuthor(req, res, function (req, res, user) {
            if(req.params && req.params.cityid){
                cityM
                    .findById(req.params.cityid)
                    .select('pictures')
                    .exec(function(err, city){
                        if(!city){
                            sendJsonResponse(res, 404, {"message": "City not found!"});
                            return;
                        } 
                        if(err){
                            sendJsonResponse(res, 404, err);
                            return;
                        }/*
                        fs.rename('/app_api/controllers/uploads/' + req.files.file.name,'/app_api/controllers/uploads/'+ city.name + '-' + city.pictures.length, function (err) {
                            if (err) throw err;
                            console.log('renamed complete');
                          });*/
                        city.pictures.push({
                        _id: new mongoose.Types.ObjectId,
                        name: req.files.file.name,
                        author: user.name
                    });
                    city.save(function (err, city) {
                        var thisPicture;
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                            thisPicture = city.pictures[city.pictures.length - 1];
                            sendJsonResponse(res, 200, {'message': 'Uploaded!'});
                        }
                    });
                    })
                }
                else {
                    sendJsonResponse(res, 404, {"message": "Cityid not found"});
                }

        }
    );

            

}  
    });

};
module.exports.uploadPhotoList=function (req,res) {

};
module.exports.photosList=function (req,res) {

};
module.exports.getPhoto=function (req,res) {

};
module.exports.photoDelete = function (req,res) {
    console.log('uploaded ' + req.params.pictureid);

    fs.unlink(path.join(__dirname, './uploads/') + req.params.pictureid, (err, data) => {
        if (err) return sendJsonResponse(res, 400, err);
        sendJsonResponse(res, 200, {"message": "Uploaded!"});
    });
};