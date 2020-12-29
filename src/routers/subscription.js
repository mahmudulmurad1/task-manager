const express = require('express')
const { route } = require('../app')
const Subscription = require('../models/subscription')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/subscription', auth, async (req, res) => {
    if(!req.user.isAdmin){
      return  res.status(401).send('only admin can perform this Actions')
    }    
        const createSubscription = new Subscription({
            ...req.body
        })
        try {
            await createSubscription.save()
            res.status(201).send(createSubscription)
        } catch (e) {
            res.status(400).send(e)
        }            
})

router.get('/subscription',auth, async (req, res) => {
    if(!req.user.isAdmin){
       return res.status(401).send('only admin can perform this Actions')
    }   
    Subscription.find().then(ee =>{
      res.status(201).send(ee)
    }).catch(err => {
        res.status(500).send({
        message: err.message || "Some error occurred while retrieving Subscriptions."
         })
    })   
})

router.get('/subscription/:id',auth,async(req, res) => {
    if(!req.user.isAdmin){
       return res.status(401).send('only admin can perform this Actions')
    }   
        Subscription.findById(req.params.id)
        .then(sub => {
            if(!sub) {
                return res.status(404).send({
                    message: "Subscription not found with id " + req.params.id
                });            
            }
            res.send(sub);
        }).catch(err => {
            res.status(500).send({
                message: "Error retrieving Subscription with id " + req.params.id
            })
        })    
})

router.delete('/subscription/:id',auth, async (req, res) => {
    if(!req.user.isAdmin){
      return  res.status(401).send('only admin can perform this Actions')
    } 
    try {
         const sub = await Subscription.findOneAndDelete({ _id: req.params.id})
        if (!sub) {
            res.status(404).send()
        }
        await res.send(sub)
    } catch (e) {
        res.status(500).send()
     }  
})

router.patch('/subscription/:id',auth, async (req, res) => {
    if(!req.user.isAdmin){
      return  res.status(401).send('only admin can perform this Actions')
    }
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'followBackUserLimit','followUsersUserLimit','shareUsersProductItemLimit',
        'shareBackUserLimit','shareBackItemLimit','shareMyClosetItemLimit','offerToLikersItemLimit'
        ,'offerToLikersDiscountPercentage','offerToLikersShippingPaid','offerToLikersMinimumShippingValue'
        ,'clearOutOffersItemLimit','clearOutOffersDiscountPercentage','clearOutOffersShippingPaid'
        ,'clearOutOffersMinimumShippingValue']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))   
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' })
        }   
        try {
            const sub = await Subscription.findOne({ _id: req.params.id})    
            if (!sub) {
                return res.status(404).send('Not Found')
            }  
            updates.forEach((update) => sub[update] = req.body[update])
            await sub.save()
            res.send(sub)
        } catch (e) {
            res.status(400).send(e)
        }
})


router.patch('/buyMySubscription', auth ,async(req,res) =>{
   
    const updates = Object.keys(req.body)
    const allowedUpdates = ['SubscriptionPackage','name']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }  
        try {
            const sub = await Subscription.findOne({ name: req.body.name})
            if(!sub) {
                return res.status(404).send('Not Found')
            }
            
            //payment middeleware will be here

            req.user.SubscriptionPackage=sub
            await sub.save()
            await req.user.save()
            res.send(req.user)
        } catch (e) {
            res.status(400).send('error')
        }  
})
    


module.exports = router