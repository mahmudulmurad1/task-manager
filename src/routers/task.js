const express = require('express')
const Task = require('../models/task')
const Subscription = require('../models/subscription')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/task/:actionName', auth, async (req, res) => {
    let taskObj={}
    try {
        taskObj.owner=req.user._id
        if(req.params.actionName === 'followBack'){
            let userLimit=parseInt(req.query.userLimit)
            taskObj.actionName=req.params.actionName
            taskObj.userLimit=userLimit   
        }else if(req.params.actionName === 'followUsers'){
            let userLimit=parseInt(req.query.userLimit)
            taskObj.actionName=req.params.actionName
            taskObj.userLimit=userLimit  
        } else if(req.params.actionName === 'shareUsersProduct'){
            let itemLimit=parseInt(req.query.itemLimit)
            taskObj.actionName=req.params.actionName
            taskObj.itemLimit=itemLimit      
        } else if(req.params.actionName === 'shareBack'){
            let userLimit=parseInt(req.query.userLimit)
            let itemLimit=parseInt(req.query.itemLimit)
            taskObj.actionName=req.params.actionName
            taskObj.userLimit=userLimit
            taskObj.itemLimit=itemLimit            
        }else if(req.params.actionName === 'shareMyCloset'){
            let itemLimit=parseInt(req.query.itemLimit)
            taskObj.actionName=req.params.actionName
            taskObj.itemLimit=itemLimit       
        }else if(req.params.actionName === 'offerToLikers'){
            let itemLimit=parseInt(req.query.itemLimit)
            let discountPercentage=parseInt(req.query.discountPercentage)
            let minimumShippingPaidValue=parseInt(req.query.minimumShippingPaidValue)
            let shippingPaid=req.query.shippingPaid

            taskObj.actionName=req.params.actionName
            taskObj.discountPercentage=discountPercentage
            taskObj.itemLimit=itemLimit
            taskObj.shippingPaid=shippingPaid
            taskObj.minimumShippingPaidValue=minimumShippingPaidValue
        }else if(req.params.actionName === 'clearOutOffers'){
            let itemLimit=parseInt(req.query.itemLimit)
            let discountPercentage=parseInt(req.query.discountPercentage)
            let minimumShippingPaidValue=parseInt(req.query.minimumShippingPaidValue)
            let shippingPaid=req.query.shippingPaid

            taskObj.actionName=req.params.actionName
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


    try {
        if(task.actionName === 'followBack' && req.user.followBackUserLimit >= task.userLimit){
            console.log(req.user.followBackUserLimit);
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
            const cutoff = pack.offerToLikersDiscountPercentage
            
        }else if(task.actionName ==='offerToLikers' && req.user.offerToLikersShippingPaid && req.user.offerToLikersItemLimit >= task.itemLimit){
            req.user.offerToLikersItemLimit -= task.itemLimit
            const cutoff = req.user.offerToLikersDiscountPercentage
            const paid = req.user.offerToLikersMinimumShippingValue
        }else if(task.actionName ==='clearOutOffers' && !req.user.clearOutOffersShippingPaid && req.user.clearOutOffersItemLimit >= task.itemLimit){
            req.user.clearOutOffersItemLimit -= task.itemLimit
            const cutoff = req.user.clearOutOffersDiscountPercentage
        }else if(task.actionName ==='clearOutOffers' && req.user.clearOutOffersShippingPaid && req.user.clearOutOffersItemLimit >= task.itemLimit){
            req.user.clearOutOffersItemLimit -= task.itemLimit
            const cutoff = req.user.clearOutOffersDiscountPercentage
            const paid= req.user.clearOutOffersMinimumShippingValue
        }else {
            return  res.status(501).send('You may cross your limit')
        }
        await req.user.save()
        await task.save()
        return res.status(201).send(`you just created ${task.actionName} to ${task.userLimit} 
            and you have remaining  ${req.user.followBackUserLimit}`)
    } catch (e) {
        console.log(e);
        res.status(400).send('Something went wrong')
    }
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
    const allowedUpdates = ['description', 'completed']
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
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
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