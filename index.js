import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
import { Channel, User, Message} from "./schemas.js"

const baseaddress = "/shui/api"

const app = express()
const PORT = 3000
app.use(express.json())

app.get(baseaddress + "/channels", async (req, res) => {
    try {
        const data = await Channel.find({}, 'name owner -_id' )
        res.status(200).json({success: true, data: data})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

app.get(baseaddress + "/channels/user", async (req, res) => {
    try {
        const data = await User.findOne({_id: req.body.userId})
        .populate({
            path: "subscriptions",
            populate: {path: "owner", select: "username"}
        })
        const result = data.subscriptions.map(item => ({
            channelId: item.id,
            name: item.name,
            owner: item.owner.username
        }))

        // Gammal lösning innan populate:
        // const data = await User.findOne({_id: req.body.userId}, 'subscriptions')
        // const result = []
        // for await(const item of data.subscriptions) {
        //     const channel = await Channel.findOne({_id: item})
        //     result.push({
        //         channelId: channel._id,
        //         name: channel.name,
        //         owner: channel.owner
        //     })
        // }
        res.status(200).json({success: true, data: result})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

app.post(baseaddress + "/channels/create", async (req, res) => {
    try {
        await Channel.create({name: req.body.channelName, owner: req.body.userId})
        res.status(201).json({success: true, msg: "Channel created."})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

app.post(baseaddress + "/channels/subscribe", async (req, res) => {
    //TODO [subscriptions] får inte ha dubletter
    try {
        const data = await User.updateOne({_id: req.body.userId}, {$push: {subscriptions: req.body.channelId}})
        res.status(201).json({success: true, msg: "Subscription added"})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

app.get(baseaddress + "/channels/messages", async (req, res) => {
    let sort = -1 //'DESC'
    if(req.query.sort === 'oldest') sort = 1 //'ASC'
    try {
        const data = await Message.find({channels: {$elemMatch:{$eq:req.body.channelId}}},
        '-__v').sort({createdAt: sort})
        res.status(200).json({success: true, data: data})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

app.post(baseaddress + "/channels/messages/create", async (req, res) => {
    //TODO channels får inte vara tom. Kan man använda bara ett anrop till servern?
    try {
        const userPrenums = (await User.findOne({_id: req.body.userId})).subscriptions
        const channelsToPostTo  = req.body.channels.filter(item => userPrenums.includes(item))
        await Message.create({
            userId: req.body.userId,
            title: req.body.title,
            text: req.body.text,
            channels: channelsToPostTo
        })
        res.status(201).json({success: true, msg: "Message added."})
    } catch (err) {
        res.status(err.statusCode || 500).json({success: false, msg: err.message})
    }
})

mongoose.connect(process.env.DATABASE_URL)
mongoose.connection.on('error', err => console.log(err))
mongoose.connection.once('connected', () => console.log('Connected to Database'))

// Startanvändare:
// await User.create({username: 'User 1', password: "1234", subscriptions: ['646d177905502dae86aa7c7b', '646d199e98c13969863f6c24']})
// await User.create({username: 'User 2', password: "1234"})

app.listen(PORT, () => {
    console.log('Listening to port ' + PORT)
})