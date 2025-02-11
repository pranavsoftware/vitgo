// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, getDoc, collection, setDoc, query, where, onSnapshot, addDoc, doc, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
const auth = getAuth();
const db = getFirestore();

// Elements
const allUsersList = document.getElementById('all-users-list');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const bellBtn = document.getElementById('bell-btn'); // Notification bell button
const notificationDropdown = document.getElementById('notification-dropdown');
const signoutBtn = document.getElementById('signout-btn');
const searchBar = document.getElementById('search-bar');
const goBackBtn = document.getElementById('go-back-btn'); // Go Back button

let currentUserId; // Variable to hold the current user ID
let currentChatUser; // Variable to hold the current chat user ID

// Authentication listener
onAuthStateChanged(auth, user => {
    if (user) {
        currentUserId = user.uid; // Store current user ID
        loadUsers(user);
        loadNotifications(user);
    } else {
        // Redirect to login if not authenticated
        window.location.href = '/VITian/index.html';
    }
});


// Go Back button functionality
goBackBtn.addEventListener('click', () => {
    // Option 1: Navigate to the previous page in history
    if (document.referrer !== "") {
        window.history.back();
    } else {
        // Option 2: If there's no referrer, navigate to a specific page (e.g., home page)
        window.location.href = '../Dashboard/dashboard.html'; // Replace with your desired URL
    }
});

// Load all users and display them
async function loadUsers(currentUser) {
    const usersQuery = collection(db, 'users');
    onSnapshot(usersQuery, snapshot => {
        allUsersList.innerHTML = ''; // Clear existing users
        snapshot.forEach(async docSnapshot => {
            const userData = docSnapshot.data();
            if (userData.email !== currentUser.email) { // Exclude the current user
                const li = document.createElement('li');
                li.dataset.uid = docSnapshot.id; // Store UID in the list item

                // Add user profile picture and name
                const img = document.createElement('img');
                img.src = userData.faceScan || '../assets/default Avatar .jpg'; // Use faceScan as profile picture or fallback to default
                img.alt = userData.name || "No Name"; // Use name as alt text
                img.classList.add('user-profile-pic');

                const name = document.createElement('span');
                name.textContent = userData.name || "No Name"; // Display user name

                const actionButton = document.createElement('button');
                actionButton.textContent = 'Send Friend Request';
                actionButton.classList.add('action-btn');

                // Check friendship status
                const friendDocRef = doc(db, 'friendships', `${currentUser.uid}_${docSnapshot.id}`);
                const friendDoc = await getDoc(friendDocRef);
                if (friendDoc.exists()) {
                    actionButton.textContent = 'Message'; // Change button to Message if already friends
                    actionButton.classList.add('message-btn'); // Add a class for easier selection
                }

                actionButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent selecting the user for chat when clicking the button
                    if (friendDoc.exists()) {
                        selectFriendForChat(docSnapshot.id); // Select this user for chat
                    } else {
                        await sendFriendRequest(currentUser.uid, docSnapshot.id);
                    }
                });

                // Click on the list item to select for chat
                li.addEventListener('click', () => {
                    if (friendDoc.exists()) {
                        selectFriendForChat(docSnapshot.id); // Select this user for chat
                    }
                });

                li.appendChild(img);
                li.appendChild(name);
                li.appendChild(actionButton);
                allUsersList.appendChild(li);
            }
        });
    });
}


// Search functionality for users
searchBar.addEventListener('input', () => {
    const query = searchBar.value.toLowerCase();
    const users = allUsersList.getElementsByTagName('li');
    Array.from(users).forEach(user => {
        const name = user.querySelector('span').textContent.toLowerCase();
        if (name.includes(query)) {
            user.style.display = 'flex';
        } else {
            user.style.display = 'none';
        }
    });
});

// Send a friend request to another user
async function sendFriendRequest(fromUid, toUid) {
    if (!toUid) {
        console.error("toUid is undefined");
        return; // Exit the function if toUid is not defined
    }

    await setDoc(doc(db, 'friendRequests', `${fromUid}_${toUid}`), {
        fromUid,
        toUid,
        status: 'pending',
        timestamp: Timestamp.now() // Add timestamp to the friend request
    });
    alert('Friend request sent');

 // Call backend to send an email notification
 fetch("http://localhost:5500/send-friend-request", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ senderId: fromUid, receiverId: toUid }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error("Error sending email:", error));

alert('Friend request sent');
}

// Load notifications for friend requests
async function loadNotifications(currentUser) {
    const notificationsQuery = query(
        collection(db, 'friendRequests'), 
        where('toUid', '==', currentUser.uid), 
        where('status', '==', 'pending')
    );
    onSnapshot(notificationsQuery, snapshot => {
        const count = snapshot.size;
        if (count > 0) {
            bellBtn.setAttribute('data-count', count);
        } else {
            bellBtn.removeAttribute('data-count');
        }

        notificationDropdown.innerHTML = '';
        snapshot.forEach(async docSnapshot => {
            const requestData = docSnapshot.data();
            const senderDoc = await getDoc(doc(db, 'users', requestData.fromUid)); // Get sender's user data
            const senderData = senderDoc.data();
            
            // Create notification container
            const notificationDiv = document.createElement('div');
            notificationDiv.classList.add('notification-item');

            // Sender's profile picture
            const senderImg = document.createElement('img');
            senderImg.src = senderData.faceScan || '../assets/default Avatar .jpg';
            senderImg.alt = senderData.name;
            senderImg.classList.add('user-profile-pic');

            // Notification content
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('notification-content');

            const senderName = document.createElement('span');
            senderName.textContent = senderData.name;

            const requestText = document.createElement('span');
            requestText.textContent = " sent you a friend request.";

            const timeStamp = requestData.timestamp
                ? new Date(requestData.timestamp.seconds * 1000).toLocaleString()
                : '';

            const timeSpan = document.createElement('small');
            timeSpan.textContent = timeStamp;

            contentDiv.appendChild(senderName);
            contentDiv.appendChild(requestText);
            contentDiv.appendChild(document.createElement('br'));
            contentDiv.appendChild(timeSpan);

            // Accept button
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.classList.add('accept-btn');
            acceptButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering other click events
                acceptFriendRequest(requestData);
            });

            // Decline button (optional)
            const declineButton = document.createElement('button');
            declineButton.textContent = 'Decline';
            declineButton.classList.add('decline-btn');
            declineButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering other click events
                declineFriendRequest(requestData);
            });

            // Append all elements to notificationDiv
            notificationDiv.appendChild(senderImg);
            notificationDiv.appendChild(contentDiv);
            notificationDiv.appendChild(acceptButton);
            notificationDiv.appendChild(declineButton);

            notificationDropdown.appendChild(notificationDiv);
        });
    });
}

