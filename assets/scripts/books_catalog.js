// books_catalog.js

// Initialize state variables
let currentPage = 1; // start on page 1
let totalPages = 0;
let products = [];
let filteredProducts = [];
let itemsPerPage = 10; // Default items per page
let columnsPerRow = 3; // Default columns per row

// DOM Elements
const productListEl = document.querySelector("#product-list");
const pageNumbersContainer = document.querySelector("#page-numbers");
const prevPageBtn = document.querySelector("#prev-page");
const nextPageBtn = document.querySelector("#next-page");
const firstPageBtn = document.querySelector("#first-page");
const lastPageBtn = document.querySelector("#last-page");
const itemsPerPageSelect = document.querySelector("#items-per-page");
const columnsPerRowSelect = document.querySelector("#columns-per-row");
const searchInput = document.querySelector("#search-bar");
const categoryFilterSelect = document.querySelector(".category-filter");
const resultSummaryEl = document.querySelector("#result-summary");
const loadingSpinner = document.querySelector("#loading-spinner");
const resetFiltersBtn = document.querySelector("#reset-filters");
const pageJumpInput = document.querySelector("#page-jump-input");

// Show loading spinner while fetching
function showLoadingSpinner() {
  loadingSpinner.style.display = "block";
}

// Hide loading spinner after fetching
function hideLoadingSpinner() {
  loadingSpinner.style.display = "none";
}

// Fetch products from JSON file
async function fetchProducts() {
  showLoadingSpinner();
  try {
    const response = await fetch('https://raw.githubusercontent.com/mohitshrestha/temp/refs/heads/main/data/updated_books.json');
    const data = await response.json();
    products = data.filter(product => product["Book Title"]);
    filteredProducts = [...products]; // Copy products to filteredProducts
    totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    populateCategoryFilter();
    loadPage(1);
  } catch (error) {
    console.error("Error fetching data:", error);
    resultSummaryEl.textContent = "Failed to load products.";
  } finally {
    hideLoadingSpinner();
  }
}

// Load products for the current page
function loadPage(page) {
  // Clamp page between 1 and totalPages
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = (currentPage - 1) * itemsPerPage;
  const end = itemsPerPage === filteredProducts.length ? filteredProducts.length : start + itemsPerPage;
  const pagedProducts = filteredProducts.slice(start, end);

  productListEl.innerHTML = ""; // Clear previous products
  pagedProducts.forEach(renderProduct);
  updatePaginationControls();
  updateResultSummary(start + 1, end, filteredProducts.length);
}

// Render a single product card from template
function renderProduct(product) {
  const template = document.querySelector("#product-template");
  const instance = template.content.cloneNode(true);

  instance.querySelector(".product-image").src = product.image || "https://placehold.co/250x300?text=No+Image+Found";
  instance.querySelector(".product-image").alt = product["Book Title"] || "Product Image";
  instance.querySelector(".product-name").textContent = product["Book Title"] || "No Name Available";
  instance.querySelector(".product-isbn").textContent = `ISBN-13: ${product["ISBN-13"] || "Not Available"}`;
  instance.querySelector(".product-category").textContent = `Category: ${product["Category"] || "Unknown"}`;
  instance.querySelector(".product-format").textContent = `Format: ${product["Format"] || "Unknown"}`;
  instance.querySelector(".product-price").textContent = `Price: ${product["Price in NPR (रु)"] || "Price not available"}`;

  productListEl.appendChild(instance);
}

// Update pagination controls (First, Previous, Next, Last + page numbers with ellipsis)
function updatePaginationControls() {
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  pageNumbersContainer.innerHTML = ""; // Clear existing page numbers

  const visiblePages = getVisiblePages(currentPage, totalPages);

  visiblePages.forEach(page => {
    if (page === '...') {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "pagination-ellipsis";
      ellipsis.style.padding = "0 5px";
      pageNumbersContainer.appendChild(ellipsis);
    } else {
      const button = document.createElement("button");
      button.textContent = page;
      button.classList.add("pagination-btn");
      if (page === currentPage) button.classList.add("active"); // Highlight current page
      button.setAttribute("aria-label", `Go to page ${page}`);
      button.onclick = () => {
        currentPage = page; // Update current page before loading
        loadPage(currentPage);
      };
      pageNumbersContainer.appendChild(button);
    }
  });

  prevPageBtn.disabled = currentPage === 1;
  firstPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  lastPageBtn.disabled = currentPage === totalPages;
}

