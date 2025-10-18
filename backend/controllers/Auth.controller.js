const User = require("../models/User.model.js");
const Review = require("../models/Review.model.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto-js");
const { bucket } = require("../utils/firebaseAdmin");
const { initializeGraph, getGraph } = require("../utils/GraphInstance.js");
const { Op } = require("sequelize");

// Security: Load secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "krishna170902"; // Fallback for development only
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET; // Refresh token secret
const CRYPTO_SECRET = process.env.CRYPTO_SECRET || "krishna170902"; // For password reset encryption
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // App base URL

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

    const userId = req.user.id; // Ensure you have the user ID from the token

    // Update the user's profile picture URL in the database
    const [rowsUpdated] = await User.update(
      { profilePicture: imageURL[0] },
      { where: { id: userId } }
    );

    if (rowsUpdated === 0) {
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
      where: { username: usernameBeingFollowed },
    });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current follow status
    const isFollowing = userToFollow.followersList.includes(usernameFollowing);

    // Prepare update operations
    let message;

    if (isFollowing) {
      // Unfollow
      const updatedFollowersList = userToFollow.followersList.filter(
        (u) => u !== usernameFollowing
      );
      const currentUser = await User.findOne({ where: { username: usernameFollowing } });
      const updatedFollowingList = currentUser.followingList.filter(
        (u) => u !== usernameBeingFollowed
      );

      await Promise.all([
        User.update(
          {
            followers: userToFollow.followers - 1,
            followersList: updatedFollowersList,
          },
          { where: { username: usernameBeingFollowed } }
        ),
        User.update(
          {
            following: currentUser.following - 1,
            followingList: updatedFollowingList,
          },
          { where: { username: usernameFollowing } }
        ),
      ]);

      message = "Unfollowed successfully";
    } else {
      // Follow
      const updatedFollowersList = [...userToFollow.followersList, usernameFollowing];
      const currentUser = await User.findOne({ where: { username: usernameFollowing } });
      const updatedFollowingList = [...currentUser.followingList, usernameBeingFollowed];

      await Promise.all([
        User.update(
          {
            followers: userToFollow.followers + 1,
            followersList: updatedFollowersList,
          },
          { where: { username: usernameBeingFollowed } }
        ),
        User.update(
          {
            following: currentUser.following + 1,
            followingList: updatedFollowingList,
          },
          { where: { username: usernameFollowing } }
        ),
      ]);

      message = "Followed successfully";
    }

    // Get updated follower count
    const updatedUser = await User.findOne({ where: { username: usernameBeingFollowed } });

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
  // Read access token from httpOnly cookie (most secure)
  const token = req.cookies?.access_token;
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

  // Verify JWT token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);

      // If token expired, client should call refresh-token endpoint
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }

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
  // Read access token from httpOnly cookie
  const token = req.cookies?.access_token;

  // If no token, continue without user
  if (!token) {
    return next();
  }

  // Verify JWT token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
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

    const user = await User.findOne({ where: { username } });
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

