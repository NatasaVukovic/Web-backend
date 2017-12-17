var mongoose=require('mongoose');
var sortBy=require('sort-by');
var cityM=mongoose.model('City');
var jwt = require('jsonwebtoken');

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

/*
var theEarth = (function () {
    var earthRadius = 6371; //km, miles is 3959

    var getDistanceFromRads = function (rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function (distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    };
})();

module.exports.citiesListByDistance=function(req,res){
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var point = {
        type: 'Point',
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical : true,
        maxDistance: theEarth.getRadsFromDistance(20),
        num: 10
    };

    if(!lng || !lat) {
        sendJsonResponse(res, 404, { 'message' : 'lng and lat parameters are required!'});
        return;
    }

    cityM.geoNear(point, geoOptions, function (err, results, stats) {
        var cities = [];
        if(err){
            sendJsonResponse(res, 404, err);
        } /*else if(results.equals(null))
        {
            sendJsonResponse(res,200,{'message':'No exist near city'});
        }//
   else {
                results.forEach(function(doc){
                    cities.push({
                        distance: theEarth.getDistanceFromRads(doc.distance),
                        name: doc.obj.name,
                        country: doc.obj.country,
                        rating: doc.obj.rating,
                        id: doc.obj._id
                    });
                });
                sendJsonResponse(res, 200, cities);
            }
        //}
    });

};*/


module.exports.citiesCreate=function(req,res){
    var decoded = jwt.decode(req.query.token);
    console.log(decoded.admin);
    if(decoded.admin){
        cityM.create({
            _id: new mongoose.Types.ObjectId,
            name: req.body.name,
            country: req.body.country,
            information: req.body.information,
            lat: parseFloat(req.body.lat),
            lng: parseFloat(req.body.lng)
        }, function (err, city) {
            if (err) {
                console.log(err);
                sendJsonResponse(res, 404, err);
            } else {
                console.log("Drugi:"+ city);
                
                sendJsonResponse(res, 201, city);
              
            }
        });
    } else {
        sendJsonResponse(res, 500, {"message" : "Only admin can create a city!"})
    }
};

module.exports.citiesReadOne=function(req,res){
    if(req.params && req.params.cityid){
        cityM
            .findById(req.params.cityid)
            .exec(function (err,city) {
                if(!city){
                    sendJsonResponse(res, 404, {'message': 'cityid not found'});
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, city);
            });

    }else{
        sendJsonResponse(res,404,{'message': 'No cityid in request!'});
    }
};

module.exports.citiesUpdateOne=function(req,res){
    var decoded = jwt.decode(req.query.token);
    console.log(decoded.admin);
    if(decoded.admin){
    if(req.params && req.params.cityid){
        cityM
            .findByIdAndUpdate(req.params.cityid)
            .select('-reviews -rating -votes')
            .exec(function (err, city) {
                if(!city){
                    sendJsonResponse(res, 404,{'message': 'cityid not found!'});
                    return;
                } else if(err){
                    console.log('exec dio');
                    console.log(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                city.name=req.body.name;
                city.country=req.body.country;
                city.information=req.body.information;
                city.lat=req.body.lat;
                city.lng=req.body.lng ;
                city.save(function (err, city) {
                    if(err){
                        console.log(err);
                        sendJsonResponse(res, 400, err);
                    } else if(!city){
                       sendJsonResponse(res, 400, {"message" : "City not found!"});     
                    } else {
                        console.log(city);
                        sendJsonResponse(res, 200, city);
                    }

                });
            }) ;
    }
} else {
    sendJsonResponse(res, 500, {"message" : "Only admin can make a change!"});
}

};

module.exports.citiesDeleteOne=function(req,res){
    var decoded = jwt.decode(req.query.token);
    console.log(decoded.admin);
    if(decoded.admin){
    var cityid=req.params.cityid;
    if(cityid){
        cityM
            .findByIdAndRemove(cityid)
            .exec(function (err, city) {
                if(err){
                    console.log(err);
                    sendJsonResponse(res, 404, err);
                } else {
                    console.log('Deleted');
                    sendJsonResponse(res, 200, null);
                }

            });
    } else {
        sendJsonResponse(res, 404, {'message' : 'No cityid'});
    }
} else {
    sendJsonResponse(res, 500, {"message" : "Only admin can delete a city!"});
}

};

module.exports.citiesListByRating =(function (req, res) {
    cityM
        .find({})
        .select('rating name')
        .exec(function (err, city) {
            if(err){
                console.log(err);
                sendJsonResponse(res, 404, err);
            } else {
                //console.log(city);
                city.sort(sortBy('-rating'));
                //console.log(city);
                sendJsonResponse(res, 200, city);
            }
        })
});

module.exports.searchCity = function (req, res) {
    cityM
        .find({})
        .select('name')
        .exec(function (err, city) {
            if(err){
                console.log(err);
                sendJsonResponse(res, 404, err);
            } else {
                if(city.name === req.body.filter){
                    sendJsonResponse(res, 200, city);
                } else {
                    sendJsonResponse(res, 404, {'message': 'City not found'});
                }
            }
        });
};

