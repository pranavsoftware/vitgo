// Function to toggle the menu
function toggleMenu() {
    const menuList = document.querySelector('.menu-list');
    menuList.classList.toggle('show');
}

// Function to hide the spinner
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'none';
}

// Call hideSpinner on page load
document.addEventListener('DOMContentLoaded', () => {
    // Simulate data fetching time
    setTimeout(() => {
        hideSpinner(); // Hide spinner after 3 seconds
    }, 3000); // Adjust this time as needed
});
