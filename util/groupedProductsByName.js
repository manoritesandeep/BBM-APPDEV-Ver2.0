export function groupProductsByName(products) {
  const grouped = {};
  products.forEach((product) => {
    if (!grouped[product.productName]) {
      grouped[product.productName] = [];
    }
    grouped[product.productName].push(product);
  });
  return Object.values(grouped);
}
