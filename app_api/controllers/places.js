var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var user=mongoose.model('User');
var sortBy=require('sort-by');

var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};

module.exports.use = function(req, res,next){
    jwt.verify(req.query.token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                title: 'Not Authenticated',
                error: err
            });
        }
        next();
    });
}

module.exports.placesCreate= function(req, res){
    var decoded = jwt.decode(req.query.token);
    if(req.params && req.params.cityid){
    cityM
        .findById(req.params.cityid)
        .select('places')
        .exec(function(err, city){
            if(!city){
                sendJsonResponse(res, 404, {"message": "City not found!"});
                return;
            } 
            if(err){
                console.log("ovo1");
                sendJsonResponse(res, 404, err);
                return;
            }
            city.places.push({
            _id: new mongoose.Types.ObjectId,
            place: req.body.place,
            lat: req.body.lat,
            lng: req.body.lng,
            author: decoded.name
        });
        city.save(function (err, city) {
            var thisPlace;
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                thisPlace = city.places[city.places.length - 1];
                sendJsonResponse(res, 201, thisPlace);
            }
        });
        })
    }
    else {
        sendJsonResponse(res, 404, {"message": "Cityid not found"});
    }
}

module.exports.placesUpdateOne=function(req,res){
    var decoded = jwt.decode(req.query.token);
        if (req.params && req.params.cityid && req.params.placeid) {
            cityM
                .findById(req.params.cityid)
                .select('places')
                .exec(function (err, city) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else if (!city) {
                        sendJsonResponse(res, 404, {"message": "Cityid not found!"});
                    } else {
                        if (city.places && city.places.length > 0) {
                            var thisPlace = city.places.id(req.params.placeid);
                            if(!(decoded.name == thisPlace.author)){
                                sendJsonResponse(res, 400, {"message" : "You are not authorised to update this place"});
                            } else {
                            if (!thisPlace) {
                                sendJsonResponse(res, 404, {'message': 'Placeid not found!'});
                                return;
                            }
                            
                            thisPlace.place=req.body.place,
                            thisPlace.lng=req.body.lng,
                            thisPlace.lat=req.body.lat

                            city.save(function (err, city) {
                                if (err) {
                                    sendJsonResponse(res, 404, err);
                                } else {
                                    sendJsonResponse(res, 200, thisPlace);
                                }

                            });

                            
                    }
                        } else {
                            sendJsonResponse(res, 404, {'message': 'No place to update!'});
                        }

                    }
                })
        } else {
            sendJsonResponse(res, 404, {'message': 'Parameters not found!'});
        }
};

module.exports.placesDeleteOne=function(req,res){
    var decoded = jwt.decode(req.query.token);
        if (req.params && req.params.cityid && req.params.placeid) {
            cityM
                .findById(req.params.cityid)
                .select('places')
                .exec(function (err, city) {
                    if (!city) {
                        sendJsonResponse(res, 404, {'message': 'cityid not found!'});
                        return;
                    }
                    if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    if (city.places && city.places.length > 0) {
                        var thisPlace=city.places.id(req.params.placeid)
                        if(!(decoded.name == thisPlace.name)){
                            sendJsonResponse(res, 400, {"message" : "You are not authorised to delete this place"});
                        } else {
                            if (!thisPlace) {
                                sendJsonResponse(res, 404, {'message': 'placeid not found!'});
                            } else {
                                city.places.id(req.params.placeid).remove();
                                city.save(function (err) {
                                     if (err) {
                                        sendJsonResponse(res, 404, err);
                                    } else {
                                        sendJsonResponse(res, 200, null);
                                    }
                                })
                            }
                        }
                    } else {
                        sendJsonResponse(res, 404, {'message': 'No places'});
                    }
                })
        } else {
            sendJsonResponse(res, 404, {'message': 'No parametres'});
        }
};

module.exports.likePlace = function(req, res){
    if(req.params && req.params.cityid && req.params.placeid){
        cityM
            .findById(req.params.cityid)
            .select('places')
            .exec(function(err, city){
                if(err){
                    sendJsonResponse(res, 404, err);
                } else if(!city){
                    sendJsonResponse(res, 404, {"message" : "City not found!"});
                }
                thisPlace=city.places.id(req.params.placeid);
    
                thisPlace.likes++;

                    city.save(function (err, city) {
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                             sendJsonResponse(res, 200, thisPlace);
                        }        
                    });
            });
    } else {
        sendJsonResponse(res, 404, {"message" : "No parametres!"});
    }
}
/*
module.exports.placesListByLikes = function(req, res){
    if(req.params && req.params.cityid){
        cityM
            .findById(req.params.cityid)
            .select('places')
            .exec(function(err, city){
                if(err){
                    sendJsonResponse(res, 404, err);
                } else if(!city){
                    sendJsonResponse(res, 404, {"message" : "City not found!"});
                }
                
               thisPlace=city.places.id(req.body.placeid);

            })

            

    } else {
        sendJsonResponse(res, 404, {"message" : "Cityid not found!"});
    }
}*/