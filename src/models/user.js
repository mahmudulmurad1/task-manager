const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const Subscription=require('./subscription')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    poshmarkPassword: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },poshmarkUserName:{
        type: String,
        required: true,
        unique:true,
        trim: true
    },
    SubscriptionPackage:{
        type: mongoose.Schema.Types.ObjectId,  
        default:null,
        ref: "Subscription"
    },   
    Tasks:[{
        type: mongoose.Schema.Types.ObjectId,
        default:null,
        ref: "Task"
    }],
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
        default:0,
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
    isAdmin:{
        type: Boolean,
        default:false,
        required:true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('subscriptions', {
    ref: 'Subscription',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.poshmarkPassword
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, poshmarkPassword) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(poshmarkPassword, user.poshmarkPassword)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('poshmarkPassword')) {
        user.poshmarkPassword = await bcrypt.hash(user.poshmarkPassword, 8)
    }
    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// Delete user subscriptions when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Subscription.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User