const User = require("../models/User.model.js");
const Review = require("../models/Review.model.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto-js");
const { bucket } = require("../utils/firebaseAdmin");
const { initializeGraph, getGraph } = require("../utils/GraphInstance.js");

const basicGraphNetworkInitialisation = async (req, res, next) => {
  try {
    const { username } = req.user;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Use the helper function to initialize graph
    await initializeUserGraph(username);

    res.status(200).json({
      message: "Graph created successfully",
      username,
    });
  } catch (error) {
    console.error("Error constructing graph:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadProfilePicture = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next(createError(400, "No file uploaded"));
  }

  try {
    const filename = new Date().getTime() + "-" + file.originalname;
    const fileRef = bucket.file("profile-pictures/" + filename);
    await fileRef.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });
    const imageURL = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    const userId = req.user.id; // Ensure you have the user ID from the Firebase token

    // Update the user's profile picture URL in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageURL[0] },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ profilePictureUrl: imageURL[0] });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return next(createError(502, error.message));
  }
};

const toggleFollow = async (req, res, next) => {
  const usernameFollowing = req.user.username;
  const usernameBeingFollowed = req.params.username;

  try {
    // Check if target user exists
    const userToFollow = await User.findOne({
      username: usernameBeingFollowed,
    });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current follow status
    const isFollowing = userToFollow.followersList.includes(usernameFollowing);

    // Prepare update operations
    let updateOperation, followingUpdateOperation, message;

    if (isFollowing) {
      // Unfollow
      updateOperation = {
        $inc: { followers: -1 },
        $pull: { followersList: usernameFollowing },
      };
      followingUpdateOperation = {
        $inc: { following: -1 },
        $pull: { followingList: usernameBeingFollowed },
      };
      message = "Unfollowed successfully";
    } else {
      // Follow
      updateOperation = {
        $inc: { followers: 1 },
        $push: { followersList: usernameFollowing },
      };
      followingUpdateOperation = {
        $inc: { following: 1 },
        $push: { followingList: usernameBeingFollowed },
      };
      message = "Followed successfully";
    }

    // Update both users
    await Promise.all([
      User.updateOne({ username: usernameBeingFollowed }, updateOperation),
      User.updateOne({ username: usernameFollowing }, followingUpdateOperation),
    ]);

    // Get updated follower count
    const updatedUser = await User.findOne({ username: usernameBeingFollowed });

    res.status(200).json({
      message,
      isFollowing: !isFollowing,
      followersCount: updatedUser.followers,
    });
  } catch (error) {
    console.error("Error in toggleFollow:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyUser = (req, res, next) => {
  // Extract token from cookie
  let token = req.headers?.cookie?.split("access_token=")[1] || null;
  const source = req.params?.source;

  // Allow unauthenticated access for "likes" source
  if (!token && source === "likes") {
    return next();
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized, login again with your credentials",
    });
  }

  // Clean token (remove trailing semicolon if present)
  if (token.includes(";")) {
    token = token.split(";")[0];
  }

  // Verify JWT token
  jwt.verify(token, "krishna170902", (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(500).json({
        message: "Failed to authenticate token.",
      });
    }

    // Attach decoded user data to request
    req.user = decoded;

    // If source is "login", send verification response
    if (source === "login") {
      return res.status(200).json({
        message: "User verified.",
        data: decoded,
      });
    }

    next();
  });
};

// Optional authentication - allows requests with or without token
const optionalAuth = (req, res, next) => {
  // Extract token from cookie
  let token = req.headers?.cookie?.split("access_token=")[1] || null;

  // If no token, continue without user
  if (!token) {
    return next();
  }

  // Clean token (remove trailing semicolon if present)
  if (token.includes(";")) {
    token = token.split(";")[0];
  }

  // Verify JWT token
  jwt.verify(token, "krishna170902", (err, decoded) => {
    if (!err) {
      // If token is valid, attach user data
      req.user = decoded;
    }
    // Continue regardless of token validity
    next();
  });
};

