const express = require("express");
const router = express.Router();
const upload = require("../utils/uploadMiddleware");
const {
    signin,
    verifyUser,
    signup,
    getUserData,
    getOthersData,
    forgotPassword,
    resetPassword,
    uploadProfilePicture
} = require("../controllers/Auth.controller.js");

router.post("/signin", signin);
router.get("/verify/:source?", verifyUser);
router.post("/signup", signup);
router.get("/getOthersData/:username", getOthersData);
router.get("/getUserData", verifyUser, getUserData);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post('/upload-profile-picture', verifyUser, upload.single('profilePicture'), uploadProfilePicture);


module.exports = router;