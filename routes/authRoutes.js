const express = require("express");
const { signup, login } = require("../services/authService");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const result = await signup(req.body, req.pool);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const result = await login(req.body, req.pool);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
