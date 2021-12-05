require("dotenv").config();
require("./config/database").connect();
const User = require("./model/user")
const Profil = require('./model/profil')
const Like = require('./model/like')
const express = require("express")
const app = express()
const auth = require("./middleware/auth")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

app.use(express.json());

app.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password, birthday } = req.body;

        if (!(email && password && first_name && last_name && birthday)) {
            res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        encryptedPassword = await bcrypt.hashSync(password, 10);

        const user_profil = await Profil.create({
            description: 'test',
            ugliness: 1
        });

        const user = await User.create({
            first_name,
            last_name,
            birthday: moment(birthday, 'YYYY-MM-DD').toDate(),
            email: email.toLowerCase(),
            password: encryptedPassword,
            profil: user_profil._id.toString()
        });

        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        user.token = token;

        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("All input is required");
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compareSync(password, user.password))) {

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            user.token = token;

            res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});

app.get("/profil", auth, async (req, res) => {
    const user = await User.findOne({_id: req.user.user_id})
        .populate({ path: 'profil', model: Profil })

    return res.status(200).json(user.profil);
});

app.get('/profil/:id', auth, async (req, res) => {
    const user = await User.findOne({_id: req.params.id})
        .populate({ path: 'profil', model: Profil })

    return res.status(200).json(user);
});

app.get('/like/:id/:type?', auth, async (req, res) => {
    const id = req.params.id;
    let type = req.params.type;

    const user = await User.findOne({_id: id})

    if (type === null) {
        type = 'like';
    }

    if (type !== 'like' && type !== 'dislike') {
        return res.status(400).json({
           "success": false,
           "message": "Invalid like type"
        });
    }

    if (!user) {
        return res.status(400).json({
            "message": "User doesn't exist.",
            "success": false
        });
    }

    if (user.id === id) {
        return res.status(400).json({
           "message": "You cannot like yourself",
           "success": false
        });
    }

    const like = await Like.create({
        type: type,
        created_at: moment().toDate(),
        user_from: req.user.user_id,
        user_to: id
    });

    return res.status(200).json({
        'success': true
    })
});

module.exports = app;
