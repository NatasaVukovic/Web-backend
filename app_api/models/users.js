var mongoose=require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema=new mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true},
    admin: {type: Boolean, default: "false"},
    hash: String,
    salt: String
    //password: {type : String, required: true}
});


userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'SHA1').toString('hex');
    return this.hash === hash;
};


userSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id : this._id,
        email: this.email,
        name: this.name,
        admin: this.admin,
        exp: parseInt(expiry.getTime() / 1000),
    }, process.env.JWT_SECRET);

}

userSchema.methods.decodedJwt = function(token){
    var decoded = jwt.decode(token);
userSchema.findById(decoded.user._id, function (err, user) {
    if (err) {
        return res.status(500).json({
            title: 'An error occurred',
            error: err
        });
    } else {
        return true;
    }
})
};

mongoose.model('User', userSchema);