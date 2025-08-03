const productTemplate = document.querySelector("#product-template");
const productContainer = document.querySelector("#product-list");

const products = [
    { name: "Product 1", description: "Description 1", price: "$10", imageUrl: "https://m.media-amazon.com/images/I/71lJBs5MNlL._SL1500_.jpg" },
    { name: "Product 2", description: "Description 2", price: "$20", imageUrl: "https://m.media-amazon.com/images/I/61wNePIM8kL._SL1500_.jpg" },
    { name: "Product 3", description: "Description 2", price: "$20", imageUrl: "" },
]

products.forEach(product => {
    const instance = productTemplate.content.cloneNode(true);
    instance.querySelector(".product-image").src = product.imageUrl;
    instance.querySelector(".product-name").textContent = product.name;
    instance.querySelector(".product-description").textContent = product.description;
    instance.querySelector(".product-price").textContent = product.price;
    productContainer.appendChild(instance);
});