// Helper function to initialize user graph
const initializeUserGraph = async (username) => {
  try {
    await initializeGraph();
    const graph = getGraph();

    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found for graph initialization");
    }

    const followingList = user.followingList || [];
    const followersList = user.followersList || [];

    // Add user vertex
    graph.addVertex(username);

    // Add following connections
    followingList.forEach((following) => {
      graph.addVertex(following);
      graph.addEdge(username, following);
    });

    // Add follower connections
    followersList.forEach((follower) => {
      graph.addVertex(follower);
      graph.addEdge(follower, username);
    });

    console.log(`Graph initialized for user: ${username}`);
    return graph;
  } catch (error) {
    console.error("Error initializing user graph:", error);
    throw error;
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Validate password
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      "krishna170902",
      { expiresIn: "24h" },
    );

    // Initialize user graph (non-blocking)
    initializeUserGraph(user.username).catch((err) => {
      console.error("Non-critical: Failed to initialize graph:", err);
    });

    // Prepare response
    const responseData = {
      message: "Authentication successful.",
      user: {
        access_token: token,
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    };

    // Set cookie and send response
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      })
      .status(200)
      .json(responseData);
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const signup = (req, res) => {
  const { name, email, password, confirmPassword, username } = req.body.form;
  const checked = req.body.checked;
  if (checked === false) {
    return res
      .status(401)
      .json({ message: "YOU HAVE TO AGREE OUR TERMS AND CONDITIONS" });
  }
  // Check for missing fields
  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    name.trim() === "" ||
    email.trim() === "" ||
    password.trim() === "" ||
    confirmPassword.trim() === "" ||
    !username ||
    username.trim() === ""
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  User.findOne({
    $or: [{ email }, { username }],
  })
    .then((user) => {
      if (user) {
        return res
          .status(401)
          .json({
            message:
              "This user already exists. Try with another email ID or username.",
          });
      }

      if (password !== confirmPassword) {
        return res
          .status(401)
          .json({ message: "Password and confirm password do not match." });
      }

      return User.create({ name, email, password, username }).then(
        (newUser) => {
          res
            .status(201)
            .json({
              message: "User registered.",
              user: { name: newUser.name, email: newUser.email },
            });
        },
      );
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    });
};

const getUserData = (req, res, next) => {
  const email = req.user.email;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        const { password, __v, ...rest } = user.toObject();

        res
          .status(200)
          .json({ message: "DATA SENT SUCCESSFULLY.", data: rest });
      } else {
        res.status(404).json({ message: "User not found." });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
};

