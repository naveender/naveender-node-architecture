// src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: { type: String, required: true, unique: true },
    personalInfo:{type:Boolean,default:false},
    email: { type: String },
    emailVerificationToken:{type:String},
    istokenExpired:{type:Boolean,default:false},
    isEmailVerified: { type: Boolean, default: false },
    userCountry: { type: String, default: 'in' },
    isNotifyEmail: { type: Boolean, default: true },
    phone: { type: String },
    isPhoneVerified: { type: Boolean, default: false },
    password: { type: String },
    termsAndCondition: { type: Boolean },
    resetToken: { type: String },
    expireToken: { type: Date },
    bannerSettings: { type: [Object] },
    countryCode: { type: String },
    phoneCountry: { type: String },
    two_FA: [
    {
        isEnabled: {
        type: Boolean,
        default: false,
        },
        two_FA_by: {
        type: String,
        },
    },
    ],
    isPromoUsedDetails : {type:Boolean,default:false},
    status:{type: String}
});

module.exports.UserSchema = mongoose.model("User", UserSchema);

