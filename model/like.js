const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
    type: { type: String, default: null },
    created_at: { type: Date, default: null},
    user_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    user_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("like", likeSchema);