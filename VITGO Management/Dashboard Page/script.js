import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const db = getFirestore(app);

// HTML elements
const employeeNameElement = document.getElementById("employeeName");
const profilePicElement = document.getElementById("profilePic");
const logoutButton = document.getElementById("logoutButton");
const noticeBoard = document.getElementById("noticeBoard");

// Function to fetch employee data
async function fetchEmployeeData(userId) {
    try {
        const employeeRef = doc(db, "TAXIemployee", userId);
        console.log(`Fetching employee data from: TAXIemployee/${userId}`);
        const employeeSnap = await getDoc(employeeRef);

        if (employeeSnap.exists()) {
            const employeeData = employeeSnap.data();
            // Set employee name and profile picture
            employeeNameElement.textContent = employeeData.name || "Unknown Employee";
            profilePicElement.src = employeeData.profilePic || "default-profile-pic.png";
            console.log("Employee data successfully retrieved:", employeeData);
        } else {
            console.error(`Employee data not found for user ID: ${userId}`);
            employeeNameElement.textContent = "Employee data not found.";
            profilePicElement.src = "default-profile-pic.png"; // Fallback image
        }
    } catch (error) {
        console.error("Error fetching employee data:", error);
    }
}

// Function to fetch notices
function fetchNotices() {
    onSnapshot(collection(db, "VITian Notice"), (snapshot) => {
        noticeBoard.innerHTML = ""; // Clear previous notices

        snapshot.forEach((doc) => {
            const noticeData = doc.data();
            const notice = document.createElement("div");
            notice.className = "notice";

            // Create notice content
            const title = document.createElement("h3");
            title.textContent = noticeData.title || "No Title Available";
            notice.appendChild(title);

            const content = document.createElement("p");
            content.textContent = noticeData.content || "No content available";
            notice.appendChild(content);

            const postedBy = document.createElement("p");
            postedBy.textContent = `Posted by: ${noticeData.postedBy || "Unknown"}`;
            postedBy.className = "postedBy";
            notice.appendChild(postedBy);

            const createdAt = document.createElement("p");
            const date = noticeData.createdAt ? noticeData.createdAt.toDate().toLocaleString() : "Date not available";
            createdAt.textContent = `Posted on: ${date}`;
            createdAt.className = "createdAt";
            notice.appendChild(createdAt);

            noticeBoard.appendChild(notice);
        });
    }, (error) => {
        console.error("Error fetching notices:", error);
    });
}

// Function to handle user authentication state and check email domain
function handleAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Check if the email domain matches "@emp-easycab.site"
            const emailDomain = user.email.split('@')[1];
            if (emailDomain === "emp-easycab.site") {
                // User is authorized, fetch their data and notices
                console.log(`Authorized user ID: ${user.uid}`);
                fetchEmployeeData(user.uid);
                fetchNotices();
            } else {
                // Unauthorized domain, redirect to login
                console.error("Unauthorized access attempt.");
                window.location.href = "../Login Page/index.html";
            }
        } else {
            // Redirect to login page if not authenticated
            window.location.href = "../Login Page/index.html";
        }
    });
}

// Logout functionality
logoutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "../Login Page/index.html"; // Redirect to login after logging out
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
});

// Initialize app
handleAuthState();

// Check if the user is authorized
const checkAuthorization = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Verify email domain
            const emailDomain = user.email.split("@")[1];
            if (emailDomain !== "emp-easycab.site") {
                console.error("Unauthorized access attempt.");
                window.location.href = "../Login Page/index.html";
            } else {
                fetchBookings(); // Fetch bookings only if authorized
            }
        } else {
            // Redirect to login if no user is authenticated
            window.location.href = "../Login Page/index.html";
        }
    });
};

// Initialize authorization check
checkAuthorization();
