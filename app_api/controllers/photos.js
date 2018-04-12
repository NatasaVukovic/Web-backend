var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var express=require('express');
var multer  = require('multer');
let path = require('path');
let fs = require('fs');
var jwt = require('jsonwebtoken');
var user=mongoose.model('User');
var async = require('async');

module.exports.use = function(req, res,next){
    jwt.verify(req.query.token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).json({
                title: 'Not Authenticated',
                error: err
            });
        }
        next();
    });
}


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

            getAuthor(req, res, function (req, res, user) {
            if(req.params && req.params.cityid){
                cityM
                    .findById(req.params.cityid)
                    .select('pictures name')
                    .exec(function(err, city){
                        if(!city){
                            sendJsonResponse(res, 404, {"message": "City not found!"});
                            return;
                        } 
                        if(err){
                            sendJsonResponse(res, 404, err);
                            console.log("Error in find city");
                            return;
                        }/*
                        fs.rename('/app_api/controllers/uploads/' + req.files.file.name,'/app_api/controllers/uploads/'+ city.name + '-' + city.pictures.length, function (err) {
                            if (err) throw err;
                            console.log('renamed complete');
                          });*/
                          thisCity=req.params.cityid;
                        
                          fs.writeFile(path.join(__dirname, './../../public/uploads/') + req.files.file.name, req.files.file.data, (err, data) => {
                            if (err) {
                                sendJsonResponse(res, 400, err);
                                console.log('Error in writeFile');
                            }
                        city.pictures.push({
                        _id: new mongoose.Types.ObjectId,
                        name: req.files.file.name,
                        author: user.name,
                        path: 'http://localhost:3000\\public\\uploads\\' + req.files.file.name
                        //description: req.body.description
                    });
                    city.save(function (err, city) {
                        var thisPicture;
                        if (err) {
                            sendJsonResponse(res, 404, err);
                            console.log("Error after save")
                        } else {
                            thisPicture = city.pictures[city.pictures.length - 1];
                            sendJsonResponse(res, 200, {'message': 'Uploaded!'});
                        }
                    });
                    })
                });
                }
                else {
                    sendJsonResponse(res, 404, {"message": "Cityid not found"});

                }

        }
    );

            



};

module.exports.photosList=function (req,res){
    if (req.params && req.params.cityid) {
    cityM
        .findById(req.params.cityid)
        .select('pictures name')
        .exec(function (err, city) {
            var response, picture;
            if (!city) {
                sendJsonResponse(res, 404, {'message': 'Cityid not found'});
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            if (city.pictures && city.pictures.length > 0) {
                let arrayOfPictures=[];
                let arrayOfId=[];
                for(let i=0; i<city.pictures.length;i++){
                    picture=city.pictures[i];
                    pictureId=picture._id;
                    pictureName=picture.name;
                    arrayOfPictures[i] = 'public/uploads/' + pictureName;
                    arrayOfId[i]=pictureId;
                }

                console.log(arrayOfPictures);


async.eachSeries(
    // Pass items to iterate over
    arrayOfPictures,
    // Pass iterator function that is called for each item
    function(filename, cb) {
      fs.readFile(filename, function(err, content) {
        if (!err) {
          res.write(content);
        }
        // Calling cb makes it go to the next item.
        cb(err);
      });
    },
    // Final callback after each item has been iterated over.
    function(err) {
      res.end()
    }
  );


            } else {
                sendJsonResponse(res, 404, {'message': 'No picture found!'});
            }
        });
} else {
    sendJsonResponse(res, 404, {'message': 'Not found, cityid and pictureid are both required!'});
}
};

module.exports.getPhoto=function(req,res){
    if (req.params && req.params.cityid && req.params.photoid) {
        cityM
            .findById(req.params.cityid)
            .select('pictures name')
            .exec(function (err, city) {
                var response, picture;
                if (!city) {
                    sendJsonResponse(res, 404, {'message': 'Cityid not found'});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                if (city.pictures && city.pictures.length > 0) {
                    picture = city.pictures.id(req.params.photoid);
                    if (!picture) {
                        sendJsonResponse(res, 404, {'message': 'Pictureid not found!'});
                    } else {
                        thisPictureName=picture.name;
                        fs.readFile(path.join(__dirname, './../../public/uploads/') + thisPictureName, (err, data) => {
                            if (err) return sendJsonResponse(res, 400, err);
                            else {
                        response = {
                            city: {
                                name: city.name,
                                id: req.params.cityid,
                            },
                            picture: picture 
                        };
                        sendJsonResponse(res, 200, response);
                    }})
                }} else {
                    sendJsonResponse(res, 404, {'message': 'No picture found!'});
                }
            });
    } else {
        sendJsonResponse(res, 404, {'message': 'Not found, cityid and pictureid are both required!'});
    }
};

module.exports.photoDelete = function (req,res) {
    getAuthor(req, res, function (req, res, user) {
    if (req.params && req.params.cityid && req.params.photoid) {
        cityM
            .findById(req.params.cityid)
            .select('pictures')
            .exec(function (err, city) {
                if (!city) {
                    sendJsonResponse(res, 404, {'message': 'Cityid not found!'});
                    return;
                }
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                if (city.pictures && city.pictures.length > 0) {
                    thisPicture=city.pictures.id(req.params.photoid);
                    if (!thisPicture) {
                        sendJsonResponse(res, 404, {'message': 'Pictureid not found!'});
                    } else {
                        if(!(user.name== thisPicture.author) && !user.admin){
                            sendJsonResponse(res, 500, {"message" : "You are not authorised to delete this picture"});
                            return;
                        }
                        thisPictureName=thisPicture.name;
                        fs.unlink(path.join(__dirname, './../../public/uploads/') + thisPictureName, (err, data) => {
                            if (err) {
                                console.log("Greska u unlink");
                                return sendJsonResponse(res, 400, err);}
                            else {
                                thisPicture.remove();
                        city.save(function (err) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                            } else {
                                sendJsonResponse(res, 200, {"message" : "Picture deleted"});
                            }

                        })
                            }
                            
                        });
                        
                    }

                } else {
                    sendJsonResponse(res, 404, {'message': 'No pictures'});
                }

            })

    } else {
        sendJsonResponse(res, 404, {'message': 'No parametres'});
    }
    });

};


    
