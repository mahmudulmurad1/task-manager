const mongoose = require('mongoose')
const User = require('./user')
//const Subscription= require('./subscription')

const taskSchema = new mongoose.Schema({
    actionName: {
        type: String,
        required: true,
    },
    userLimit: {
       type:Number,
       required:true,
    },
    itemLimit:{
        type:Number,
        required:true,
    },
    discountPercentage:{
        type:Number,
        required:true,
    },
    minimumShippingPaidValue:{
        type:Number,
        required:true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task