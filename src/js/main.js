// swiper js pdp gallery
let swiper;

if (document.location.pathname === "/src/pdp.html") {
    swiper = new Swiper('.swiper', {
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
        },
    });
}


// open & close side bar

// page elements
const sideBar = document.querySelector(".main-nav");
const cartDOM = document.querySelector(".cart-container");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-content");
const body = document.body;

// buttons
const menuBtn = document.querySelector(".menu-btn");
const closeBtn = document.querySelector(".close-btn");
const bagBtn = document.querySelector(".bag-btn");
const seeAllBtn = document.querySelector(".see-all-btn");
const loadMoreBtn = document.querySelector(".load-more-btn");

// pdp detail expansion
const sizeFit = document.querySelector(".size-fit");
const details = document.querySelector(".details");
const care = document.querySelector(".care");

// global vars
let bagToggle = false;
let expandSize = false;
let expandDetails = false;
let expandCare = false;


const expandDiv = (expandDiv, toggle) => {
    expandDiv.style.height = `${expandDiv.scrollHeight}px`;
    toggle.textContent = "-"
}

const minimizeDiv = (minimizeDiv, toggle, newHeight) => {
    minimizeDiv.style.height = `${newHeight.scrollHeight}px`;
    toggle.textContent = "+"
}


const appSetup = () => {
    // open sidebar
    menuBtn.addEventListener('click', () => {
        sideBar.classList.add('showSideBar')
        menuBtn.style.display = "none";
        closeBtn.style.display = "inline-block";
        body.classList.add('no-scroll');
        bagBtn.disabled = true;
    })

    // close sidebar
    closeBtn.addEventListener('click', () => {
        sideBar.classList.remove('showSideBar');
        menuBtn.style.display = "inline-block";
        closeBtn.style.display = "none";
        body.classList.remove('no-scroll');
        bagBtn.disabled = false;
    })

    // toggle bag display
    bagBtn.addEventListener('click', () => {
        if (bagToggle) {
            cartItems.scrollTop = 0;
            cartOverlay.classList.remove('transparentBkg');
            cartDOM.classList.remove('showCart');
            body.classList.remove('no-scroll');
            bagToggle = !bagToggle;


        } else {
            cartOverlay.classList.add('transparentBkg');
            cartDOM.classList.add('showCart');
            body.classList.add('no-scroll');
            bagToggle = !bagToggle;
        }
    })

    // toggle cart Overlay
    cartOverlay.addEventListener('click', () => {
        if (bagToggle) {
            cartItems.scrollTop = 0;
            cartOverlay.classList.remove('transparentBkg');
            cartDOM.classList.remove('showCart');
            body.classList.remove('no-scroll');
            bagToggle = !bagToggle;
        }
    })

    if (document.location.pathname === "/src/index.html") {
        seeAllBtn.addEventListener("click", () => {
            window.location.href = "http://localhost:5500/src/feed.html";
        })
    }

    if (document.location.pathname === "/src/pdp.html") {
        sizeFit.addEventListener("click", () => {
            // toggle expansion
            expandSize = !expandSize;

            // get DOM elements
            const headerHeight = sizeFit.querySelector(".expandable-header");
            const toggleIcon = sizeFit.querySelector(".expand");

            if (expandSize) {
                expandDiv(sizeFit, toggleIcon);
            } else {
                minimizeDiv(sizeFit, toggleIcon, headerHeight);
            }

        })
        details.addEventListener("click", () => {
            // toggle expansion
            expandSize = !expandSize;

            // get DOM elements
            const headerHeight = details.querySelector(".expandable-header");
            const toggleIcon = details.querySelector(".expand");

            if (expandSize) {
                expandDiv(details, toggleIcon);
            } else {
                minimizeDiv(details, toggleIcon, headerHeight);
            }
        })
        care.addEventListener("click", () => {
            // toggle expansion
            expandSize = !expandSize;

            // get DOM elements
            const headerHeight = care.querySelector(".expandable-header");
            const toggleIcon = care.querySelector(".expand");

            if (expandSize) {
                expandDiv(care, toggleIcon);
            } else {
                minimizeDiv(care, toggleIcon, headerHeight);
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    appSetup();
})



