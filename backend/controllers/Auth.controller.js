const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const crypto = require("crypto-js");
const verifyUser = (req, res, next) => {
    // console.log("!", req.headers)

    let token = req.headers && req.headers.cookie ? req.headers.cookie.split("access_token=")[1] : null;
    const likes = "likes";
    console.log("TOKEN:", req.headers.cookie);
    const source = req.params ? req.params.source : null;
    if (!token && source === likes) {
        next();
        return;
    }

    if (!token) {
        res.status(401).json({ message: "UNAUTHORIZED, LOGIN AGAIN WITH YOUR CREDENTIALS" });
        return;
    }
    if (token.includes(";"))
        token = token.split(";")[0];
    // console.log("kissss", token);
    if (!token) {
        return res.status(403).json({ message: "No token provided." });
    }
    // console.log("123")
    jwt.verify(token, "krishna170902", (err, decoded) => {
        if (err) {
            console.error("Token verification error: ", err);
            return res.status(500).json({ message: "Failed to authenticate token." });
        }
        console.log("user", decoded);
        req.user = decoded;
        if (req.params.source === "login")
            res.status(200).json({ message: "User verified.", data: req.user });
        next();
    });
};



const signin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === "" || password.trim() === "") {
        return res.status(400).json({ message: "Email and password are required." });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (password !== user.password) {
                return res.status(401).json({ message: "Invalid credentials." });
            }

            const token = jwt.sign({ id: user._id, email: email }, "krishna170902", {
                expiresIn: "24h",
            });

            // Clear any existing cookies with wrong path


            // Set the new cookie with the correct path
            res.cookie("access_token", token, {
                httpOnly: true, // Set httpOnly for security
                maxAge: 24 * 60 * 60 * 1000, // 24 hours in millisecon
                path: '/', // Set the path to root

            }).status(200).json({
                message: "Authentication successful.",
                user: {
                    access_token: token,
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
            });
        })
        .catch(err => {
            next(err);
        });
};


const signup = (req, res) => {
    const { name, email, password, confirmPassword, username } = req.body.form;
    const checked = req.body.checked;
    if (checked === false) {
        return res.status(401).json({ message: "YOU HAVE TO AGREE OUR TERMS AND CONDITIONS" });
    }
    // Check for missing fields
    if (!name || !email || !password || !confirmPassword || name.trim() === "" || email.trim() === "" || password.trim() === "" || confirmPassword.trim() === "" || !username || username.trim() === "") {
        return res.status(400).json({ message: "All fields are required." });
    }

    User.findOne({
            $or: [
                { email },
                { username }
            ]
        })
        .then(user => {
            if (user) {
                return res.status(401).json({ message: "This user already exists. Try with another email ID or username." });
            }

            if (password !== confirmPassword) {
                return res.status(401).json({ message: "Password and confirm password do not match." });
            }

            return User.create({ name, email, password, username })
                .then(newUser => {
                    res.status(201).json({ message: "User registered.", user: { name: newUser.name, email: newUser.email } });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Server error. Please try again later." });
        });
};

const getUserData = (req, res, next) => {
    const email = req.user.email;
    User.findOne({ email })
        .then(user => {
            if (user) {
                const { password, __v, ...rest } = user.toObject();
                res.status(200).json({ message: "DATA SENT SUCCESSFULLY.", data: rest });
            } else {
                res.status(404).json({ message: "User not found." });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        });
};
const getOthersData = (req, res, next) => {
    const username = req.params.username;
    console.log(username);
    User.findOne({ username })
        .then(user => {
            if (user) {
                const { password, __v, ...rest } = user.toObject();
                res.status(200).json({ message: "DATA SENT SUCCESSFULLY.", data: rest });
            } else {
                res.status(404).json({ message: "User not found." });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        });

}





const forgotPassword = (req, res, next) => {
    const email = req.body.email;

    User.findOne({ email })
        .then(response => {
            if (!response) {
                return res.status(404).json({ message: "User not found" });
            }

            const username = response.username;
            const secretKey = "krishna170902"; // Replace with your actual secret key
            const encryptedUsername = crypto.AES.encrypt(username, secretKey).toString();
            const link = `https://movie-review-app-inky.vercel.app/reset-password/${encodeURIComponent(encryptedUsername)}`;

            response.resetToken = encryptedUsername;
            response.save()
                .then(() => {
                    nodemailer.createTestAccount((err, account) => {
                        if (err) {
                            console.error('Failed to create a testing account. ' + err.message);
                            return res.status(500).send("Internal Server Error");
                        }

                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                            auth: {
                                user: 'kanchanlatakrishna@gmail.com',
                                pass: 'obzt ogpu yqss hfzb'
                            }
                        });

                        const message = {
                            from: 'KRISHNA <test.zboncak58@ethereal.email>',
                            to: email,
                            subject: 'RESET PASSWORD!',
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
                                console.error('Error occurred while sending email. ' + err.message);
                                return res.status(500).send("Internal Server Error");
                            }
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                            res.status(200).json({ message: "Reset email sent!" });
                        });
                    });
                })
                .catch(err => {
                    console.error('Error saving user. ' + err.message);
                    res.status(500).send("Internal Server Error");
                });

        })
        .catch(err => {
            console.error('Error finding user. ' + err.message);
            res.status(500).send("Internal Server Error");
        });
};
const resetPassword = (req, res, next) => {
    const { password, username, resetToken } = req.body;
    User.findOne({ username })
        .then(response => {
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
            response.save()
                .then(() => {
                    res.status(200).json({ message: "Password reset successfully!" });
                })
                .catch(err => {
                    console.error('Error saving user. ' + err.message);
                    res.status(500).json({ message: "Internal Server Error" });
                });

        })
}

module.exports = { signin, verifyUser, signup, getUserData, getOthersData, forgotPassword, resetPassword };