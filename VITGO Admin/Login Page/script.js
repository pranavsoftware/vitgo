import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Allowed email IDs
const allowedEmails = ["padmapriya.r@vit.ac.in", "sahildinesh.zambre2023@vitstudent.ac.in", "raybanpranav.mahesh2023@vitstudent.ac.in", "arye.chauhan2023@vitstudent.ac.in", "akshay.mattoo2023@vitstudent.ac.in", "atharva.mahesh2022@vitstudent.ac.in",];

// Function to show modal alert
function showModal(message) {
    const modal = document.getElementById("alertModal");
    const modalMessage = document.getElementById("modalMessage");
    modalMessage.textContent = message;
    modal.style.display = "block";
}

// Event listener for closing modal
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("alertModal").style.display = "none";
});

// Add event listener for login button
document.getElementById("loginButton").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!allowedEmails.includes(email)) {
        showModal("This email is not allowed to login.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successful login
            showModal("Login successful!");
            // Redirect to the main dashboard after a short delay
            setTimeout(() => {
                window.location.href = "../Dashboard/index.html";
            }, 2000);
        })
        .catch((error) => {
            // Handle errors
            showModal(error.message);
        });
});

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);
    } else {
        console.log("User is logged out");
    }
});

