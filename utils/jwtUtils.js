const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    const payload = { id: userId }; // Payload contains the user ID
    const secret = process.env.JWT_SECRET; // Secret key from .env
    const options = { expiresIn: "1h" }; // Token expires in 1 hour

    return jwt.sign(payload, secret, options);
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Access token is missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        req.user = { id: decoded.userId }; // Attach the userId to the req.user object
        next();
    });
};

module.exports = { generateToken, authenticateToken };
