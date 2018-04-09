var mongoose=require('mongoose');
var cityM=mongoose.model('City');
var user=mongoose.model('User');
var jwt = require('jsonwebtoken');

var sendJsonResponse=function(res,status,content){
    res.status(status);
    res.json(content);
};

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

var doAddPlace = function (req, res, city, author) {

}

var updateAverageRating = function (cityid) {
    cityM
        .findById(cityid)
        .select('rating reviews')
        .exec(function (err, city) {
            if(!err) {
                doSetAverageRating(city);
            } else {
                console.log(err);
            }
        });
}

var doSetAverageRating=function (city) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if(city.reviews && city.reviews.length>0){
        reviewCount = city.reviews.length;
        ratingTotal = 0;
        for(i=0; i<reviewCount; i++){
            ratingTotal = ratingTotal + city.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal/reviewCount,10);
        city.rating=ratingAverage;
        city.save(function (err) {
            if(err){
                console.log(err);
            } else {
                console.log('Average rating update to ',ratingAverage );
            }

        })
    }
};


module.exports.placesCreate=function(req,res){
    /*getAuthor(req, res, function (req, res, user) {*/
        var cityid = req.params.cityid;
        if (cityid) {
            cityM
                .findById(cityid)
                .select('places')
                .exec(function (err, city) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        if(!city){
                            sendJsonResponse(res, 404, {'message': 'cityid not found'});
                        } else {
                            city.places.push({
                                _id: new mongoose.Types.ObjectId,
                                place:req.body.place,
                                author: user.name,
                                lat:req.body.lat,
                                lng:req.body.lng,
                                description: req.body.description
                            });
                            city.save(function (err, city) {
                                var thisPlace;
                                if (err) {
                                    sendJsonResponse(res, 400, err);
                                } else {
                                    thisPlace = city.places[city.places.length - 1];
                                    console.log(thisPlace);
                                    sendJsonResponse(res, 201, thisPlace);

                                }
                            });
                        }
                    }
                });
        } else {
            sendJsonResponse(res, 404, {'message': 'Not found, cityid required'});
        }
    //});
};

module.exports.placesAll=function(req,res){
    if(req.params && req.params.cityid){
        cityM
            .findById(req.params.cityid)
            .select('places')
            .exec(function (err, city) {
                if(!city){
                    sendJsonResponse(res, 404, {'message': 'Cityid not found'});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                if (city.places && city.places.length > 0) {

                    sendJsonResponse(res, 200, city.places);
                }
            });
    } else {
        sendJsonResponse(res, 404, {'message': 'Not found, cityid is required!'});
    }
};

module.exports.place=function(req,res){
    if (req.params && req.params.cityid && req.params.placeid) {
        cityM
            .findById(req.params.cityid)
            .select('name places')
            .exec(function (err, city) {
                var response, place;
                if (!city) {
                    sendJsonResponse(res, 404, {'message': 'Cityid not found'});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                if (city.places && city.places.length > 0) {
                    place = city.places.id(req.params.placeid);
                    if (!place) {
                        sendJsonResponse(res, 404, {'message': 'Placeid not found!'});
                    } else {
                        response = {
                            city: {
                                name: city.name,
                                id: req.params.cityid,
                            },
                            places: place
                        };
                        sendJsonResponse(res, 200, response);
                    }
                } else {
                    sendJsonResponse(res, 404, {'message': 'No places found!'});
                }
            });
    } else {
        sendJsonResponse(res, 404, {'message': 'Not found, cityid and placeid are both required!'});
    }
};

module.exports.placesUpdateOne=function(req,res){
    getAuthor(req, res, function (req, res, user) {
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

                            console.log(user.name);
                            var thisPlace = city.places.id(req.params.placeid);
                            console.log(thisPlace.author);
                            if (!thisPlace) {
                                sendJsonResponse(res, 404, {'message': 'Placeid not found!'});
                                return;
                            }
                            if(!(user.name == thisPlace.author) && !user.admin){
                                sendJsonResponse(res, 500, {"message" : "You are not authorised to update this place"});
                                return;
                            }
                            //thisPlace.place=req.body.place,
                            thisPlace.lng=req.body.lng,
                            thisPlace.lat=req.body.lat,
                            thisPlace.description=req.body.description
                            city.save(function (err, city) {
                                if (err) {
                                    sendJsonResponse(res, 404, err);
                                } else {
                                    sendJsonResponse(res, 200, thisPlace);
                                }

                            });
                        } else {
                            sendJsonResponse(res, 404, {'message': 'No place to update!'});
                        }
                    }
                })
        } else {
            sendJsonResponse(res, 404, {'message': 'Parameters not found!'});
        }
    });
};

module.exports.placesDeleteOne=function(req,res){
    getAuthor(req, res, function (req, res, user) {
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
                        thisPlace=city.places.id(req.params.placeid);
                        if(!(user.name== thisPlace.author) && !user.admin){
                            sendJsonResponse(res, 500, {"message" : "You are not authorised to delete this place."});
                            return;
                        }
                        if (!thisPlace) {
                            sendJsonResponse(res, 404, {'message': 'placeid not found!'});
                            return;
                        }else
                        {
                            thisPlace.remove();
                            city.save(function (err) {
                                if (err) {
                                    sendJsonResponse(res, 404, err);
                                } else {
                                    sendJsonResponse(res, 200, {'message' : 'Deleted!'});
                                }

                            })
                        }

                    } else {
                        sendJsonResponse(res, 404, {'message': 'No places'});
                    }

                })

        } else {
            sendJsonResponse(res, 404, {'message': 'No parametres'});
        }
    });
};