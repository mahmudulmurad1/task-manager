const mongoose = require('mongoose')
const User = require('./user')
//const Subscription= require('./subscription')

const taskSchema = new mongoose.Schema({
    actionName: {
        type: String,
    },
    userLimit: {
       type:Number,      
    },
    itemLimit:{
        type:Number,       
    },
    discountPercentage:{
        type:Number,       
    },
    shippingPaid:{
        type:Boolean,    
    },
    minimumShippingPaidValue:{
        type:Number,     
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