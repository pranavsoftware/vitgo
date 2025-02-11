import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, where, onSnapshot, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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

// Check user authentication and fetch user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userId = user.uid; // Get the logged-in user's ID
        const userDocRef = doc(db, "users", userId); // Reference to the user's document
        const userData = await getDoc(userDocRef); // Fetch user data

        // Set user profile picture and name
        if (userData.exists()) {
            const userProfile = userData.data();
            document.getElementById('profile-pic').src = userProfile.faceScan || '';
            document.getElementById('user-name').innerText = userProfile.name || user.email;
        } else {
            console.error("No such user document!");
        }
    } else {
        // User is not signed in, redirect to the login page
        window.location.href = "";
    }
});

// Fetch plans from Firestore with filtering and auto-deletion of expired plans
const fetchPlans = async (filters = {}) => {
    const plansContainer = document.getElementById('plans-container');
    const spinner = document.getElementById('spinner');
    const queryConstraints = [];

    // Add filters to the query
    if (filters.university && filters.university !== 'all') {
        queryConstraints.push(where("university", "==", filters.university));
    }
    if (filters.state && filters.state !== 'all') {
        queryConstraints.push(where("fromState", "==", filters.state));
    }
    if (filters.city && filters.city !== 'all') {
        queryConstraints.push(where("fromCity", "==", filters.city));
    }
    if (filters.place && filters.place !== 'all') {
        queryConstraints.push(where("fromPlace", "==", filters.place));
    }
    if (filters.date) {
        queryConstraints.push(where("dateTime", "==", filters.date));
    }

    // Create query
    const plansQuery = query(collection(db, "posts"), ...queryConstraints, orderBy("dateTime", "desc"));

    // Set up real-time listener
    onSnapshot(plansQuery, (querySnapshot) => {
        let plansHTML = '';
        const currentDate = new Date();

        querySnapshot.forEach(async (doc) => {
            const plan = doc.data();
            const planDateTime = new Date(plan.dateTime);

            // Delete expired plans
            if (planDateTime < currentDate) {
                await deleteDoc(doc.ref);
                return; // Skip rendering this expired plan
            }

            // Format the date and time
            const formattedDateTime = formatDateTime(plan.dateTime);

            plansHTML += `
    <div class="plan">
        <h4>Posted by: ${plan.username}</h4>
        <p>From: ${plan.fromPlace}, ${plan.fromCity}, ${plan.fromState}</p>
        <p>To: ${plan.toPlace}, ${plan.toCity}, ${plan.toState}</p>
        <p>Date: ${formattedDateTime.date}</p>
        <p>Time: ${formattedDateTime.time}</p>
        <p>University: ${plan.university}</p>
        <p>Message: ${plan.message}</p>
        <p>Car Type: ${plan.carType}</p>
        <p>Gender: ${plan.gender}</p>
        <p>Luggage: ${plan.luggage}</p>
        <button onclick="redirectToConnect()">Connect</button>
    </div>
`;

        });
        plansContainer.innerHTML = plansHTML;
        spinner.style.display = 'none'; // Hide spinner when data is fetched
    });

    // Function to format the date and time
    function formatDateTime(dateTimeString) {
        const dateTime = new Date(dateTimeString);

        // Format the time
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        const seconds = dateTime.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;

        // Format the date
        const day = String(dateTime.getDate()).padStart(2, '0');
        const month = String(dateTime.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = dateTime.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        return { time: formattedTime, date: formattedDate };
    }

    // Redirect function for the "Connect" button
    window.redirectToConnect = () => {
        window.location.href = '../WE/index.html';
    };
};

// Show spinner initially
const spinner = document.getElementById('spinner');
spinner.style.display = 'flex';

// Fetch plans on load
window.onload = () => {
    fetchPlans(); // Fetch all plans initially
};

// Apply filters on button click
document.getElementById('apply-filters').onclick = () => {
    const filters = {
        university: document.getElementById('university').value,
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        place: document.getElementById('place').value,
        date: document.getElementById('date').value ? new Date(document.getElementById('date').value).toISOString() : null
    };

    spinner.style.display = 'flex'; // Show spinner while fetching
    fetchPlans(filters); // Fetch plans based on filters
};

// Reset filters on button click
document.getElementById('reset-filters').onclick = () => {
    // Reset all filter inputs to their default values
    document.getElementById('university').value = 'all';
    document.getElementById('state').value = 'all';
    document.getElementById('city').value = 'all';
    document.getElementById('place').value = 'all';
    document.getElementById('date').value = '';

    spinner.style.display = 'flex'; // Show spinner while fetching
    fetchPlans(); // Fetch all plans to reset the view
};

// Logout function
const logoutUser = () => {
    signOut(auth).then(() => {
        // Redirect to login page after logout
        window.location.href = '/VITian/index.html';
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
};

// Add event listener to the Logout button
document.getElementById('logout-button').onclick = logoutUser;

