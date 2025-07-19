const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  // Getting the root article of this product card in which we want to delete
  const productElement = btn.closest("article");

  // Fetch is not just used for fetching data, we can actually send data with it aswell
  fetch(`/admin/product/${prodId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      // This does not work in internet explorer but in every other browser
      // productElement.remove();
      // This will work in every browser
      productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
      console.log(err);
    });
};
