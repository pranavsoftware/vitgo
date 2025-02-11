// index.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const db = getFirestore(app);

// Function to fetch notices from Firestore
function fetchNotices() {
    const noticesList = document.getElementById('noticesList');

    // Listen for real-time updates to the "VITian Notice" collection
    onSnapshot(collection(db, "VITian Notice"), (querySnapshot) => {
        // Clear the current notices list
        noticesList.innerHTML = '';

        if (querySnapshot.empty) {
            noticesList.innerHTML = '<p>No notices available.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const noticeData = doc.data();

                // Check if the createdAt field exists
                if (noticeData.createdAt && noticeData.createdAt.seconds) {
                    const createdAtDate = new Date(noticeData.createdAt.seconds * 1000).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata", // Adjust the timezone to your preference
                        dateStyle: "full",
                        timeStyle: "long"
                    });

                    const noticeItem = document.createElement('div');
                    noticeItem.classList.add('notice-item');
                    noticeItem.innerHTML = `
                        <div class="notice-title">${noticeData.title}</div>
                        <div class="notice-content">${noticeData.content}</div>
                        <div class="notice-postedBy">Posted By: ${noticeData.postedBy}</div>
                        <div class="notice-date">Posted On: ${createdAtDate}</div> <!-- Display the created date -->
                    `;
                    noticesList.appendChild(noticeItem);
                } else {
                    console.error("Notice data is missing the createdAt field:", noticeData);
                }
            });
        }
    });
}

// Call the fetchNotices function when the page loads
window.onload = fetchNotices;
