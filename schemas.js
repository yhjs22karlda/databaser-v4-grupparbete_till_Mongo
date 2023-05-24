import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subscriptions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Channel"
    },
    createdAt: {
        type: Date,
        default: () => {
            return new Date()
        }
    }
})

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    channels: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Channel"
    }
},{
    timestamps: true
})

export const Channel = mongoose.model('Channel', channelSchema)
export const User = mongoose.model('User', userSchema)
export const Message = mongoose.model('Message', messageSchema)