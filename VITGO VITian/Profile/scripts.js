import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
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
const auth = getAuth();
const db = getFirestore();

// Select elements
const profileForm = document.getElementById("profile-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const uidInput = document.getElementById("uid");
const genderSelect = document.getElementById("gender");
const hostelBlockSelect = document.getElementById("hostel-block");
const mobileInput = document.getElementById("mobile");
const parentsMobileInput = document.getElementById("parents-mobile");
const parentEmailInput = document.getElementById("parent-email");
const passwordInput = document.getElementById("password");
const profilePic = document.getElementById("profile-pic");

// Gender-based hostel selection
const menHostels = ["Men's Hostel A Block", "Men's Hostel B Annex Block", "Men's Hostel B Block", "Men's Hostel C Block", "Men's Hostel D Annex Block", "Men's Hostel D Block", "Men's Hostel E Block", "Men's Hostel F Block", "Men's Hostel G Block", "Men's Hostel H Block", "Men's Hostel I Block", "Men's Hostel J Block", "Men's Hostel K Block", "Men's Hostel L Block", "Men's Hostel M Block", "Men's Hostel N Block", "Men's Hostel O Block", "Men's Hostel P Block", "Men's Hostel Q Block", "Men's Hostel R Block", "Men's Hostel S Block", "Men's Hostel T Block", "Day Scholar"];
const womenHostels = ["Ladies' Hostel - A Block", "Ladies' Hostel - B Block", "Ladies' Hostel - C Block ", "Ladies' Hostel - D Block", "Ladies' Hostel - E Block", "Ladies' Hostel - F Block", "Ladies' Hostel - G Block", "Ladies' Hostel - H Block", "Ladies' Hostel - I Block", "Ladies' Hostel - J Block", "Ladies' Hostel - RGT Block", "Day Scholar"];

genderSelect.addEventListener("change", () => {
    hostelBlockSelect.innerHTML = ""; // Clear previous options
    const selectedGender = genderSelect.value;

    let hostels = [];
    if (selectedGender === "male") {
        hostels = menHostels;
    } else if (selectedGender === "female") {
        hostels = womenHostels;
    }

    hostels.forEach(hostel => {
        let option = document.createElement("option");
        option.value = hostel;
        option.textContent = hostel;
        hostelBlockSelect.appendChild(option);
    });
});

// Fetch user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        uidInput.value = uid;
        emailInput.value = user.email;
        nameInput.value = user.displayName || "";

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            nameInput.value = data.name || "";
            mobileInput.value = data.mobile || "";
            parentsMobileInput.value = data.parentsMobile || "";
            parentEmailInput.value = data.parentEmail || "";
            genderSelect.value = data.gender || "";
            hostelBlockSelect.value = data.hostel || "";

            // Load hostel options if gender is already set
            genderSelect.dispatchEvent(new Event("change"));

            // Set profile picture
            if (data.profilePic) {
                profilePic.src = data.profilePic;
            }
        }
    } else {
        window.location.href = '/VITian/index.html';
    }
});

// Update profile data
profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const updatedData = {
        name: nameInput.value,
        mobile: mobileInput.value,
        parentsMobile: parentsMobileInput.value,
        parentEmail: parentEmailInput.value,
        gender: genderSelect.value,
        hostel: hostelBlockSelect.value
    };

    try {
        await setDoc(userRef, updatedData, { merge: true });

        // Update password if provided
        if (passwordInput.value) {
            await updatePassword(user, passwordInput.value);
        }

        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
    }
});

// Sidebar functionality
document.getElementById("menu-btn").onclick = () => {
    document.getElementById("sidebar").classList.toggle("active");
};

document.getElementById("close-btn").onclick = () => {
    document.getElementById("sidebar").classList.remove("active");
};
