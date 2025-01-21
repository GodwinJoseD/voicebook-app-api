const express = require("express");
const { getUserProfile } = require("../services/userService");
const { authenticateToken } = require("../utils/jwtUtils");

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await getUserProfile(req.user, req.pool);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
