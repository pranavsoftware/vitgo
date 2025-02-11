import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, getDoc, serverTimestamp, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Allowed email IDs
const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "sahildinesh.zambre2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

// Select the notice form and spinner element
const noticeForm = document.getElementById("notice-form");
const spinner = document.getElementById("spinner");

// Display username and profile picture in the header
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Check if user email is allowed
        if (!allowedEmails.includes(user.email)) {
            alert("You do not have access to this page.");
            window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authorized
            return;
        }

        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid); // Assuming user UID is the document ID
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            // Display username
            document.getElementById("name").textContent = userData.name || user.email.split('@')[0];
            // Display faceScan image
            document.getElementById("profile-pic").src = userData.faceScan || 'default-profile.png'; // Use default image if no face scan
        } else {
            console.error("No such user document!");
            document.getElementById("profile-pic").src = 'default-profile.png'; // Fallback to default image
        }
    } else {
        window.location = 'https://vitadmin.easycab.site/'; // Redirect to login if not authenticated
    }
});

// Logout function
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.replace('https://vitadmin.easycab.site/'); // Use replace instead of assign
    });
});


// Posting notices
noticeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const noticeText = document.getElementById("notice-text").value;
    const userName = document.getElementById("name").textContent; // Get username from header

    try {
        await addDoc(collection(db, "notices"), {
            text: noticeText,
            username: userName,
            createdAt: serverTimestamp(), // Use Firestore's server timestamp
            editedAt: null
        });
        noticeForm.reset();
        loadNotices(); // Load notices after posting
    } catch (error) {
        console.error("Error adding notice: ", error);
    }
});

// Load notices from Firestore
async function loadNotices() {
    const noticesContainer = document.getElementById("notices");
    noticesContainer.innerHTML = ''; // Clear previous notices
    spinner.style.visibility = 'visible'; // Show spinner

    try {
        // Query to get notices ordered by createdAt in descending order
        const querySnapshot = await getDocs(collection(db, "notices"), orderBy("createdAt", "desc"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const noticeDiv = document.createElement("div");
            noticeDiv.classList.add("notice");
            noticeDiv.innerHTML = `
                <h4>Posted by: ${data.username}</h4>
                <p><strong>Notice:</strong> ${data.text}</p>
                <p>Posted on: <em>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</em></p>
                <p>${data.editedAt ? `Edited on: <em>${new Date(data.editedAt.seconds * 1000).toLocaleString()}</em>` : ''}</p>
                ${data.username === document.getElementById("name").textContent ? `
                    <button class="edit-btn" data-id="${doc.id}">Edit</button>
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>` : ''}
            `;
            noticesContainer.appendChild(noticeDiv);
        });
    } catch (error) {
        console.error("Error loading notices: ", error);
    } finally {
        spinner.style.visibility = 'hidden'; // Hide spinner after loading
    }
}

// Edit notice functionality
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        const noticeId = e.target.getAttribute("data-id");
        const newText = prompt("Edit your notice:", "");
        if (newText) {
            await updateDoc(doc(db, "notices", noticeId), {
                text: newText,
                editedAt: serverTimestamp() // Use server timestamp for edited date
            });
            loadNotices(); // Reload notices to reflect changes
        }
    }

    // Delete notice functionality
    if (e.target.classList.contains("delete-btn")) {
        const noticeId = e.target.getAttribute("data-id");
        const confirmed = confirm("Are you sure you want to delete this notice?");
        if (confirmed) {
            await deleteDoc(doc(db, "notices", noticeId));
            loadNotices(); // Reload notices after deletion
        }
    }
});

// Load notices on page load
loadNotices();