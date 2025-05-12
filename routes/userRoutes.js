const express = require("express");
const { getUserProfile, updateUserDetails, getUserDetailsByUserId,getUserNamesByPrefix } = require("../services/userService");
const { authenticateToken } = require("../utils/jwtUtils");
const multer = require("multer");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const result = await getUserProfile(req.user, req.pool);
        res.status(result.status).json(result.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.put("/users", authenticateToken, upload.single("profile_pic"), async (req, res) => {
    try {
        console.log("User object from token:", req.user); // Debugging log
        console.log("Uploaded file:", req.file); // Debugging log for the uploaded file
        console.log("Request body:", req.body); // Debugging log for other user details

        // Pass the user object, request body, and uploaded file to the service
        const result = await updateUserDetails(req.user, req.body, req.file);

        res.status(result.status).json(result.data);
    } catch (err) {
        console.error("Error in PUT /users:", err);
        res.status(500).json({ message: err.message });
    }
});
router.get("/getUserDetails", authenticateToken, async (req, res) => {
    try {
        const detailsOfUser = await getUserDetailsByUserId(req.user);
        res.status(detailsOfUser.status).json(detailsOfUser.data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/getUserNameByPrefix/:prefix/:page", async(req,res)=>{
    try{
        const usernames=await getUserNamesByPrefix(req.params.prefix,req.params.page);
        res.status(usernames.status).json({data : usernames.data,count: usernames.count});
    }catch(err){
        res.status(500).json({ message: err.message });  
    }
})
module.exports = router;
