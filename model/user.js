const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    birthday: { type: Date, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
    profil: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profil"
    }
});

module.exports = mongoose.model("user", userSchema);