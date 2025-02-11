import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const db = getFirestore(app);

// DOM elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

// Login form submission
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        const driversRef = collection(db, "drivers");
        const q = query(driversRef, where("email", "==", email), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const driverData = querySnapshot.docs[0].data();
            alert(`Welcome, ${driverData.name}!`);

            // Redirect to the dashboard
            window.location.href = "../EasyCab Drivers/Dashboard Page/index.html"; // Replace with the actual dashboard page URL
        } else {
            errorMessage.textContent = "Invalid email or password.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        errorMessage.textContent = "An error occurred. Please try again.";
    }
});
