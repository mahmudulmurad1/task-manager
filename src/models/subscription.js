const mongoose = require('mongoose')
const User =require('./user')
const subscriptionSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true,
    },
    followBackUserLimit:{
        type:Number,
        default:0,      
    },
    followUsersUserLimit:{
        type:Number,
        default:0,     
    },
    shareUsersProductItemLimit:{
        type:Number,
        default:0,
    },
    shareBackUserLimit:{
        type:Number,
        default:0,
    },
    shareBackItemLimit:{
        type:Number,
        default:0,
    },
    shareMyClosetItemLimit:{
        type:Number,
        default:0,
    },
    offerToLikersDiscountPercentage:{
        type:Number,
        default:0
    },
    offerToLikersItemLimit:{
        type:Number,
        default:0
    },
    offerToLikersShippingPaid:{
        type:Boolean,
        default:false
    },
    offerToLikersMinimumShippingValue:{
        type:Number,
        default:0
    },
    clearOutOffersItemLimit:{
        type:Number,
        default:0
    },
    clearOutOffersDiscountPercentage:{
        type:Number,
        default:0
    },
    clearOutOffersShippingPaid:{
        type:Boolean,
        default:false
    },
    clearOutOffersMinimumShippingValue:{
        type:Number,
        default:0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Subscription = mongoose.model('Subscription', subscriptionSchema)

module.exports = Subscription