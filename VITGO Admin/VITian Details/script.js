import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const auth = getAuth();

const allowedEmails = [
    "padmapriya.r@vit.ac.in",
    "raybanpranav.mahesh2023@vitstudent.ac.in",
    "arye.chauhan2023@vitstudent.ac.in",
    "akshay.mattoo2023@vitstudent.ac.in",
    "atharva.mahesh2022@vitstudent.ac.in"
];

const spinner = document.getElementById('spinner');

// Function to show the spinner
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('active');  // Add 'active' class to show spinner
    }
}

// Function to hide the spinner
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('active');  // Remove 'active' class to hide spinner
    }
}

let users = [];

// Real-time listener to fetch users from Firestore
function listenForUsers() {
    showSpinner();  // Show spinner when fetching data
    const userCollection = collection(db, 'users');
    onSnapshot(userCollection, (snapshot) => {
        users = [];
        snapshot.forEach(doc => {
            users.push({ ...doc.data(), id: doc.id });
        });

        users.sort((a, b) => a.name.localeCompare(b.name));
        displayUsers(users);
        hideSpinner();  // Hide spinner after the data has been processed and displayed
    }, (error) => {
        console.error("Error fetching users:", error);
        hideSpinner();  // Ensure spinner is hidden in case of an error
    });
}

function displayUsers(filteredUsers) {
    const userDetailsContainer = document.getElementById('userDetails');
    userDetailsContainer.innerHTML = '';  // Clear previous user data

    if (!filteredUsers.length) {
        userDetailsContainer.innerHTML = '<p>No users found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'user-table';
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Face Scan</th>
            <th>Name</th>
            <th>Email</th>
            <th>UID</th>
            <th>Hostel Block</th>
            <th>Mobile</th>
            <th>Parent Email</th>
            <th>Parent's Mobile</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${user.faceScan || '../assets/default Avatar .jpg'}" alt="Face Scan" class="user-face"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.id}</td>
            <td>${user.hostelBlock}</td>
            <td>${user.mobile}</td>
            <td>${user.parentEmail}</td>
            <td>${user.parentsMobile}</td>
            <td>
                <button class="delete-button" data-uid="${user.id}">Delete</button>
                <button class="update-button" data-uid="${user.id}">Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    userDetailsContainer.appendChild(table);

    // Add event listener for actions like Delete or Update
    tbody.addEventListener('click', handleUserActions);
}

async function deleteUser(uid) {
    try {
        await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

function handleUserActions(event) {
    const userId = event.target.getAttribute('data-uid');
    if (event.target.classList.contains('delete-button')) {
        deleteUser(userId);
    } else if (event.target.classList.contains('update-button')) {
        showUpdateModal(userId);
    }
}

async function showUpdateModal(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const updateModal = document.getElementById('updateModal');
        document.getElementById('updateName').value = user.name;
        document.getElementById('updateEmail').value = user.email;
        document.getElementById('updateMobile').value = user.mobile;
        document.getElementById('updateParentEmail').value = user.parentEmail;
        document.getElementById('updateParentsMobile').value = user.parentsMobile;

        // Load the last update history for this user
        const historyContent = document.getElementById('historyContent');
        historyContent.innerHTML = `
            <p><strong>Last Update:</strong> ${user.lastUpdate || 'No updates available'}</p>
        `;

        updateModal.style.display = 'block';

        document.getElementById('updateForm').onsubmit = async function (e) {
            e.preventDefault();
            const updatedUser = {
                name: document.getElementById('updateName').value,
                email: document.getElementById('updateEmail').value,
                mobile: document.getElementById('updateMobile').value,
                parentEmail: document.getElementById('updateParentEmail').value,
                parentsMobile: document.getElementById('updateParentsMobile').value,
                lastUpdate: new Date().toLocaleString() // Store the last update time
            };

            const userDocRef = doc(db, 'users', userId);
            try {
                await updateDoc(userDocRef, updatedUser);
                fetchUsers();
                document.getElementById('updateModal').style.display = 'none';
            } catch (error) {
                console.error("Error updating user:", error);
            }
        };
    }
}

// Close the modal when clicking the close button
document.getElementById('closeUpdateModal').onclick = function () {
    document.getElementById('updateModal').style.display = 'none';
};

document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = users.filter(user =>
        user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
    displayUsers(filtered);  // Re-display filtered users
});

// Call listenForUsers immediately to show the spinner on page load
window.addEventListener('load', () => {
    showSpinner(); // Show spinner when the page loads
    onAuthStateChanged(auth, (user) => {
        if (user && allowedEmails.includes(user.email.toLowerCase())) {
            listenForUsers(); // Start listening for real-time updates
        } else {
            window.location = 'https://vitadmin.easycab.site/';
        }
    });
});
