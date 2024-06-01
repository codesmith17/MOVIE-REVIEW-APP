const express = require("express");
const router = express.Router();

const { signin, verifyUser, signup, getUserData, getOthersData, forgotPassword, resetPassword } = require("../controllers/Auth.controller.js");




router.post("/signin", signin);
router.get("/verify/:source?", verifyUser);
router.post("/signup", signup);
router.get("/getOthersData/:username", getOthersData);
router.get("/getUserData", verifyUser, getUserData);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
// router.get("/getOthersData", getOthersData);
// router.post('/google', google);
module.exports = router;