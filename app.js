require("dotenv").config();
require("./config/database").connect();
const User = require("./model/user")
const Profil = require('./model/profil')
const express = require("express")
const app = express()
const auth = require("./middleware/auth")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

app.use(express.json());

app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
        // Get user input
        const { first_name, last_name, email, password, birthday } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name && birthday)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hashSync(password, 10);

        const user_profil = await Profil.create({
            description: 'test',
            ugliness: 1
        });

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            birthday: moment(birthday, 'YYYY-MM-DD').toDate(),
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            profil: user_profil._id.toString()
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compareSync(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // user
            res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

app.get("/profil", auth, async (req, res) => {
    const user = await User.findOne({_id: req.user.user_id})
        .populate({ path: 'profil', model: Profil })

    return res.status(200).json(user.profil);
});

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});


module.exports = app;
