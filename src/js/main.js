// page elements
const body = document.body;
const sideBar = document.querySelector(".main-nav");
const appOverlay = document.querySelector(".app-overlay");
const feedSection = document.querySelector(".feed-section");
const feedProductContainer = document.querySelector(".product-container");
const indexProductContainer = document.querySelector(".new-products");

// cart elements
const cartItems = document.querySelector(".cart-content");
const cartDOM = document.querySelector(".cart-container");
const cartContainer = document.querySelector(".cart");
const orderTotal = document.querySelector(".order-total-cost");
const orderValue = document.querySelector(".order-value-cost");
const bagItems = document.querySelector(".bag-items");

// PDP elements
const swiperDOM = document.querySelector(".swiper-wrapper");
const CorePDPDetails = document.querySelector(".core-product-details");
const sizeFitDiv = document.querySelector(".size-fit");
const detailsDiv = document.querySelector(".details");
const careDiv = document.querySelector(".care");

// button elements
const menuBtn = document.querySelector(".menu-btn");
const closeBtn = document.querySelector(".close-btn");
const bagBtn = document.querySelector(".bag-btn");
const seeAllBtn = document.querySelector(".see-all-btn");
const loadMoreBtn = document.querySelector(".load-more-btn");
const addToBagBtn = document.querySelector(".add-to-bag-btn");
const checkoutBtn = document.querySelector(".checkout-btn");

// pdp detail expansion elements
const sizeFit = document.querySelector(".size-fit");
const details = document.querySelector(".details");
const care = document.querySelector(".care");

// global vars
let bagToggle = false;
let menuToggle = false;
let expandSize = false;
let expandDetails = false;
let expandCare = false;

// vars
let products = []
let bag = []
let productsEndpoint = './assets/data/products.json'
let swiper; // swiper js pdp gallery

// get params from URL
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

// get current URL
const getCurrentURL = () => {
    return window.location.href;
}

// get products
const getProducts = async (contentToFetch) => {
    // maybe have some check to ensure new content hasn't dropped? If so, want to 
    // force a fetch

    // try to get products from storage
    const localProducts = getProductsFromStorage(contentToFetch);

    if (localProducts) {
        products = [...localProducts];
        return;
    }

    // if products aren't in local storage, get from server
    try {
        let result = await fetch(productsEndpoint);
        let data = await result.json();
        let selectedData = data[`${contentToFetch}`];

        // destructure products
        products = selectedData.map(item => {
            const { title, price, description, care, sizeFit, details } = item.fields;
            const { id } = item.sys;
            const images = item.fields.image.fields;
            let finalImageObject = {};
            Object.keys(images).forEach(key => {
                finalImageObject[key] = images[key].url;
            })

            return { title, price, id, description, care, sizeFit, details, images: finalImageObject };
        })

        // console.log("products", products)
        saveProductsToStorage(contentToFetch, products);
    }
    catch (err) {
        // console.log("error fetching data:", err);
    }
}

const getSingleProduct = async (id) => {
    // eventually be replaced by API call
    // try to get product from storage
    const localProduct = getProductFromStorage(id);

    if (localProduct) {
        return localProduct;
    }

    // get single product from server if not in local storage
    try {
        let result = await fetch(productsEndpoint);
        let data = await result.json();
        let selectedData = data["all-products"];

        // destructure products
        const allProducts = selectedData.map(item => {
            const { title, price, description, care, sizeFit, details } = item.fields;
            const { id } = item.sys;
            const images = item.fields.image.fields;
            let finalImageObject = {};
            Object.keys(images).forEach(key => {
                finalImageObject[key] = images[key].url;
            })

            return { title, price, id, description, care, sizeFit, details, images: finalImageObject };
        })

        const singleProduct = allProducts.find(product => product.id === id);
        saveProductToStorage(singleProduct);
        return singleProduct;
    }
    catch (err) {
        // console.log("error fetching data:", err);
    }
}

// Storage
const saveProductsToStorage = (productType, products) => {
    sessionStorage.setItem(productType, JSON.stringify(products));
}

const saveProductToStorage = (product) => {
    sessionStorage.setItem("product", JSON.stringify(product));
}

const getProductsFromStorage = (productType) => {
    return JSON.parse(sessionStorage.getItem(productType));
}

