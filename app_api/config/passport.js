var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var User=mongoose.model('User');
var auth=require('./auth');

/*
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});*/

passport.use(new LocalStrategy({usernameField: 'name', passwordField : 'password',}, function (name, password, done) {
    console.log("Passssport prvo")   
    User.findOne({'name': name}, function (err, user) {
        console.log("Passport pronasao");
            if(err) {
                return done(err);
            }
            if(!user){
                console.log("Incorect username")
                return done(null, false, {message: 'Incorrect username'});
            }
            if(!user.validPassword(password)){
                console.log('Passport: password invalid');
                return done(null, false,{message: 'Incorrect password'});
            }
            console.log('Passport:' + user);
            return done(null, user);
        })
    }
));

passport.use(new FacebookStrategy(auth.facebook, function(accessToken, refreshToken, profile, done) {
    User.findOne({facebookId: profile.id}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            done(null, user);
        } else {
            var newUser = new User();
            newUser.facebook = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value;
            newUser.accessToken=profile.accessToken;
            // newUser.tokens.push({token:accesToken});

            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    done(null, newUser);
                }
            });
        };
    })
}));