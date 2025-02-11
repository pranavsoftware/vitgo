require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./easycab-71fcf-firebase-adminsdk-ofkh5-ee6b11b1bd.json'); // Your Firebase Admin SDK JSON


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-welcome-email', async (req, res) => {
    const { email, name } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🚀 Welcome to VITGO! Get Started by Updating Your Profile',
        html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome to VITGO</title>
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
                    margin-bottom: 10px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 20px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    margin-top: 10px;
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
                .steps {
                    text-align: left;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 15px;
                    display: inline-block;
                }
                .support {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #444;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://easycab.site/assets/logo%20(1).png" alt="VITGO Logo" class="logo">
                <h2>👋 Welcome, ${name}!</h2>
                <p>We're excited to have you on <strong>VITGO</strong>! 🎉 To get the best experience, please take a moment to update your profile.</p>
                
                <div class="steps">
                    <h3>🛠️ How to Update Your Profile:</h3>
                    <p>✅ Step 1: <strong>Login</strong> to your account.</p>
                    <p>✅ Step 2: Navigate to the <strong>Profile</strong> tab.</p>
                    <p>✅ Step 3: Enter your details and click <strong>Update</strong>. 🎯</p>
                </div>
                
                <a href="https://easycab.site/" class="button">Go to Login 🚀</a>
                <br><br>
    
                <div class="support">
                    <p>💡 Need Help? If you face any issues, feel free to reach out to us at <strong>vitgo.vitvellore@gmail.com</strong>. 📩</p>
                    <p>📸 If possible, please attach a screenshot of the issue to help us resolve it faster.</p>
                </div>
    
                <p>Best regards,<br><strong>The VITGO Team</strong> 🚀</p>
                
                <div class="social-icons">
                    <a href="https://www.instagram.com/vitgo" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram">
                    </a>
                    <a href="https://www.linkedin.com/company/vitgo" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn">
                    </a>
                </div>
                
                <p class="footer">© 2025 VITGO. All rights reserved.</p>
            </div>
        </body>
        </html>`
    };



    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Welcome email sent successfully!' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
