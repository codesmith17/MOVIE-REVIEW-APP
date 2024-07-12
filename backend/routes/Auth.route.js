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
    uploadProfilePicture,
    toggleFollow,
    basicGraphNetworkInitialisation,
    getMutualFriends
} = require("../controllers/Auth.controller.js");

router.post("/signin", signin);
router.get("/verify/:source?", verifyUser);
router.post("/signup", signup);
router.get("/getOthersData/:username", getOthersData);
router.get("/getUserData", verifyUser, getUserData);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post('/upload-profile-picture', verifyUser, upload.single('profilePicture'), uploadProfilePicture);
router.post("/toggleFollow/:username", verifyUser, toggleFollow);
router.get('/initializeGraph', verifyUser, basicGraphNetworkInitialisation);
router.get("/getMutualFriends/:myUsername/:otherUsername", getMutualFriends);
module.exports = router;