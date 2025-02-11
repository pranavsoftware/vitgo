import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration object
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
const auth = getAuth();

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Reference to the container where plans will be displayed
const plansContainer = document.getElementById("userList");
const spinner = document.getElementById("spinner");

// Function to fetch plans from Firestore
async function fetchPlans() {
    showLoading(); // Show spinner before loading data
    try {
        const plansRef = collection(db, "posts");
        const snapshot = await getDocs(plansRef);
        plansContainer.innerHTML = '';  // Clear previous plans

        // Loop through each plan and display it
        snapshot.forEach((doc) => {
            const planData = doc.data();
            const planId = doc.id;  // Get the unique ID for each plan
            const planCard = createPlanCard(planData, planId);
            plansContainer.appendChild(planCard);
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
    } finally {
        hideLoading(); // Hide spinner after loading data
    }
}

// Function to create a plan card
function createPlanCard(planData, planId) {
    const card = document.createElement("div");
    card.className = "plan-card";
    card.innerHTML = `
        <h3><span class="username">${planData.username}</span></h3>
        <p>University: ${planData.university}</p>
        <p>Date & Time: ${planData.dateTime}</p>
        <p>From: ${planData.fromPlace}, ${planData.fromCity}, ${planData.fromState}</p>
        <p>To: ${planData.toPlace}, ${planData.toCity}, ${planData.toState}</p>
        <p>Message: ${planData.message}</p>
    `;
    return card;
}

// Function to filter plans based on the search query
function filterPlans() {
    const searchValue = document.getElementById("searchBar").value.toLowerCase();
    const planCards = document.querySelectorAll(".plan-card");

    planCards.forEach(card => {
        const username = card.querySelector(".username").textContent.toLowerCase();
        if (username.includes(searchValue)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// Event listener for the search bar
document.getElementById("searchBar").addEventListener("input", filterPlans);

// Check user authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Check if user email is allowed
        if (!allowedEmails.includes(user.email)) {
            alert("You do not have access to this page.");
            window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authorized
        } else {
            fetchPlans(); // Fetch plans if user is authorized
        }
    } else {
        window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authenticated
    }
});

// Loading Spinner functions
function showLoading() {
    spinner.style.visibility = 'visible';  // Ensure spinner is visible
    spinner.style.opacity = 1;  // Add opacity for smoother fade-in
    spinner.style.transition = 'opacity 0.3s ease';  // Optional: smooth transition
}

function hideLoading() {
    spinner.style.opacity = 0;  // Fade out spinner
    setTimeout(() => {
        spinner.style.visibility = 'hidden';  // Hide the spinner after fade-out completes
    }, 300);  // Match this time with the opacity transition duration
}

// Fetch plans on page load (will only execute if user is authorized)
window.addEventListener("DOMContentLoaded", () => {
    // Fetch plans only after the user has been validated
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Check if user email is allowed
            if (!allowedEmails.includes(user.email)) {
                alert("You do not have access to this page.");
                window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authorized
            } else {
                fetchPlans(); // Fetch plans if user is authorized
            }
        } else {
            window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authenticated
        }
    });
});
