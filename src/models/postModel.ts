import { Schema, model } from "mongoose";
export const categories = [
    "Agriculture",
    "Business",
    "Education",
    "Entertainment",
    "Art",
    "Investment",
    "Uncategorized",
    "Weather",
    "Technology",
    "Health",
    "Politics",
    "Economy",
]

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: categories,
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Post = model('Post', postSchema)

export default Post