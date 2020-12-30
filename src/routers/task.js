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

router.patch('/tasks/:actionName', auth, async (req, res) => {

    const task = new Task({
       actionName:req.params.actionName,
       userLimit:req.query,
       itemLimit:req.query,
       discountPercentage:req.query,
       minimumShippingPaidValue:req.query,
       owner: req.user._id
    })
    const packID= await Subscription.findOne(req.user.SubscriptionPackage._id)
    console.log(packID.followBackUserLimit)
    const pack= req.user.SubscriptionPackage

    try {
        if(task.actionName === 'followBack' && pack.followBackUserLimit >= task.userLimit){
           pack.followBackUserLimit -= task.userLimit
        }
        else if(task.actionName === 'followUsers' && pack.followUsersUserLimit >= task.userLimit){
            pack.followUsersUserLimit -= task.userLimit
        }
        else if(task.actionName ==='shareUsersProduct' && pack.shareUsersProductItemLimit >= task.itemLimit){
            pack.shareUsersProductItemLimit -= task.itemLimit
        }
        else if(task.actionName ==='shareBack' && pack.shareBackUserLimit>=task.UserLimit      
            && shareBackItemLimit>=itemLimit){
            pack.shareBackUserLimit -= task.userLimit 
            pack.shareBackItemLimit -= task.itemLimit
        }
        else if(task.actionName ==='shareMyCloset' && pack.shareMyClosetItemLimit>=task.itemLimit){
            pack.shareMyClosetItemLimit -= task.itemLimit
        }
        else if(task.actionName ==='offerToLikers' && !pack.offerToLikersShippingPaid && pack.offerToLikersItemLimit >= task.itemLimit){
            pack.offerToLikersItemLimit -= task.itemLimit
            const cutoff = pack.offerToLikersDiscountPercentage
            
        }
        else if(task.actionName ==='offerToLikers' && pack.offerToLikersShippingPaid && pack.offerToLikersItemLimit >= task.itemLimit){
            pack.offerToLikersItemLimit -= task.itemLimit
            const cutoff = pack.offerToLikersDiscountPercentage
            const paid = pack.offerToLikersMinimumShippingValue
        }
        else if(task.actionName ==='clearOutOffers' && !pack.clearOutOffersShippingPaid && pack.clearOutOffersItemLimit >= task.itemLimit){
            pack.clearOutOffersItemLimit -= task.itemLimit
            const cutoff = pack.clearOutOffersDiscountPercentage
        }
        else if(task.actionName ==='clearOutOffers' && pack.clearOutOffersShippingPaid && pack.clearOutOffersItemLimit >= task.itemLimit){
            pack.clearOutOffersItemLimit -= task.itemLimit
            const cutoff = pack.clearOutOffersDiscountPercentage
            const paid= pack.clearOutOffersMinimumShippingValue
        }
        else {
            return  res.status(501).send('You may cross your limit')
        }
        await pack.save()
        return res.status(201).send(pack)
    } catch (e) {
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