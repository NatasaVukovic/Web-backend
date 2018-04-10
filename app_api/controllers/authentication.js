var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.register = function (req, res) {
    console.log("Register..");
    console.log(req.body);
    if(!req.body.username && !req.body.email && !req.body.password){
        sendJSONresponse(res, 500, {"message": "All fields required!"});
        console.log("Required");
        return;
    }
    if(!req.body.username){
        sendJSONresponse(res, 500, {"message": "username is required!"});
        console.log("Username Required");
        return;
    } else if (req.body.username.length < 4 || req.body.username.length > 15) {
        sendJSONresponse(res, 500, {"message": "username must have between 4 and 15 characters!"});
        console.log("Username length");
    } else if (req.body.username.indexOf(" ") !== -1){
        sendJSONresponse(res, 500, {"message" : "username can not contain space!"});
        console.log("Username whitespace");
    }
    if(!req.body.email){
        sendJSONresponse(res, 500, {"message": "Email is required!"});
        console.log("Email Required");
        return;
    }
    if(!req.body.password){
        console.log("Password Required");
        sendJSONresponse(res, 500, {"message": "Password is required!"});
        return;
    } else if (req.body.password.length < 6 || req.body.password.length > 20){
        console.log("Password length");
        sendJSONresponse(res, 500, {"message" : "Password must hawe between 6 and 20 characters."});
    }

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (req.body.email && !re.test(req.body.email)){
        console.log("Email characters");
        sendJSONresponse(res, 500, {"message" : "Wrong email!"});
    }
    
    console.log("Proslo provjere");
    User.findOne({'email': req.body.email}, function (err, user) {
        console.log("Uslo u findone");
        if (err){
            sendJSONresponse(res, 400, err);
            return;
        } else if(user){
            sendJSONresponse(res, 400, {"message": "'That username is already in use. Choose another username.'"});
            return;
        }
    }); 
                  
    var user = new User();
    user.name = req.body.username;
    user.email = req.body.email;
    user.admin =  req.body.admin;
    console.log("User napravljen");
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
    console.log("Uslo u login");
    if(!req.body.username && !req.body.password){
        sendJSONresponse(res, 500, {"message": "All fields required!"});
        return;
    }
    if(!req.body.username){
        sendJSONresponse(res, 500, {"message": "username is required!"});
        return;
    } else if (req.body.username.length < 4 || req.body.username.length > 15) {
        sendJSONresponse(res, 500, {"message": "username must have between 4 and 15 characters!"});
    } else if (req.body.username.indexOf(" ") !== -1){
        sendJSONresponse(res, 500, {"message" : "username can not contain space!"});
    }
    if(!req.body.password){
        sendJSONresponse(res, 500, {"message": "Password is required!"});
        return;
    } else if (req.body.password.length < 6 || req.body.password.length > 20){
        sendJSONresponse(res, 500, {"message" : "Password must hawe between 6 and 20 characters."});
    }
        console.log("Proslo provjere");

        User.findOne({'name': req.body.username}, function (err, user) {
            if (err)
                return res.status(500).json({
                    message: 'Error while find that user.',
                    obj: err
                });
            if (!user)
                return res.status(500).json({
                    message: 'Invalid login.'
                });
                if(user.validPassword(req.body.password)){
                    token = user.generateJwt();
                    res.status(200).send({
                        'token': token,
                        'username': user.name,
                        'admin': user.admin, 
                        'mainAdmin': user.mainAdmin
                    });
                    /*return sendJSONresponse(res, 200, {'token': token});*/
                 
                } else {
                    return  sendJSONresponse(res, 401, {'message' : 'Invalid login!'});
                } 
        });
};

module.exports.logout = function (req, res) {
    req.logOut();
    sendJSONresponse(res, 200, {"message": "Success logout"});
};