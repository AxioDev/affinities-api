const mongoose = require("mongoose");

const profilSchema = new mongoose.Schema({
    description: { type: String, default: null },
    ugliness: { type: Number, default: 0 },
    place: {type: String, default: null}
});

module.exports = mongoose.model("profil", profilSchema);