// Helper function to generate refresh token
const generateRefreshToken = (userId, email, username) => {
  return jwt.sign(
    { id: userId, email, username, type: "refresh" },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // 7 days
  );
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find user
    const user = await User.findOne({ where: { email } });

    // Validate password
    // Use generic message for both cases to prevent user enumeration attacks
    if (!user || password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate access token (15 min) and refresh token (7 days)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "15m" } // Short-lived for security
    );

    const refreshToken = generateRefreshToken(user.id, user.email, user.username);

    // Initialize user graph (non-blocking)
    initializeUserGraph(user.username).catch((err) => {
      console.error("Non-critical: Failed to initialize graph:", err);
    });

    // Prepare response - NO tokens in body for maximum security
    const responseData = {
      message: "Authentication successful.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    };

    // Set BOTH tokens as httpOnly cookies (secure, not accessible via JS)
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth",
      })
      .status(200)
      .json(responseData);
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const signup = async (req, res) => {
  const { name, email, password, confirmPassword, username } = req.body.form;
  const checked = req.body.checked;

  if (checked === false) {
    return res.status(401).json({ message: "YOU HAVE TO AGREE OUR TERMS AND CONDITIONS" });
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

  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (user) {
      return res.status(401).json({
        message: "This user already exists. Try with another email ID or username.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).json({ message: "Password and confirm password do not match." });
    }

    const newUser = await User.create({ name, email, password, username });

    // Auto sign-in after successful signup - generate both tokens
    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "15m" } // Short-lived for security
    );

    const refreshToken = generateRefreshToken(newUser.id, newUser.email, newUser.username);

    // Initialize user graph (non-blocking)
    initializeUserGraph(newUser.username).catch((err) => {
      console.error("Non-critical: Failed to initialize graph:", err);
    });

    const responseData = {
      message: "User registered and logged in successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      },
    };

    // Set BOTH tokens as httpOnly cookies (secure, not accessible via JS)
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth",
      })
      .status(201)
      .json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getUserData = async (req, res, next) => {
  const email = req.user.email;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const { password, ...rest } = user.toJSON();

      res.status(200).json({ message: "DATA SENT SUCCESSFULLY.", data: rest });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFriendsThatFollow = async (req, res, next) => {
  const { myUsername, otherUsername } = req.params;

  try {
    // Fetch both users from database
    const [myUser, otherUser] = await Promise.all([
      User.findOne({ where: { username: myUsername }, raw: true }),
      User.findOne({ where: { username: otherUsername }, raw: true }),
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
                  where: { username: followedUsername },
                  raw: true,
                });

                if (followedUser) {
                  // Check if this is at target depth and follows end user
                  if (distance + 1 === depth && followedUsername === endUser.username) {
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

    // Find user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get review count
    const reviewCount = await Review.count({ where: { username } });

    // Prepare response data
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      message: "Data sent successfully",
      data: {
        ...userData,
        reviewCount,
      },
    });
  } catch (err) {
    console.error("Error in getOthersData:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res, next) => {
  const email = req.body.email;

  try {
    const response = await User.findOne({ where: { email } });

    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = response.username;
    const encryptedUsername = crypto.AES.encrypt(username, CRYPTO_SECRET).toString();
    const link = `${FRONTEND_URL}/reset-password/${encodeURIComponent(encryptedUsername)}`;

    // Update resetToken
    await User.update({ resetToken: encryptedUsername }, { where: { email } });

    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error("Failed to create a testing account. " + err.message);
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
        text: `FORGOT PASSWORD FOR CINESPHERE`,
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
          console.error("Error occurred while sending email. " + err.message);
          return res.status(500).send("Internal Server Error");
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: "Reset email sent!" });
      });
    });
  } catch (err) {
    console.error("Error finding user. " + err.message);
    res.status(500).send("Internal Server Error");
  }
};

const resetPassword = async (req, res, next) => {
  const { password, username, resetToken } = req.body;

  try {
    const response = await User.findOne({ where: { username } });

    if (!response) {
      return res.status(401).json({ message: "YOU ARE UNAUTHORIZED" });
    }

    if (response.resetToken !== resetToken) {
      return res.status(401).json({ message: "YOU ARE UNAUTHORIZED" });
    }

    if (response.password === password) {
      return res.status(400).json({ message: "TRY TO USE SOME NEW PASSWORD" });
    }

    await User.update({ password, resetToken: null }, { where: { username } });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Error saving user. " + err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ["followersList"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get detailed information about followers
    const followers = await User.findAll({
      where: {
        username: {
          [Op.in]: user.followersList,
        },
      },
      attributes: ["username", "name", "profilePicture", "followers", "following", "followersList"],
    });

    res.status(200).json({ followers });
  } catch (err) {
    console.error("Error in getFollowers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ["followingList"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get detailed information about users being followed
    const following = await User.findAll({
      where: {
        username: {
          [Op.in]: user.followingList,
        },
      },
      attributes: ["username", "name", "profilePicture", "followers", "following", "followersList"],
    });

    res.status(200).json({ following });
  } catch (err) {
    console.error("Error in getFollowing:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refresh_token || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Refresh token verification error:", err);
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      // Check if it's actually a refresh token
      if (decoded.type !== "refresh") {
        return res.status(403).json({ message: "Invalid token type" });
      }

      try {
        // Verify user still exists
        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: decoded.id, email: decoded.email, username: decoded.username },
          JWT_SECRET,
          { expiresIn: "15m" }
        );

        // Generate new refresh token (token rotation for better security)
        const newRefreshToken = generateRefreshToken(decoded.id, decoded.email, decoded.username);

        // Set BOTH tokens as httpOnly cookies (maximum security)
        res
          .cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: "/",
          })
          .cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/api/auth",
          })
          .status(200)
          .json({
            message: "Token refreshed successfully",
          });
      } catch (error) {
        console.error("Error in refresh token:", error);
        res.status(500).json({ message: "Server error" });
      }
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
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
  refreshToken,
};
