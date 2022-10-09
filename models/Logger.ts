import { model, Schema } from "mongoose";

const Logger = new Schema ({
    user: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    }
})

export default model ("Logger", Logger);