// Generate visible pages with ellipsis
function getVisiblePages(current, total) {
  const pages = [];
  const maxVisibleButtons = 7;

  if (total <= maxVisibleButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }
  return pages;
}

// Update the results summary text
function updateResultSummary(from, to, total) {
  if (total === 0) {
    resultSummaryEl.textContent = "No results found.";
  } else {
    resultSummaryEl.textContent = `Showing ${from}–${to} of ${total} results.`;
  }
}

// Filter products based on search input
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  filteredProducts = products.filter(product => {
    return product["Book Title"].toLowerCase().includes(query) ||
           (product["ISBN-13"] && product["ISBN-13"].includes(query)) ||
           (product["Author"] && product["Author"].toLowerCase().includes(query));
  });
  currentPage = 1;
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  loadPage(currentPage);
});

// Filter products based on category selection
categoryFilterSelect.addEventListener("change", () => {
  const selectedCategory = categoryFilterSelect.value;
  filteredProducts = selectedCategory
    ? products.filter(product => product["Category"] && product["Category"].includes(selectedCategory))
    : [...products];
  currentPage = 1;
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  loadPage(currentPage);
});

// Update items per page
itemsPerPageSelect.addEventListener("change", () => {
  itemsPerPage = itemsPerPageSelect.value === "all" ? filteredProducts.length : parseInt(itemsPerPageSelect.value, 10);
  currentPage = 1;
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  loadPage(currentPage);
});

// Update columns per row layout
columnsPerRowSelect.addEventListener("change", () => {
  columnsPerRow = parseInt(columnsPerRowSelect.value, 10);
  productListEl.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;
  loadPage(currentPage);
});

// Pagination button events
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadPage(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadPage(currentPage);
  }
});

firstPageBtn.addEventListener("click", () => {
  currentPage = 1;
  loadPage(currentPage);
});

lastPageBtn.addEventListener("click", () => {
  currentPage = totalPages;
  loadPage(currentPage);
});

// Populate category filter dropdown
function populateCategoryFilter() {
  const categories = new Set();

  products.forEach(product => {
    if (product["Category"]) {
      product["Category"].split(",").forEach(category => categories.add(category.trim()));
    }
  });

  // Sort categories alphabetically
  const sortedCategories = Array.from(categories).sort();

  sortedCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterSelect.appendChild(option);
  });
}

// Keyboard navigation for pagination (left/right arrows)
document.addEventListener("keydown", (event) => {
  if (event.target === searchInput || event.target === pageJumpInput) return; // ignore typing inputs
  if (event.key === "ArrowLeft" && currentPage > 1) {
    currentPage--;
    loadPage(currentPage);
  } else if (event.key === "ArrowRight" && currentPage < totalPages) {
    currentPage++;
    loadPage(currentPage);
  }
});

// Page jump input
pageJumpInput.addEventListener("change", () => {
  const jumpToPage = parseInt(pageJumpInput.value, 10);
  if (!isNaN(jumpToPage) && jumpToPage >= 1 && jumpToPage <= totalPages) {
    currentPage = jumpToPage;
    loadPage(currentPage);
    pageJumpInput.value = ""; // clear input after jump
  }
});

// Reset filters button resets all filters to default values
resetFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilterSelect.value = "";
  itemsPerPageSelect.value = "10";
  columnsPerRowSelect.value = "3";

  itemsPerPage = 10;
  columnsPerRow = 3;
  productListEl.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;
  
  filteredProducts = [...products];
  currentPage = 1;
  totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  loadPage(currentPage);
});

// Initial grid setup and data fetch
function init() {
  productListEl.style.gridTemplateColumns = `repeat(${columnsPerRow}, 1fr)`;
  fetchProducts();
}

init();
