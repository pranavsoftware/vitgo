// Import required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const auth = getAuth(app);

// Function to suppress console logs, warnings, and errors
(function() {
    console.log = function() {};  // Suppress console.log
    console.warn = function() {}; // Suppress console.warn
    console.error = function() {}; // Suppress console.error
})();

// Function to get the current location with compulsory permission
const getLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const user = auth.currentUser;

            if (user) {
                const userId = user.uid; // Get the user's UID
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Convert the current date and time to IST
                const options = { timeZone: 'Asia/Kolkata', hour12: false };
                const timestamp = new Date().toLocaleString('en-IN', options);

                // Save the location in Firestore
                const locationRef = doc(db, "child_locations", userId);
                await setDoc(locationRef, {
                    location: { lat, lon },
                    timestamp: timestamp
                }, { merge: true }); // Merge ensures existing data is not overwritten
            }
        }, (error) => {
            // Handle error if permission is denied or location is not available
            alert("Dear VITian, your permission is needed for your safety. Please grant access to your location.");

            // Log out the user and redirect them to the login page
            signOut(auth).then(() => {
                // Redirect user to login page after log out
                window.location.href = 'https://vitv.easycab.site/'; // Replace with your actual login page URL
            }).catch((error) => {
                console.error("Error during sign out:", error);
            });
        });
    } else {
        // Handle the case if geolocation is not supported
        alert("Your browser does not support location. Please use a compatible browser.");
    }
};

// Function to check if the app is installed as a PWA
const checkIfPWA = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // The app is likely installed as a PWA
        console.log("This app is running as a PWA.");
    }
};

// Check if the app is running as a PWA
checkIfPWA();

// Sync location every 2 seconds if the app is running in the background (PWA) or in the foreground (web app)
setInterval(getLocation, 2000); // 2000 ms = 2 seconds

// Service Worker Setup for PWA (if not already done)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../dashboard/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
