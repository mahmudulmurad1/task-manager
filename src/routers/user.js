const express = require('express')
const multer = require('multer')
// const sharp = require('sharp')
const User = require('../models/user')
const Subscription = require('../models/subscription');
const auth = require('../middleware/auth')
//const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const { route } = require('../app')
const router = new express.Router()

router.post('/users', async (req, res) => {
    
    if(req.body.isAdmin===true){
        res.status(401).send('bad request')
    }

    const user = new User(req.body)

    try {
        await user.save()
        console.log(user);
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {  
    if(req.body.isAdmin===true){
        res.status(401).send('bad request')
    }
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        //sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/user/Mysubscription', auth,  async (req, res) => {
    try {
          const packID= await Subscription.findOne(req.user.SubscriptionPackage._id)
        res.status(201).send(packID)
    } catch (e) {
        res.status(500).send('not working')
    }
})



module.exports = router