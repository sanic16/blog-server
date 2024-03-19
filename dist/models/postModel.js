"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
const mongoose_1 = require("mongoose");
exports.categories = [
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
];
const postSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: exports.categories,
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    }
}, { timestamps: true });
const Post = (0, mongoose_1.model)('Post', postSchema);
exports.default = Post;
//# sourceMappingURL=postModel.js.map