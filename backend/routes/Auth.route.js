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
  getFriendsThatFollow,
  getFollowers,
  getFollowing,
} = require("../controllers/Auth.controller.js");

router.post("/signin", signin);
router.get("/verify/:source?", verifyUser, (req, res) => {
  // If verifyUser passes, send success response
  res.status(200).json({
    message: "User verified.",
    data: req.user,
  });
});
router.post("/signup", signup);
router.get("/getOthersData/:username", getOthersData);
router.get("/getUserData", verifyUser, getUserData);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post(
  "/upload-profile-picture",
  verifyUser,
  upload.single("profilePicture"),
  uploadProfilePicture,
);
router.post("/toggleFollow/:username", verifyUser, toggleFollow);
router.get("/initializeGraph", verifyUser, basicGraphNetworkInitialisation);
router.get(
  "/getFriendsThatFollow/:myUsername/:otherUsername",
  getFriendsThatFollow,
);
router.get("/getFollowers/:username", getFollowers);
router.get("/getFollowing/:username", getFollowing);
module.exports = router;