const getFriendsThatFollow = async (req, res, next) => {
  const { myUsername, otherUsername } = req.params;

  try {
    // Fetch both users from database
    const [myUser, otherUser] = await Promise.all([
      User.findOne({ username: myUsername }).lean(),
      User.findOne({ username: otherUsername }).lean(),
    ]);

    if (!myUser || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // BFS to find friends at a specific depth who follow the target user
    const bfs = async (startUser, endUser, depth) => {
      if (startUser.username === endUser.username) {
        return [];
      }

      const visited = new Set([startUser.username]);
      const queue = [{ user: startUser, distance: 0 }];
      const friendsThatFollow = [];

      while (queue.length > 0) {
        const queueSize = queue.length;

        for (let i = 0; i < queueSize; i++) {
          const { user, distance } = queue.shift();

          if (distance < depth) {
            // Process all following connections
            for (const followedUsername of user.followingList || []) {
              if (!visited.has(followedUsername)) {
                visited.add(followedUsername);

                const followedUser = await User.findOne({
                  username: followedUsername,
                }).lean();

                if (followedUser) {
                  // Check if this is at target depth and follows end user
                  if (
                    distance + 1 === depth &&
                    followedUsername === endUser.username
                  ) {
                    friendsThatFollow.push(user.username);
                  }

                  queue.push({ user: followedUser, distance: distance + 1 });
                }
              }
            }
          }
        }
      }

      return friendsThatFollow;
    };

    // Find friends at distance 2 who follow the other user
    const myFriends = await bfs(myUser, otherUser, 2);

    res.status(200).json({ myFriends });
  } catch (error) {
    console.error("Error fetching mutual friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOthersData = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Aggregate user data with review count
    const result = await User.aggregate([
      { $match: { username } },
      {
        $lookup: {
          from: "reviews",
          localField: "username",
          foreignField: "username",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          reviews: 0,
          _id: 0,
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Data sent successfully",
      data: result[0],
    });
  } catch (err) {
    console.error("Error in getOthersData:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = (req, res, next) => {
  const email = req.body.email;

  User.findOne({ email })
    .then((response) => {
      if (!response) {
        return res.status(404).json({ message: "User not found" });
      }

      const username = response.username;
      const secretKey = "krishna170902"; // Replace with your actual secret key
      const encryptedUsername = crypto.AES.encrypt(
        username,
        secretKey,
      ).toString();
      const link = `https://movie-review-app-inky.vercel.app/reset-password/${encodeURIComponent(encryptedUsername)}`;

      response.resetToken = encryptedUsername;
      response
        .save()
        .then(() => {
          nodemailer.createTestAccount((err, account) => {
            if (err) {
              console.error(
                "Failed to create a testing account. " + err.message,
              );
              return res.status(500).send("Internal Server Error");
            }

            const transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.gmail.com",
              port: 587,
              secure: false,
              auth: {
                user: "kanchanlatakrishna@gmail.com",
                pass: "nlme fgnu tfmd irwc",
              },
            });

            const message = {
              from: "KRISHNA <test.zboncak58@ethereal.email>",
              to: email,
              subject: "RESET PASSWORD!",
              text: `FORGOT PASSWORD FOR MOVIE REVIEW WEBSITE`,
              html: `
                                        <p style="font-family: Arial, sans-serif; font-size: 16px;">
                                            Dear ${username},<br><br>
                                            <b>HERE IS THE LINK TO YOUR RESET PASSWORD!</b>
                                            <a href="${link}">RESET PASSWORD LINK</a>
                                            <br><br>
                                            Best regards,<br>
                                            😘💓💓💓💓💓💓<br>
                                            Krishna Tripathi
                                        </p>
                                    `,
            };

            transporter.sendMail(message, (err, info) => {
              if (err) {
                console.error(
                  "Error occurred while sending email. " + err.message,
                );
                return res.status(500).send("Internal Server Error");
              }
              console.log("Message sent: %s", info.messageId);
              console.log(
                "Preview URL: %s",
                nodemailer.getTestMessageUrl(info),
              );
              res.status(200).json({ message: "Reset email sent!" });
            });
          });
        })
        .catch((err) => {
          console.error("Error saving user. " + err.message);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((err) => {
      console.error("Error finding user. " + err.message);
      res.status(500).send("Internal Server Error");
    });
};
const resetPassword = (req, res, next) => {
  const { password, username, resetToken } = req.body;
  User.findOne({ username }).then((response) => {
    if (!response) {
      res.status(401).json({ message: "YOU ARE UNAUTHORIZED" });
      return;
    }
    if (response.resetToken !== resetToken) {
      res.status(401).json({ message: "YOU ARE UNAUTHORIZED" });
      return;
    }
    if (response.password === password) {
      res.status(400).json({ message: "TRY TO USE SOME NEW PASSWORD" });
      return;
    }
    response.password = password;
    response.resetToken = null;
    response
      .save()
      .then(() => {
        res.status(200).json({ message: "Password reset successfully!" });
      })
      .catch((err) => {
        console.error("Error saving user. " + err.message);
        res.status(500).json({ message: "Internal Server Error" });
      });
  });
};

const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("followersList");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get detailed information about followers
    const followers = await User.find({
      username: { $in: user.followersList },
    }).select(
      "username name profilePicture followers following reviewCount followersList",
    );

    res.status(200).json({ followers });
  } catch (err) {
    console.error("Error in getFollowers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("followingList");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get detailed information about users being followed
    const following = await User.find({
      username: { $in: user.followingList },
    }).select(
      "username name profilePicture followers following reviewCount followersList",
    );

    res.status(200).json({ following });
  } catch (err) {
    console.error("Error in getFollowing:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signin,
  verifyUser,
  optionalAuth,
  signup,
  getUserData,
  getOthersData,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  toggleFollow,
  getFriendsThatFollow,
  basicGraphNetworkInitialisation,
  getFollowers,
  getFollowing,
};
