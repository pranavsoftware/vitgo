import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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

// Employee Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const popupMessage = document.getElementById('popupMessage');

    // Check if the email belongs to the @emp-easycab.site domain
    if (!email.endsWith('@emp-easycab.site')) {
        popupMessage.textContent = "Only @emp-easycab.site email IDs are accepted.";
        popupMessage.className = "popup-message error";
        popupMessage.style.display = "block";
        return;
    }

    try {
        // Sign in the user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Redirect to employee dashboard after successful login
        if (user) {
            window.location.href = "../Dashboard Page/index.html";
        }
    } catch (error) {
        console.error("Error logging in: ", error);
        // Show error message
        popupMessage.textContent = "Error: " + error.message;
        popupMessage.className = "popup-message error";
        popupMessage.style.display = "block";

        setTimeout(() => {
            popupMessage.style.display = "none";
        }, 3000);
    }
});
