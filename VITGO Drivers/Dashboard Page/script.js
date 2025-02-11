import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD_suBufBLAXzLjV0YPoIq1XU_nOVaBQ",
    authDomain: "easycab-71fcf.firebaseapp.com",
    databaseURL: "https://easycab-71fcf-default-rtdb.firebaseio.com",
    projectId: "easycab-71fcf",
    storageBucket: "easycab-71fcf.appspot.com",
    messagingSenderId: "621065707054",
    appId: "1:621065707054:web:8b47875a751d361f2e09bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Suppress console logs and errors
console.log = function () {}; // Disable console.log
console.error = function () {}; // Disable console.error

// Sidebar toggle functionality
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Get the current logged-in driver
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const driverId = user.uid; // Firestore document ID = UID
            const docRef = doc(db, "drivers", driverId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const driverData = docSnap.data();

                // Populate driver data in the dashboard
                document.getElementById('driverName').textContent = driverData.name;
                document.getElementById('driverEmail').textContent = driverData.email;
                document.getElementById('driverPhone').textContent = driverData.phone;
                document.getElementById('driverLicense').textContent = driverData.license;
                document.getElementById('taxiNumber').textContent = driverData.taxiNumber;
                document.getElementById('driverAddress').textContent = driverData.address;
                document.getElementById('driverPic').src = driverData.picUrl;

                // Generate the QR code with the full driver UID
                const qrCodeContainer = document.getElementById("qrcode");
                const qr = new QRCode(qrCodeContainer, {
                    text: driverId, // Use the full driver UID as the QR code data
                    width: 128,
                    height: 128,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                // No logs here as console.log is disabled
            }
        } catch (error) {
            // No error logs here as console.error is disabled
        }
    } else {
        // No logs here as console.log is disabled
        window.location.href = '../Login Page/index.html'; // Redirect to login page
    }
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '../Login Page/index.html';
    } catch (error) {
        // No error logs here as console.error is disabled
    }
});