// Accept a friend request
async function acceptFriendRequest(requestData) {
    await setDoc(doc(db, 'friendships', `${requestData.fromUid}_${requestData.toUid}`), {
        users: [requestData.fromUid, requestData.toUid],
        status: 'accepted',
        timestamp: Timestamp.now() // Optionally add timestamp for when friendship was established
    });
    await setDoc(doc(db, 'friendRequests', `${requestData.fromUid}_${requestData.toUid}`), {
        ...requestData,
        status: 'accepted',
        acceptedAt: Timestamp.now() // Optionally add timestamp for acceptance
    });

    const friendItem = allUsersList.querySelector(`li[data-uid="${requestData.fromUid}"]`);
    if (friendItem) {
        const actionButton = friendItem.querySelector('button');
        actionButton.textContent = 'Message';
        actionButton.classList.add('message-btn');
    }

    alert('Friend request accepted');
    location.reload(); // Refresh the page after accepting a friend request
}

// Decline a friend request (optional)
async function declineFriendRequest(requestData) {
    await setDoc(doc(db, 'friendRequests', `${requestData.fromUid}_${requestData.toUid}`), {
        ...requestData,
        status: 'declined',
        declinedAt: Timestamp.now() // Optionally add timestamp for decline
    });

    // Optionally, remove the notification from the UI
    loadNotifications(auth.currentUser); // Refresh notifications

    alert('Friend request declined');
    location.reload(); // Refresh the page after accepting a friend request
}

// Select friend for messaging
function selectFriendForChat(friendUid) {
    currentChatUser = friendUid; // Set the current chat user
    const selectedFriendItem = allUsersList.querySelector(`li[data-uid="${friendUid}"]`);

    // Highlight the selected friend
    allUsersList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
    if (selectedFriendItem) {
        selectedFriendItem.classList.add('selected'); // Highlight the selected friend
    }

    // Load the chat with the selected friend
    loadChat(auth.currentUser.uid, friendUid);
}

// Load chat messages between the current user and a selected friend
async function loadChat(userUid, friendUid) {
    const chatId = userUid > friendUid ? `${userUid}_${friendUid}` : `${friendUid}_${userUid}`; // Consistent chatId
    const chatQuery = query(
        collection(db, 'chats', chatId, 'messages'), 
        orderBy('dateTime', 'asc') // Sort messages by time
    );

    chatBox.innerHTML = ''; // Clear chat box before loading new chat

    onSnapshot(chatQuery, snapshot => {
        chatBox.innerHTML = ''; // Clear existing messages
        snapshot.forEach(docSnapshot => {
            const messageData = docSnapshot.data();
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');

            const timeStamp = new Date(messageData.dateTime.seconds * 1000); // Convert Firestore timestamp
            const formattedDateTime = timeStamp.toLocaleString(); // Format the date and time

            if (messageData.sender === auth.currentUser.displayName) {
                messageDiv.classList.add('sent');
                messageDiv.innerHTML = `<strong>You:</strong> ${messageData.message} <br><small>${formattedDateTime}</small>`;
            } else {
                messageDiv.classList.add('received');
                messageDiv.innerHTML = `<strong>${messageData.sender}:</strong> ${messageData.message} <br><small>${formattedDateTime}</small>`;
            }

            chatBox.appendChild(messageDiv);
        });
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom after loading
    });
}

// Send a message in the chat
sendMessageBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    const selectedFriend = allUsersList.querySelector('li.selected');
    const friendUid = selectedFriend ? selectedFriend.dataset.uid : null;

    if (!friendUid) {
        alert('Please select a friend to chat with.');
        return;
    }

    if (!message) {
        alert('Please enter a message.');
        return;
    }

    const chatId = auth.currentUser.uid > friendUid ? `${auth.currentUser.uid}_${friendUid}` : `${friendUid}_${auth.currentUser.uid}`;

    try {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            sender: auth.currentUser.displayName,
            message,
            dateTime: Timestamp.now(),
        });
        messageInput.value = ''; // Clear the input field
    } catch (error) {
        console.error('Error sending message: ', error);
    }
});

// Notification dropdown toggle functionality
bellBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the window
    // Toggle the display of the notification dropdown
    if (notificationDropdown.style.display === 'block') {
        notificationDropdown.style.display = 'none';
    } else {
        notificationDropdown.style.display = 'block';
    }
});

// Hide the dropdown if clicked outside
window.addEventListener('click', (event) => {
    if (!notificationDropdown.contains(event.target) && !bellBtn.contains(event.target)) {
        notificationDropdown.style.display = 'none'; // Hide the dropdown if clicked outside
    }
});