const getProductFromStorage = (id) => {
    let product = JSON.parse(sessionStorage.getItem("product"));
    return product?.id === id ? product : undefined;
}

const saveBag = (bag) => {
    localStorage.setItem("bag", JSON.stringify(bag));
}

const getBag = () => {
    return localStorage.getItem("bag") ? JSON.parse(localStorage.getItem("bag")) : [];
}

const renderProducts = (products, parentContainer) => {
    // console.log("render products", products);

    // create html for each product
    const productElements = products.map(product => {
        const article = document.createElement('article');

        article.style.cursor = "pointer";

        // add on click event
        article.addEventListener('click', () => {
            clickSingleProduct(product);
        })

        // add html
        const image = document.createElement('img');
        image.src = `${product.images["image-1"]}`;
        const h3 = document.createElement('h3');
        h3.textContent = `${product.title}`;
        const h4 = document.createElement('h4');
        h4.textContent = `${product.price}`;
        article.append(image, h3, h4);

        return article;
    })

    // add product elements to productContainer
    parentContainer.append(...productElements);
}

const renderPDPProduct = (product, parentContainer) => {
    // set swiper images
    setSwiperImages(product);
    // Above the fold product details
    const productTitle = document.createElement('h1');
    productTitle.textContent = product.title;
    const price = document.createElement("h2");
    price.textContent = `$${product.price}`;
    const description = document.createElement('p');
    description.textContent = product.description;
    description.classList.add("product-desc");

    CorePDPDetails.append(productTitle, price, description);

    // size-fit, details, care
    const sizePar = document.createElement('p');
    sizePar.textContent = product.sizeFit;
    sizeFitDiv.append(sizePar);
    const detailsPar = document.createElement('p');
    detailsPar.textContent = product.details;
    detailsDiv.append(detailsPar);
    const carePar = document.createElement('p');
    carePar.textContent = product.care;
    careDiv.append(carePar);
}

const setSwiperImages = (product) => {
    for (let i = 0; i < Object.keys(product.images).length; i++) {
        let article = document.createElement('article');
        article.classList.add("swiper-slide");
        let div = document.createElement('div');
        div.classList.add("image");
        let image = document.createElement('img');
        image.src = product.images[`image-${i + 1}`];

        div.append(image);
        article.append(div);
        swiperDOM.append(article);
    }
}

const clickSingleProduct = (product) => {
    // store product in localStorage
    saveProductToStorage(product);
    // redirect to pdp
    window.location.href = `./pdp.html?product=${product.id}`;

}


const expandDiv = (expandDiv, toggle) => {
    expandDiv.style.height = `${expandDiv.scrollHeight}px`;
    toggle.textContent = "-"
}

const minimizeDiv = (minimizeDiv, toggle, newHeight) => {
    minimizeDiv.style.height = `${newHeight.scrollHeight}px`;
    toggle.textContent = "+"
}

const showMenu = () => {
    if (bagToggle) {
        hideBag();
    }
    sideBar.classList.add('showSideBar')
    menuBtn.style.display = "none";
    closeBtn.style.display = "inline-block";
    body.classList.add('no-scroll');
    appOverlay.classList.add('transparentBkg');
    menuToggle = true;
}

const closeMenu = () => {
    menuToggle = false;
    sideBar.classList.remove('showSideBar');
    menuBtn.style.display = "inline-block";
    closeBtn.style.display = "none";
    body.classList.remove('no-scroll');
    appOverlay.classList.remove('transparentBkg');

}

const hideBag = () => {
    cartItems.scrollTop = 0;
    appOverlay.classList.remove('transparentBkg');
    cartDOM.classList.remove('showCart');
    body.classList.remove('no-scroll');
    bagToggle = false;
}

const showBag = () => {
    if (menuToggle) {
        closeMenu();
    }
    appOverlay.classList.add('transparentBkg');
    body.classList.add('no-scroll');
    cartDOM.classList.add('showCart');

    // if the page is greater than 1300px, we want to 
    // position the cart within the 1300px viewport to 
    // keep things contained.
    // We divide by 2 since the content is centered.
    if (body.scrollWidth > 1300) {
        const diff = body.scrollWidth - 1300;
        cartContainer.style.marginRight = `${diff / 2}px`;
    } else {
        cartContainer.style.marginRight = "0rem";
    }

    bagToggle = true;
}

