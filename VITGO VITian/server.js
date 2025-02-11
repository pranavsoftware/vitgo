import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 Load Firebase Service Account
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("✅ Using FIREBASE_SERVICE_ACCOUNT from .env");
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); // Restore newlines
    } else {
        console.log("🔄 Loading serviceAccountKey.json");
        serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf-8"));
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Error loading Firebase credentials:", error);
    process.exit(1); // Exit if Firebase setup fails
}

const db = admin.firestore();

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 📩 API to Handle Sending Friend Request Notifications
app.post("/send-friend-request", async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
        // Fetch sender and receiver details from Firestore
        const senderDoc = await db.collection("users").doc(senderId).get();
        const receiverDoc = await db.collection("users").doc(receiverId).get();

        if (!senderDoc.exists || !receiverDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();


        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: receiverData.email,
            subject: "New Friend Request on Your VITGO Web-chat",
            html: `
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Friend Request Notification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    background: #ffffff;
                    margin: 20px auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    width: 120px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #666;
                }
                .social-icons img {
                    width: 30px;
                    margin: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://easycab.site/assets/logo%20(1).png" alt="EasyCab Logo" class="logo">
                <h2>Hello ${receiverData.name},</h2>
                <p>You have received a new friend request from <strong>${senderData.name}</strong>.</p>
                <p>Go to your Webpage to accept or decline the request.</p>
                <a href="https://easycab.site/" class="button">View Requests</a>
                <br><br>
                <p>Best regards,<br><strong>VITGO Team</strong></p>
                <div class="social-icons">
                    <a href="https://www.instagram.com/easy_cab24.7/" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram">
                    </a>
                    <a href="https://www.linkedin.com/company/easycab-24-7/" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn">
                    </a>
                </div>
                <p class="footer">© 2025 VITGO. All rights reserved.</p>
            </div>
        </body>
        </html>
    `,
        };


        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Friend request email sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// 🚀 Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

