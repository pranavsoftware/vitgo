import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase only if no apps are already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Function to get user location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

// Function to sync location to Firestore
async function syncLocation(userId) {
    try {
        const location = await getUserLocation();
        const currentDate = new Date();
        
        // Prepare data with updated time and date
        const locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            date: currentDate.toLocaleDateString(), // e.g., '12/9/2024'
            time: currentDate.toLocaleTimeString(), // e.g., '10:30:45 AM'
            uid: userId
        };

        // Reference to the Firestore document
        const locationRef = doc(db, "driver location", userId);

        // Update Firestore document
        await setDoc(locationRef, locationData, { merge: true });

        console.log(`Location synced for user: ${userId}`, locationData);
    } catch (error) {
        console.error("Failed to sync location:", error);
    }
}

// Function to start location syncing
function startLocationSync(userId) {
    setInterval(() => {
        syncLocation(userId);
    }, 2000); // Sync every 2 seconds
}

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
        startLocationSync(user.uid);
    } else {
        console.log("No user is logged in.");
    }
});
