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
            return res.status(401).json({
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

var doAddReview = function (req, res, city, author) {
    if(!city){
        sendJsonResponse(res, 404, {'message': 'cityid not found'});
    } else {
        city.reviews.push({
            _id: new mongoose.Types.ObjectId,
            author: author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        city.save(function (err, city) {
            var thisReview;
            if (err) {
                sendJsonResponse(res, 400, err);
            } else {
                updateAverageRating(city._id);
                thisReview = city.reviews[city.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
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


module.exports.reviewsCreate=function(req,res){
    getAuthor(req, res, function (req, res, user) {
        var cityid = req.params.cityid;
        if (cityid) {
            cityM
                .findById(cityid)
                .select('reviews')
                .exec(function (err, city) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else {
                        doAddReview(req, res, city, user.name);
                    }
                });
        } else {
            sendJsonResponse(res, 404, {'message': 'Not found, cityid required'});
        }
    });
};

module.exports.reviewsReadOne=function(req,res){
        if (req.params && req.params.cityid && req.params.reviewid) {
            cityM
                .findById(req.params.cityid)
                .select('name reviews')
                .exec(function (err, city) {
                    var response, review;
                    if (!city) {
                        sendJsonResponse(res, 404, {'message': 'Cityid not found'});
                        return;
                    } else if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    if (city.reviews && city.reviews.length > 0) {
                        review = city.reviews.id(req.params.reviewid);
                        if (!review) {
                            sendJsonResponse(res, 404, {'message': 'Reviewid not found!'});
                        } else {
                            response = {
                                city: {
                                    name: city.name,
                                    id: req.params.cityid,
                                },
                                review: review
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else {
                        sendJsonResponse(res, 404, {'message': 'No reviews found!'});
                    }
                });
        } else {
            sendJsonResponse(res, 404, {'message': 'Not found, cityid and reviewid are both required!'});
        }
};

module.exports.reviewsUpdateOne=function(req,res){
    getAuthor(req, res, function (req, res, user) {
        if (req.params && req.params.cityid && req.params.reviewid) {
            cityM
                .findById(req.params.cityid)
                .select('reviews')
                .exec(function (err, city) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                    } else if (!city) {
                        sendJsonResponse(res, 404, {"message": "Cityid not found!"});
                    } else {
                        if (city.reviews && city.reviews.length > 0) {

                            var thisReview = city.reviews.id(req.params.reviewid);
                            if(!(user._id == thisReview._id)){
                                sendJsonResponse(res, 500, {"message" : "You are not authorised to update this review"});
                                return;
                            } 
                            if (!thisReview) {
                                sendJsonResponse(res, 404, {'message': 'Reviewid not found!'});
                                return;
                            }
                            thisReview.rating = req.body.rating;
                            thisReview.author = req.body.author;
                            thisReview.reviewText = req.body.reviewText;
                            city.save(function (err, city) {
                                if (err) {
                                    sendJsonResponse(res, 404, err);
                                } else {
                                    updateAverageRating(city._id);
                                    sendJsonResponse(res, 200, thisReview);
                                }

                            });
                        } else {
                            sendJsonResponse(res, 404, {'message': 'No review to update!'});
                        }
                    }
                })
        } else {
            sendJsonResponse(res, 404, {'message': 'Parameters not found!'});
        }
    });
};

module.exports.reviewsDeleteOne=function(req,res){
    getAuthor(req, res, function (req, res, user) {
        if (req.params && req.params.cityid && req.params.reviewid) {
            cityM
                .findById(req.params.cityid)
                .select('reviews')
                .exec(function (err, city) {
                    if (!city) {
                        sendJsonResponse(res, 404, {'message': 'cityid not found!'});
                        return;
                    }
                    if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    if (city.reviews && city.reviews.length > 0) {
                        thisReview=city.reviews.id(req.params.reviewid);
                        if(!(user._id == thisReview._id)){
                            sendJsonResponse(res, 500, {"message" : "You are not authorised to delete this review"});
                            return;
                        }
                        if (!thisReview) {
                            sendJsonResponse(res, 404, {'message': 'reviewid not found!'});
                            return;
                        }else
                        {
                            thisReview.remove();
                            city.save(function (err) {
                                if (err) {
                                    sendJsonResponse(res, 404, err);
                                } else {
                                    updateAverageRating(city._id);
                                    sendJsonResponse(res, 200, null);
                                }

                            })
                        }

                    } else {
                        sendJsonResponse(res, 404, {'message': 'No reviews'});
                    }

                })

        } else {
            sendJsonResponse(res, 404, {'message': 'No parametres'});
        }
    });
};