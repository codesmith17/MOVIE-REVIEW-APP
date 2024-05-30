const express = require("express");
const router = express.Router();

const { signin, verifyUser, signup, getUserData, getOthersData } = require("../controllers/Auth.controller.js");


router.post("/signin", signin);
router.get("/verify/:source?", verifyUser);
router.post("/signup", signup);
router.get("/getOthersData/:userID", getOthersData);
router.get("/getUserData", verifyUser, getUserData);
// router.get("/getOthersData", getOthersData);
// router.post('/google', google);
module.exports = router;