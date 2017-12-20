var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var express=require('express');
//var router=express.Router();
var multer  = require('multer');
//var upload = multer({ dest: 'uploads/' });

var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};
/*
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})*/


var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        console.log('dir');
        callback(null, './uploads/')
    },
    filename: function(req, file, callback) {
        console.log(file);
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
var upload = function(req,res,callback){
    console.log('upload');
    multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(res.end('Only images are allowed'), null)
        }
        callback(null, true)
    }
}).single('photo')};

module.exports.uploadPhoto=function (req, res) {
    console.log(req.files.photo);
    upload(req,res ,function(err) {
        if (err) {
            sendJsonResponse(res, 400, {'message': 'Error'});
        }
            console.log(req.files);
            sendJsonResponse(res, 200, {'message': 'Uploaded!'});

    })
}
/*

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
                }
                city.pictures.push({
                _id: new mongoose.Types.ObjectId,
                path: req.file.filename,
                //author: req.body.author
                description: req.body.description
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
})};*/


var uploadPhotos = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(res.end('Only images are allowed'), null)
        }
        callback(null, true)
    }
}).array('photoList', 12);

module.exports.uploadPhotoList=function(req,res){
    uploadPhotos(req, res, function (err) {
        if(err){
            sendJsonResponse(res, 400, {'message' : 'Error while uploading photo'});
        }
        sendJsonResponse(res, 200, {'message': 'Photos uploaded'});
    })
};




module.exports.photosList=function (req, res) {
    if(req.params && req.params.cityid){
    cityM
        .findOne(req.body.cityid)
        .select("pictures")
        .exec(function(err, city){
            if(!city){
                sendJsonResponse(res, 500, {"message" : "City not found!"});
                return;
            } else if(err){
                sendJsonResponse(res, 400, err);
                return;
            }
            sendJsonResponse(res, 200, city.pictures);
        })
    } else {
        sendJsonResponse(res, 400, {"message" : "Parameter is required!"});
    }
};

module.exports.photoDelete=function (req, res) {
    if (req.params && req.params.cityid && req.params.pictureid) {
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
                    if (!city.pictures.id(req.params.pictureid)) {
                        sendJsonResponse(res, 404, {'message': 'Pictureid not found!'});
                    } else {
                        city.pictures.id(req.params.pictureid).remove();
                        city.save(function (err) {
                            if (err) {
                                sendJsonResponse(res, 404, err);
                            } else {
                                sendJsonResponse(res, 200, {"message" : "Picture deleted"});
                            }

                        })
                    }

                } else {
                    sendJsonResponse(res, 404, {'message': 'No pictures'});
                }

            })

    } else {
        sendJsonResponse(res, 404, {'message': 'No parametres'});
    }


};

module.exports.getPhoto=function(req,res){
        if (req.params && req.params.cityid && req.params.pictureid) {
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
                        picture = city.pictures.id(req.params.pictureid);
                        if (!picture) {
                            sendJsonResponse(res, 404, {'message': 'Pictureid not found!'});
                        } else {
                            response = {
                                city: {
                                    name: city.name,
                                    id: req.params.cityid,
                                },
                                picture: picture 
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else {
                        sendJsonResponse(res, 404, {'message': 'No picture found!'});
                    }
                });
        } else {
            sendJsonResponse(res, 404, {'message': 'Not found, cityid and pictureid are both required!'});
        }
};