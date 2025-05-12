const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid"); // For generating unique file names
const { query } = require("../db/db"); // Import the database query function
require("dotenv").config();


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Existing logic for getting user profile
async function getUserProfile(user, pool) {
    try {
        const sql = "SELECT * FROM usr.users WHERE id = $1";
        const result = await pool.query(sql, [user.id]);
        if (result.rows.length === 0) {
            return { status: 404, data: { message: "User not found" } };
        }
        return { status: 200, data: result.rows[0] };
    } catch (err) {
        throw new Error("Error fetching user profile: " + err.message);
    }
}

// New logic for updating user details
async function updateUserDetails(user, userData, profilePic) {
    try {
        const { full_name, username, email, date_of_birth } = userData;

        if (!full_name || !username || !email) {
            return { status: 400, data: { message: "Full name, username, and email are required" } };
        }

        console.log("Received user details:", { full_name, username, email, date_of_birth });

        let profilePicUrl = null;

        // If a profile picture is provided, upload it to S3
        if (profilePic) {
            const fileName = `profile-pics/${uuidv4()}-${profilePic.originalname}`;
            console.log("Uploading profile picture to S3 with name:", fileName);

            const uploadParams = {
                Bucket: process.env.S3_USER_PROFILE_BUCKET_NAME,
                Key: fileName,
                Body: profilePic.buffer, // Use the file buffer
                ContentType: profilePic.mimetype,
            };

            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);

            profilePicUrl = `https://${process.env.S3_USER_PROFILE_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            console.log("Profile picture uploaded to S3:", profilePicUrl);
        }
        let formattedDateOfBirth = null;
        if (date_of_birth) {
            const [month, day, year] = date_of_birth.split("/");
            formattedDateOfBirth = `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
            console.log("Formatted date of birth for database:", formattedDateOfBirth);
        }

        // Update the user details in the database
        const sql = `
            UPDATE usr.users
            SET full_name = $1,
                username = $2,
                email = $3,
                date_of_birth = $4,
                profile_pic_url = COALESCE($5, profile_pic_url)
            WHERE id = $6
            RETURNING *`;
        console.log(user.id);
        const result = await query(sql, [full_name, username, email, formattedDateOfBirth, profilePicUrl, user.id]);

        console.log("User updated in database:", result.rows[0]);
        console.log("Updating user with ID:", user.id);

        return { status: 200, data: result.rows[0] };
    } catch (err) {
        console.error("Error updating user details or uploading profile picture:", err);
        throw new Error("Error updating user details or uploading profile picture: " + err.message);
    }
}
async function getUserDetailsByUserId(user) {
    try {
        const sql = `SELECT COALESCE(
        (
            SELECT json_agg(s )
            FROM stories.stories s
            WHERE s.user_id = u.id
        ), '[]'
    ) AS stories,
     u.id AS userId, u.profile_pic_url, 
     COALESCE(
        (
            SELECT json_agg(p )
            FROM posts.posts p
            WHERE p.user_id = u.id
        ), '[]'
    ) AS posts
    FROM usr.users u
   where u.id= $1 ; `;
        console.log("here, in user service")
        const result = await query(sql, [user.id]);
        if (result.rows.length === 0) {
            return { status: 404, data: { message: "User not found" } };
        }
        return { status: 200, data: result.rows[0] };

    } catch (err) {
        console.error("Error in getting user's stories and post  :", err);
        throw new Error("Error in getting user's stories and post  : " + err.message);
    }

}

const getUserNamesByPrefix = async (prefix, page) => {
    try {
        const name = prefix;
        const offset = (page - 1) * 1;
        const limit = process.env.LIMIT;

        const sql = `SELECT * FROM usr.users WHERE username ILIKE $1 || '%' LIMIT $2 OFFSET $3;`
        const result = await query(sql, [name, limit, offset]);

        const getCountOfRecordsSql = `SELECT count(*) FROM usr.users WHERE username ILIKE $1 || '%';`;
        const countOfRecords = await query(getCountOfRecordsSql, [name]);

        if (result.rows.length === 0) {
            return { status: 404, data: { message: "User not found" } };
        }
        return { status: 200, data: result.rows ,count : countOfRecords?.rows[0]?.count || 0};
    } catch (err) {
        console.error("Error getting username from user details:", err);
        throw new Error("Error getting username from user details: " + err.message);
    }
}
module.exports = {
    getUserProfile,
    updateUserDetails,
    getUserDetailsByUserId,
    getUserNamesByPrefix
};