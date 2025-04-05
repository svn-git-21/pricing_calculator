const date = document.getElementById("date");
date.textContent = new Date().toLocaleDateString();

const productName = document.getElementById("productName");
const category = document.getElementById("category");
const pricingType = document.getElementById("pricingType");
const weightFields = document.getElementById("weightFields");
const unitFields = document.getElementById("unitFields");
const calculateBtn = document.getElementById("calculateBtn");
const result = document.getElementById("result");
const recordToggle = document.getElementById("recordToggle");
const recordedTotal = document.getElementById("recordedTotal");
const clearTotal = document.getElementById("clearTotal");
const showLogBtn = document.getElementById("showLogBtn");
const modeToggle = document.getElementById("modeToggle");

let log = [];
let totalRecorded = 0;

const convertToKg = (val, unit) =>
  unit === "gram" ? val / 1000 : val;

const validateFields = () => {
  const isValid =
    productName.value &&
    category.value &&
    pricingType.value &&
    (
      (pricingType.value === "weight" &&
        document.getElementById("productWeight").value &&
        document.getElementById("productWeightPrice").value &&
        document.getElementById("customWeight").value) ||
      (pricingType.value === "unit" &&
        document.getElementById("unitCount").value &&
        document.getElementById("unitPrice").value)
    );

  calculateBtn.disabled = !isValid;
};

const calculatePrice = () => {
  let price = 0;
  let detail = "";

  if (pricingType.value === "weight") {
    const pw = parseFloat(document.getElementById("productWeight").value);
    const pwUnit = document.getElementById("productWeightUnit").value;
    const priceINR = parseFloat(document.getElementById("productWeightPrice").value);
    const customW = parseFloat(document.getElementById("customWeight").value);
    const customUnit = document.getElementById("customWeightUnit").value;

    const base = convertToKg(pw, pwUnit);
    const custom = convertToKg(customW, customUnit);

    price = (priceINR / base) * custom;
    detail = `${customW} ${customUnit} from ${pw} ${pwUnit} @ ₹${priceINR}`;
  } else {
    const count = parseFloat(document.getElementById("unitCount").value);
    const unitPrice = parseFloat(document.getElementById("unitPrice").value);
    price = count * unitPrice;
    detail = `${count} units @ ₹${unitPrice}`;
  }

  result.textContent = `Calculated Price: ₹${price.toFixed(2)}`;

  if (recordToggle.classList.contains('active')) {
    totalRecorded += price;
    recordedTotal.textContent = `Total Recorded: ₹${totalRecorded.toFixed(2)}`;
  }  

  log.push({
    timestamp: new Date().toLocaleString(),
    product: productName.value,
    category: category.value,
    type: pricingType.value,
    detail,
    price: `₹${price.toFixed(2)}`
  });
};

const clearRecorded = () => {
  totalRecorded = 0;
  recordedTotal.textContent = `Total Recorded: ₹0.00`;
};

const openLogWindow = () => {
  const logWin = window.open("", "_blank");
  let html = `
    <html>
    <head><title>Log</title></head>
    <body>
      <h2>Calculation Log</h2>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr><th>Date</th><th>Product</th><th>Category</th><th>Type</th><th>Detail</th><th>Price</th></tr>`;
  log.forEach(e => {
    html += `<tr>
      <td>${e.timestamp}</td>
      <td>${e.product}</td>
      <td>${e.category}</td>
      <td>${e.type}</td>
      <td>${e.detail}</td>
      <td>${e.price}</td>
    </tr>`;
  });
  html += `
      </table>
      <br>
      <button onclick="exportLog()">Export to Excel</button>
      <button onclick="clearLog()">Clear Log</button>
      <script>
        function exportLog() {
          let csv = "Date,Product,Category,Type,Detail,Price\\n";
          document.querySelectorAll("table tr").forEach((row, i) => {
            if (i === 0) return;
            let cells = row.querySelectorAll("td");
            csv += Array.from(cells).map(td => td.innerText).join(",") + "\\n";
          });
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "pricing_log.csv";
          link.click();
        }

        function clearLog() {
          document.querySelector("table").innerHTML = "";
          window.opener.postMessage("clearLog", "*");
        }
      </script>
    </body>
    </html>`;
  logWin.document.write(html);
  logWin.document.close();

};

const toggleTheme = () => {
  document.body.classList.toggle("dark");
};

const toggle = document.getElementById('recordToggle');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');

  // Optional: log the state
  const isActive = toggle.classList.contains('active');
  console.log('Toggle is now', isActive ? 'ON' : 'OFF');
});

document.addEventListener("DOMContentLoaded", () => {
  pricingType.addEventListener("change", () => {
    weightFields.classList.toggle("hidden", pricingType.value !== "weight");
    unitFields.classList.toggle("hidden", pricingType.value !== "unit");
    validateFields();
  });

  document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", validateFields);
    el.addEventListener("change", validateFields);
  });

  calculateBtn.addEventListener("click", calculatePrice);
  clearTotal.addEventListener("click", clearRecorded);
  showLogBtn.addEventListener("click", openLogWindow);
  modeToggle.addEventListener("click", toggleTheme);

  window.addEventListener("message", e => {
    if (e.data === "clearLog") log = [];
  });
});
