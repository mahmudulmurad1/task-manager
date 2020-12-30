const express = require('express')
const Task = require('../models/task')
const Subscription = require('../models/subscription')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    let taskObj={}
    try {
        taskObj.owner=req.user._id
        if(req.body.actionName === 'followBack'){
            let userLimit=req.body.userLimit
            if(!userLimit){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.userLimit=userLimit   
        }else if(req.body.actionName === 'followUsers'){
            let userLimit=req.body.userLimit
            if(!userLimit){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.userLimit=userLimit  
        } else if(req.body.actionName === 'shareUsersProduct'){
            let itemLimit=req.body.itemLimit
            if(!itemLimit){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.itemLimit=itemLimit      
        } else if(req.body.actionName === 'shareBack'){
            let userLimit=req.query.userLimit
            let itemLimit=req.body.itemLimit
            if(!itemLimit || !userLimit){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.itemLimit=itemLimit  
            taskObj.userLimit=userLimit            
        }else if(req.body.actionName === 'shareMyCloset'){
            let itemLimit=req.body.itemLimit
            if(!itemLimit){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.itemLimit=itemLimit       
        }else if(req.body.actionName === 'offerToLikers'){
            let itemLimit=req.body.itemLimit
            let discountPercentage=req.body.discountPercentage
            let minimumShippingPaidValue=req.body.minimumShippingPaidValue
            let shippingPaid=req.body.shippingPaid

            if(!itemLimit || !discountPercentage){
                return res.status(500).send('please insert required values')
            }

            taskObj.actionName=req.body.actionName
            taskObj.discountPercentage=discountPercentage
            taskObj.itemLimit=itemLimit
            taskObj.shippingPaid=shippingPaid
            taskObj.minimumShippingPaidValue=minimumShippingPaidValue
        }else if(req.body.actionName === 'clearOutOffers'){
            let itemLimit=req.body.itemLimit
            let discountPercentage=req.body.discountPercentage
            let minimumShippingPaidValue=req.body.minimumShippingPaidValue
            let shippingPaid=req.body.shippingPaid

            if(!itemLimit || !discountPercentage){
                return res.status(500).send('please insert required values')
            }
            taskObj.actionName=req.body.actionName
            taskObj.discountPercentage=discountPercentage
            taskObj.itemLimit=itemLimit
            taskObj.shippingPaid=shippingPaid
            taskObj.minimumShippingPaidValue=minimumShippingPaidValue
        }
        else{
            res.status(400).end('Not Successful')
        } 
    } catch (error) {
        res.status(400).end('please insert all the values')
    } 

    let task = new Task(taskObj)
    await task.save()
    await req.user.Tasks.push(task._id)
    await req.user.save()
    res.status(201).send(task)
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['actionName','userLimit','itemLimit','discountPercentage','shippingPaid','minimumShippingPaidValue',]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

            if(task.actionName === 'followBack' && req.user.followBackUserLimit >= task.userLimit){            
                req.user.followBackUserLimit -= task.userLimit             
            }else if(task.actionName === 'followUsers' && req.user.followUsersUserLimit >= task.userLimit){              
                req.user.followUsersUserLimit -= task.userLimit
            }else if(task.actionName ==='shareUsersProduct' && req.user.shareUsersProductItemLimit >= task.itemLimit){
                req.user.shareUsersProductItemLimit -= task.itemLimit
            }else if(task.actionName ==='shareBack' && req.user.shareBackUserLimit>=task.UserLimit      
                && req.user.shareBackItemLimit>=itemLimit){
                    req.user.shareBackUserLimit -= task.userLimit 
                    req.user.shareBackItemLimit -= task.itemLimit
            }else if(task.actionName ==='shareMyCloset' && req.user.shareMyClosetItemLimit >= task.itemLimit){
                req.user.shareMyClosetItemLimit -= task.itemLimit
            }else if(task.actionName ==='offerToLikers' && !req.user.offerToLikersShippingPaid && req.user.offerToLikersItemLimit >= task.itemLimit){
                req.user.offerToLikersItemLimit -= task.itemLimit               
            }else if(task.actionName ==='offerToLikers' && req.user.offerToLikersShippingPaid && req.user.offerToLikersItemLimit >= task.itemLimit){
                req.user.offerToLikersItemLimit -= task.itemLimit
            }else if(task.actionName ==='clearOutOffers' && !req.user.clearOutOffersShippingPaid && req.user.clearOutOffersItemLimit >= task.itemLimit){
                req.user.clearOutOffersItemLimit -= task.itemLimit
            }else if(task.actionName ==='clearOutOffers' && req.user.clearOutOffersShippingPaid && req.user.clearOutOffersItemLimit >= task.itemLimit){
                req.user.clearOutOffersItemLimit -= task.itemLimit
            }else {
                return  res.status(501).send('You may cross your limit')
            }
            await req.user.save()
            return res.status(201).send(`you just created ${task.actionName}`)
        } catch (e) {
            res.status(400).send('Something went wrong')
        }
        res.send(task)
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router