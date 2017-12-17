var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.register = function (req, res) {
    if(!req.body.name && !req.body.email && !req.body.password){
        sendJSONresponse(res, 500, {"message": "All fields required!"});
        return;
    } else if(!req.body.name){
        sendJSONresponse(res, 500, {"message": "Username is required!"});
        return;
    } else if(!req.body.email){
        sendJSONresponse(res, 500, {"message": "Email is required!"});
        return;
    } else if(!req.body.password){
        sendJSONresponse(res, 500, {"message": "Password is required!"});
        return;
    }
    
    if (req.body.name.length < 4 || req.body.name.length > 15){
        sendJSONresponse(res, 400, {"message" : "Username must have between 4 and 15 characters!"});
    } else if (req.body.name.indexOf(" ") !== -1){
    sendJSONresponse(res, 400, {"message" : "Username can not contain space!"});
    }

    if (req.body.password.length < 6 || req.body.password.length > 20){
        sendJSONresponse(res, 400, {"message" : "Password must hawe between 6 and 20 characters."});
    }

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (req.body.email && !re.test(req.body.email)){
        sendJSONresponse(res, 500, {"message" : "Wrong email!"});
    }
    
    User.findOne({'email': req.body.email}, function (err, user) {
        if (err){
            sendJSONresponse(res, 400, err);
            return;
        } else if(user){
            sendJSONresponse(res, 400, {"message": "'That username is already in use. Choose another username.'"});
            return;
        }
    }); 
                   
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.admin =  req.body.admin;

    user.setPassword(req.body.password);
    user.save(function (err) {
        var token;
        if(err){
            sendJSONresponse(res, 404, err);
            console.log(err);
        } else {
            token = user.generateJwt();
            sendJSONresponse(res, 200, { "token" : token });
        }
    });
};

module.exports.login = function (req, res) {
    if(!req.body.name && !req.body.password){
        sendJSONresponse(res, 400, {"message" : "All fields required!"});
        return;
    } else if(!req.body.name){
        sendJSONresponse(res, 400, {"message" : "Email is required!"});
        return;
    } else if(!req.body.password){
        sendJSONresponse(res, 400, {"message" : "Password is required!"});
    }

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (req.body.email && !re.test(req.body.email)){
        sendJSONresponse(res, 500, {"message" : "Wrong email!"});
    }

        passport.authenticate('local', function (err, user, info) {
            var token;

            if (err) {
                sendJSONresponse(res, 404, err);
                console.log(err);
                return;
            }
            if (user) {
                token = user.generateJwt();
                sendJSONresponse(res, 200, {"token": token});
            } else {
                sendJSONresponse(res, 401, info);
            }
        })(req, res);

};

module.exports.logout = function (req, res) {
    req.logOut();
    sendJSONresponse(res, 200, {"message": "Success logout"});
};