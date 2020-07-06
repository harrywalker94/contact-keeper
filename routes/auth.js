const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

// @route    GET api/auth
// @desc     Get logged in User
// @access   Private

// If correct token is sent and we're logged in, this request object is goign to have a user object
// attached to it with the current logged in users ID
// .select('-password) doesn't return the password
router.get("/", auth, async(req, res) => {
    // Get user from database
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route    POST api/auth
// @desc     Auth user & get token
// @access   Public
router.post(
    "/", [
        body("email", "Please include a valid email").isEmail(),
        body("password", "Password is required").exists(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            // If no user with that email, return status message
            if (!user) {
                return res.status(400).json({ msg: "Invalid Credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            // If password doesn;t match, return status message

            if (!isMatch) {
                return res.status(400).json({ msg: "Invalid Crednetials" });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"), {
                    expiresIn: 360000,
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

module.exports = router;