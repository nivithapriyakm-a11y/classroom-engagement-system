const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const router = express.Router();


// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "teacher"],
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ============================================================
// USER MODEL
// ============================================================

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);


// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // Check required fields

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                message: "Please fill all fields."
            });

        }


        // Check role

        if (
            role !== "student" &&
            role !== "teacher"
        ) {

            return res.status(400).json({
                message: "Invalid role."
            });

        }


        // Check password length

        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });

        }


        // Check whether email already exists

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "An account with this email already exists."
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user =
            await User.create({

                name: name.trim(),

                email: email.toLowerCase(),

                password: hashedPassword,

                role

            });


        // Send response

        return res.status(201).json({

            message:
                "Account created successfully.",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Register error:",
            error
        );


        // Handle duplicate email

        if (error.code === 11000) {

            return res.status(400).json({

                message:
                    "An account with this email already exists."

            });

        }


        return res.status(500).json({

            message:
                "Could not create account."

        });

    }

});


// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password,
            role
        } = req.body;


        // Check fields

        if (
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({

                message:
                    "Please enter email, password and role."

            });

        }


        // Check role

        if (
            role !== "student" &&
            role !== "teacher"
        ) {

            return res.status(400).json({

                message:
                    "Invalid role."

            });

        }


        // Find user

        const user =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        // Check role

        if (user.role !== role) {

            return res.status(401).json({

                message:
                    `This account is registered as ${user.role}.`

            });

        }


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        // Create a simple token

        const token =
            crypto.randomBytes(32).toString("hex");


        // Send user information

        return res.json({

            message:
                "Login successful.",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            message:
                "Could not login."

        });

    }

});


module.exports = router;