import { getFirestore, doc, collection, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
const auth = getAuth(app);

// QR Code scanning logic
const html5QrCode = new Html5Qrcode("reader");

document.getElementById('startScanBtn').addEventListener('click', startScanning);
document.getElementById('stopScanBtn').addEventListener('click', stopScanning);

let isScanning = false; // Prevent duplicate scans
let lastScannedUID = null; // Store the last scanned UID to prevent duplicates

// Notification sounds
const notificationSound = new Audio('../assets/notification-sound.mp3');
const invalidScanSound = new Audio('../assets/invalid-scan-sound.mp3');

async function startScanning() {
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            qrCodeSuccessCallback
        );
        document.getElementById('startScanBtn').style.display = 'none';
        document.getElementById('stopScanBtn').style.display = 'block';
        isScanning = true;
    } catch (err) {
        console.error("Error starting QR code scanning.", err);
    }
}

async function stopScanning() {
    try {
        await html5QrCode.stop();
        document.getElementById('stopScanBtn').style.display = 'none';
        document.getElementById('startScanBtn').style.display = 'block';
        isScanning = false;
    } catch (err) {
        console.error("Error stopping QR code scanning.", err);
    }
}

async function qrCodeSuccessCallback(decodedText, decodedResult) {
    if (!isScanning || decodedText === lastScannedUID) return;

    isScanning = false;
    lastScannedUID = decodedText;

    const uid = decodedText;
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString();
    const time = currentDate.toLocaleTimeString();

    try {
        const driverRef = doc(db, "drivers", uid);
        const driverDoc = await getDoc(driverRef);

        if (driverDoc.exists()) {
            const userRef = doc(db, "Cabin", uid);
            const logsRef = collection(userRef, "logs");

            await addDoc(logsRef, {
                uid: uid,
                date: date,
                time: time,
                status: "coming in"
            });

            notificationSound.play();

            const popup = document.getElementById('confirmation-popup');
            popup.style.display = 'block';

            setTimeout(() => {
                popup.style.display = 'none';
                isScanning = true;
            }, 3000);

            document.getElementById('scan-result').textContent = `Scanned UID: ${uid}`;
        } else {
            // Unauthorized scan - play invalid sound
            console.log("UID not found in the drivers collection. Scan ignored.");
            invalidScanSound.play();

            isScanning = true; // Re-enable scanning
        }
    } catch (err) {
        console.error("Error checking UID in drivers collection:", err);
        isScanning = true;
    }
}

function closePopup() {
    const popup = document.getElementById('confirmation-popup');
    popup.style.display = 'none';
    isScanning = true;
}

document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.querySelector("#confirmation-popup button");

    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }
});
