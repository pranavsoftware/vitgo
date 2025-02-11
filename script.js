// Function to toggle the mobile menu
function toggleMenu() {
  const menuList = document.querySelector('.menu-list');
  const header = document.querySelector('.transparent-header');

  if (!menuList || !header) return; // Safety check

  // Toggle the 'menu-open' class
  header.classList.toggle('menu-open');
  menuList.classList.toggle('active');

  if (menuList.classList.contains('active')) {
      menuList.style.display = 'flex';
      requestAnimationFrame(() => {
          menuList.style.opacity = '1';
          menuList.style.transform = 'translateX(0)';
      });
  } else {
      menuList.style.opacity = '0';
      menuList.style.transform = 'translateX(100%)';
      setTimeout(() => {
          menuList.style.display = 'none';
      }, 300); // Matches CSS transition duration
  }
}

// Manage review functionality
let currentReview = 0;
const reviews = document.querySelectorAll('.review');

function changeReview(direction) {
  if (!reviews.length) return; // Safety check

  reviews[currentReview].classList.remove('active');
  currentReview = (currentReview + direction + reviews.length) % reviews.length;
  reviews[currentReview].classList.add('active');
}

function autoChangeReview() {
  if (reviews.length > 1) {
      setInterval(() => changeReview(1), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menuList = document.querySelector('.menu-list');
  const header = document.querySelector('.transparent-header');

  if (menuToggle && menuList && header) {
      menuToggle.addEventListener('click', toggleMenu);

      // Close the menu when clicking outside
      document.addEventListener('click', (event) => {
          if (!menuToggle.contains(event.target) && !menuList.contains(event.target)) {
              menuList.classList.remove('active');
              header.classList.remove('menu-open');
              menuList.style.opacity = '0';
              menuList.style.transform = 'translateX(100%)';
              setTimeout(() => (menuList.style.display = 'none'), 300);
          }
      });
  }

  autoChangeReview();
});
