var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

/**
 * USER MODEL
 */
var UserSchema = new Schema({
    username: { // username: required, unique and at least 3 char long
        type: String, required: true, unique: true,
        validate: {
            validator: function (v) {
                return v.length >= 3;
            },
            message: props => 'Uporabniško ime mora biti dolgo vsaj 3 znake!!'
        }
    },
    email: { // email: required, unique and must match regex
        type: String, required: true, unique: true,
        validate: {
            validator: function (v) {
                return /^[\w-.]+@([\w-]+\.)+\w+$/.test(v)
            },
            message: props => 'Email ni v veljavnem formatu. Če ste se zatipkali, prosimo poskusite znova vnesti veljaven email'

        }
    },
    password: {
        type: String, required: true, // password: required and must match regex
        validate: {
            validator: function (v) {
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$/.test(v);
            },
            message: props => 'Geslo mora biti dolgo med 8 in 30 znakov in vsebovati vsaj eno veliko črko in vsaj eno številko!!!'
        }
    },
    // not included by registration
    role: {type: String, enum: ['user', 'moderator', 'admin'], default: 'user'}, // user role - default is user
    bio: {type: String, default: '',}, // bio - it should be used inside edit page
    avatar: {
        imageName: { type: String, default: '' }, // Name of the image file (e.g., 'avatar123.jpg')
        imageUrl: { type: String, default: '' }   // URL to access the image (e.g., '/images/avatar123.jpg')
    },
    isBanned: {type: Boolean, default: false}, // isBanned - if account is banned
    createdAt: {type: Date, default: Date.now} // date of creation
});

/**
 * LOGIN AUTHENTICATION
 * @param username
 * @param password
 * @param callback
 */
UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({username: username}) // id user exists
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                var err = new Error("User not found");
                err.status = 401;
                return callback(err);
            }
            //compares provided passwords with the one inside DB
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            });
        });
}

/**
 * FUNCTION THAT CALLS BEFORE CREATE USER
 */
UserSchema.pre('save', function (next) {
    var user = this;

    // hashing password before saving new user
    bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
        if (err) return next(new Error('Napaka strežnika - Težava pri shranjevanju gesla. Prosimo poskusite ponovno čez nekaj trenutkov'));
        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('users', UserSchema);