const setBagValues = (bag) => {
    let tempTotal = 0;
    let itemsTotal = 0;
    bag.map(item => {
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
    })

    orderTotal.textContent = parseFloat(tempTotal.toFixed(2));
    orderValue.textContent = parseFloat(tempTotal.toFixed(2));
    bagItems.textContent = itemsTotal;
}

const populateBag = (bag) => {
    if (bag.length) {
        bag.forEach(item => {
            addBagItem(item);
        })
    }
}

const removeItem = (id) => {
    // remove item from bag and update local storage
    bag = bag.filter(item => item.id !== id);
    setBagValues(bag);
    saveBag(bag);
}

const addBagItem = (item) => {
    const div = document.createElement('div');
    div.classList.add("cart-item");
    div.innerHTML = `
        <img class="product" src=${item.images["image-1"]} alt="vintage-jacket">
        <div>
            <p>${item.title}</p>
            <p>${item.price}</p>
        </div>
        <div class="item-edit">
            <img class="remove-item" src="./assets/icons/exit.svg" data-id=${item.id} alt="delete">
            <div class="item-counter">
                <img class="decrement-item" src="./assets/icons/decrement.svg" data-id=${item.id} alt="decrement item">
                <p class="item-amount" data-id=${item.id}>${item.amount}</p>
                <img class="increment-item" src="./assets/icons/increment.svg" data-id=${item.id} alt="increment item">
            </div>
        </div>
    `;

    // add to cartItems
    cartItems.append(div);

    // user should be able to navigate to PDP of bag items
    const divImg = div.querySelector(".product");
    divImg.style.cursor = "pointer";
    divImg.addEventListener('click', () => {
        window.location.href = `./pdp.html?product=${item.id}`;
    })
}

const incrementBagItem = (id) => {
    const itemAmount = document.querySelector(`p[class=item-amount][data-id="${id}"]`);
    let currentVal = Number(itemAmount.textContent);
    currentVal += 1;
    itemAmount.textContent = currentVal;

}

// initializes variables and event listners for
// index page
const p_indexSetUp = async () => {
    await getProducts("new-arrivals");
    renderProducts(products, indexProductContainer);
}

// initializes feed content according to the page
const p_feedSetUp = async () => {
    // set header to whatever the params are
    const feedH1 = feedSection.firstElementChild;
    params.content === "all-products"
        ? feedH1.textContent = "All Products"
        : params.content === "80s-collection"
            ? feedH1.textContent = "80s Collection"
            : feedH1.textContent = "New Arrivals"
        ;

    // get products that match url params
    await getProducts(params.content);
    renderProducts(products, feedProductContainer);
}

// initializes pdp
const p_pdpSetUp = async () => {

    // initialize image swiper
    swiper = new Swiper('.swiper', {
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    const pageProduct = await getSingleProduct(params.product);

    // render product
    renderPDPProduct(pageProduct);

    // add data-id to button
    addToBagBtn.dataset.id = pageProduct.id;

    // add event listeners for the product details so they can expand/diplay info
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
        expandDetails = !expandDetails;

        // get DOM elements
        const headerHeight = details.querySelector(".expandable-header");
        const toggleIcon = details.querySelector(".expand");

        if (expandDetails) {
            expandDiv(details, toggleIcon);
        } else {
            minimizeDiv(details, toggleIcon, headerHeight);
        }
    })
    care.addEventListener("click", () => {
        // toggle expansion
        expandCare = !expandCare;

        // get DOM elements
        const headerHeight = care.querySelector(".expandable-header");
        const toggleIcon = care.querySelector(".expand");

        if (expandCare) {
            expandDiv(care, toggleIcon);
        } else {
            minimizeDiv(care, toggleIcon, headerHeight);
        }
    })

    // add event listener for the add to bag button
    addToBagBtn.addEventListener("click", () => {
        let id = addToBagBtn.dataset.id;

        // see if item from this page is in bag already
        let bagItem = bag.find(item => item.id === id);
        // if it is, remove the item from the bag and increment the amount
        if (bagItem) {
            bag = bag.filter(item => item.id !== bagItem.id);
            bagItem.amount += 1;
        } else {
            // if the item is not in the bag, get the page item and add the amount field
            bagItem = { ...pageProduct, amount: 1 };
        }

        // add bagItem with updated amount to bag
        bag = [...bag, bagItem];

        // save new cart in localStorage
        saveBag(bag);
        // set cart values
        setBagValues(bag);
        // display cart items
        // if the bagItem amount is 1, we just added the first instance to the cart,
        // so we add the bag item to the cart container
        if (bagItem.amount === 1) {
            addBagItem(bagItem);
        } else {
            // otherwise, we are incrementing the amount of an existing bagitem
            incrementBagItem(bagItem.id);
        }
    })
}

