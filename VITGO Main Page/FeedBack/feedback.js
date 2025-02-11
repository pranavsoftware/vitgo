import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your Firebase configuration
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
const auth = getAuth(app); // Initialize Firebase Authentication

const feedbackForm = document.getElementById('feedbackForm');

// Sign in with Google function
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in: ", result.user);
    } catch (error) {
        console.error("Error signing in: ", error);
        alert("Could not sign in. Please try again.");
    }
}

// Listen for the feedback form submission
feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const user = auth.currentUser; // Get the current user

    // Check if user is authenticated
    if (!user) {
        alert("You must be logged in to submit feedback.");
        signInWithGoogle(); // Prompt user to sign in if not authenticated
        return; // Exit the function
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const rating = document.getElementById('rating').value;
    const message = document.getElementById('message').value;

    // Validate email
    const emailPattern = /^[\w-\.]+@(vit\.ac\.in|vitstudent\.ac\.in)$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email ending with vit.ac.in or vitstudent.ac.in.");
        return;
    }

    // Save feedback to Firestore
    try {
        await addDoc(collection(db, "feedback"), {
            name,
            email,
            rating,
            message,
            timestamp: new Date()
        });
        openPopup();
        feedbackForm.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("An error occurred while submitting your feedback. Please try again later.");
    }
});

function openPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Optionally, you might want to call signInWithGoogle() directly on page load or attach it to a login button.
