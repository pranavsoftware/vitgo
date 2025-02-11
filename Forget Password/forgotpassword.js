// forgot-password.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;

        sendPasswordResetEmail(auth, email)
            .then(() => {
                document.getElementById('message').textContent = 'A password reset link has been sent to your email.';
                document.getElementById('message').style.color = 'green';
            })
            .catch((error) => {
                document.getElementById('message').textContent = `Error: ${error.message}`;
                document.getElementById('message').style.color = 'red';
            });
    });
});