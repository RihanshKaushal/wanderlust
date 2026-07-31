document.addEventListener("DOMContentLoaded", function () {
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  const priceSpans = document.querySelectorAll(".price");

  // If there are no price elements or no switch, do nothing.
  if (!taxSwitch || priceSpans.length === 0) return;

  // Store original prices
  const originalPrices = Array.from(priceSpans).map(span => {
    return parseFloat(span.dataset.price);
  });

  taxSwitch.addEventListener("change", function () {
    for (let i = 0; i < priceSpans.length; i++) {
      if (taxSwitch.checked) {
        // Calculate and display total price with 18% tax
        const totalPrice = originalPrices[i] * 1.18;
        priceSpans[i].innerText = `₹${totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        // Revert to original price
        priceSpans[i].innerText = `₹${originalPrices[i].toLocaleString("en-IN")} / night`;
      }
    }
  });
});