const menuSetup = () => {
    // open sidebar
    menuBtn.addEventListener('click', () => {
        showMenu();
    });

    // close sidebar
    closeBtn.addEventListener('click', () => {
        closeMenu();
    })

    // if user resizes window beyond tablet breakpoint, close menu and hide buttons
    window.addEventListener('resize', () => {
        if (body.clientWidth >= 1024) {
            closeMenu();
            menuBtn.style.display = 'none';
            closeBtn.style.display = 'none';
        } else {
            if (menuToggle) {
                showMenu()
            } else {
                closeMenu();
            }
        }
    })
}

const bagSetup = () => {
    // retrieve values from local storage
    bag = getBag();
    // set cart values for totals
    setBagValues(bag);
    // add indivudual items to cart
    populateBag(bag);
    // set up bag events
    setUpBagEvents();
    // toggle bag display
    bagBtn.addEventListener('click', () => {
        if (!bagToggle) {
            showBag();
        } else {
            hideBag();
        }
    })

    // sometimes if user zooms out enough while bag is opened,
    // the overlay and body scroll reset
    window.addEventListener('touchend', () => {
        if (bagToggle) {
            appOverlay.classList.add('transparentBkg');
            body.classList.add('no-scroll');
        }
    })
}

const setUpBagEvents = () => {
    cartItems.addEventListener('click', event => {
        if (event.target.classList.contains('remove-item')) {
            let deletedItem = event.target;
            let id = deletedItem.dataset.id;
            cartItems.removeChild(deletedItem.parentElement.parentElement);
            removeItem(id);
            saveBag(bag);
        } else if (event.target.classList.contains('increment-item')) {
            // grab element id
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = bag.find(item => item.id === id);
            // update item amount
            tempItem.amount = tempItem.amount + 1;

            // save new cart into local storage
            saveBag(bag);
            // update cart values
            setBagValues(bag);
            // update product value in DOM
            addAmount.previousElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains('decrement-item')) {
            // grab element id
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = bag.find(item => item.id === id);
            // update item amount
            tempItem.amount = tempItem.amount - 1;
            if (tempItem.amount) {
                // save new cart into local storage
                saveBag(bag);
                // update cart values
                setBagValues(bag);
                // update product value in DOM
                lowerAmount.nextElementSibling.innerText = tempItem.amount;
            } else {
                cartItems.removeChild(lowerAmount.parentElement.parentElement.parentElement);
                removeItem(id);
            }
        }
    })

    checkoutBtn.addEventListener('click', () => {
        window.location.href = "./end.html";
    })
}

const appSetup = () => {
    // global menu setup
    menuSetup();

    // global bag setup
    bagSetup();

    // toggle app Overlay
    appOverlay.addEventListener('click', () => {
        if (bagToggle) {
            hideBag();
        }
        if (menuToggle) {
            closeMenu();
        }
    })

    // if we resize the window and the bag is open, hide the bag
    window.addEventListener('resize', () => {
        if (bagToggle) {
            hideBag();
        }
    })

    // PAGE SPECIFIC
    // INDEX/HOME
    if (document.location.pathname.includes("index")) {
        seeAllBtn.addEventListener("click", () => {
            window.location.href = "./feed.html?content=new-arrivals";
        })
        p_indexSetUp();
    }

    // FEED
    if (document.location.pathname.includes("feed")) {
        p_feedSetUp();
    }

    // PDP
    if (document.location.pathname.includes("pdp")) {
        p_pdpSetUp();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    appSetup();
})



