import {model, Schema} from 'mongoose';

const caption = new Schema ({
    text: {
        type: String,
        required: true
    },
    boxNumber: {
        type: Number,
        required: true
    },
    font: {
        type: String,
    },
    size: {
        type: String
    }
})

const Meme = new Schema ({
    user_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    captions: {
        type: [caption],
        required: true
    },
    title: {
        type: String,
        required: true,
        default: "Untitled"
    },
    description: {
        type: String,
        default: ""
    },
    private: {
        type: Boolean,
        required: true,
        default: true
    }
});

export default model ('Meme', Meme);