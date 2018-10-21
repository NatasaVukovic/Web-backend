var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

var sendJSONresponse = function (res, status, content) {
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
       var decodedUser = jwt.decode(req.query.token);
     
        console.log(decodedUser);
        if(!decoded.admin){
            sendJSONresponse(res, 403, {'message' : 'Only admin can do this!'});
            return;
        }
        next();
    });
};

module.exports.getUsers=function (req,res) {
    User
        .find({})
        .select('name email admin')
        .exec(function (err, user) {
            if(err){
                sendJSONresponse(res, 400, err);
            }
            sendJSONresponse(res, 200, user);

        })
};

module.exports.getOneUser=function (req,res) {
    if(req.params && req.params.userid) {
        User
            .findById(req.params.userid)
            .select('name email')
            .exec(function (err, user) {
                if (err) {
                    sendJSONresponse(res, 400, err);
                }
                sendJSONresponse(res, 200, user);

            })
    }
};

module.exports.deleteUser=function (req,res) {
    if(req.params && req.params.userid) {
        User
            .findById(req.params.userid)
            .exec(function (err, user) {
                if(err){
                    sendJSONresponse(res, 400, err);
                }
                if(!user){
                    sendJSONresponse(res, 400, {'message': 'User not found!'});
                }
                user.remove();
                sendJSONresponse(res, 200, {'message' : 'User deleted!'});

            })
    }
}

module.exports.updateUser=function (req,res) {
    console.log(req.params.userid);
    if(req.params && req.params.userid) {
        User
            .findById(req.params.userid)
            .exec(function (err, user) {
                if(err){
                    sendJSONresponse(res, 400, err);
                }
                if(!user){
                    sendJSONresponse(res, 400, {'message': 'User not found!'});
                }
                user.admin=req.body.admin;
                user.save(function (err, user) {
                    if(err){
                        console.log(err);
                        sendJsonResponse(res, 400, err);
                    } else if(!user){
                       sendJsonResponse(res, 400, {"message" : "User not found!"});     
                    } 
                    sendJSONresponse(res, 200, {'message': 'Changed!'});

                });
             

            })
    }

};