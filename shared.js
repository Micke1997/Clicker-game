// === INITIERING ===
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("money")) localStorage.setItem("money", "100");
  if (!localStorage.getItem("xp")) localStorage.setItem("xp", "0");
  if (!localStorage.getItem("inventory")) localStorage.setItem("inventory", "{}");
  if (!localStorage.getItem("cakes")) localStorage.setItem("cakes", "{}");
  if (!localStorage.getItem("bakeryUnlocked")) localStorage.setItem("bakeryUnlocked", "false");
  if (!localStorage.getItem("employees")) localStorage.setItem("employees", "0");
  if (!localStorage.getItem("cakeSales")) localStorage.setItem("cakeSales", "{}");
  if (!localStorage.getItem("soldBonuses")) localStorage.setItem("soldBonuses", "{}");

  updateMoneyDisplay();
  updateXPDisplay();
  updateInventoryDisplay();
  updateCakeDisplay();
  updateBakeryDisplay();
  updateEmployeeDisplay();
  renderBonusSection();

  // Knyt admin-knappen om den finns
  const adminBtn = document.getElementById("admin-money-btn");
  if (adminBtn) {
    adminBtn.addEventListener("click", giveAdminMoney);
  }
});

// === PENGAR & XP ===
function getMoney() {
  return parseInt(localStorage.getItem("money") || "0", 10);
}

function setMoney(amount) {
  amount = parseInt(amount, 10);
  if (isNaN(amount) || amount < 0) amount = 0;
  localStorage.setItem("money", amount.toString());
  updateMoneyDisplay();
}

function addMoney(amount) {
  const newAmount = getMoney() + parseInt(amount, 10);
  setMoney(newAmount);
}

function getXP() {
  return parseInt(localStorage.getItem("xp") || "0", 10);
}

function setXP(amount) {
  amount = parseInt(amount, 10);
  if (isNaN(amount) || amount < 0) amount = 0;
  localStorage.setItem("xp", amount.toString());
  updateXPDisplay();
}

function addXP(amount) {
  const newXP = getXP() + parseInt(amount, 10);
  setXP(newXP);
}

// === INVENTARIE (RÅVAROR) ===
function buyProduct(name, cost, xpGain) {
  if (getMoney() < cost) {
    alert("Inte tillräckligt med pengar!");
    return;
  }

  const inventory = JSON.parse(localStorage.getItem("inventory"));
  inventory[name] = (inventory[name] || 0) + 1;
  localStorage.setItem("inventory", JSON.stringify(inventory));

  addMoney(-cost);
  addXP(xpGain);
  updateInventoryDisplay();
}

function updateInventoryDisplay() {
  const inventory = JSON.parse(localStorage.getItem("inventory"));
  for (const item in inventory) {
    const el = document.getElementById(`count-${item}`);
    if (el) el.textContent = inventory[item];
  }
}

// === XP-VY & NIVÅ ===
function updateXPDisplay() {
  const xp = getXP();
  document.querySelectorAll("#xp").forEach(el => el.textContent = xp);
  const level = Math.floor(xp / 100) + 1;
  const levelEl = document.getElementById("level");
  if (levelEl) levelEl.textContent = level;
}

function updateMoneyDisplay() {
  const money = getMoney();
  document.querySelectorAll("#money").forEach(el => el.textContent = money);
  const bankMoney = document.getElementById("bank-money");
  if (bankMoney) bankMoney.textContent = money;
}

// === TILLVERKA PRODUKT ===
function makeCake(type) {
  const inventory = JSON.parse(localStorage.getItem("inventory"));
  const cakes = JSON.parse(localStorage.getItem("cakes"));

  const recipes = {
    "äppelkaka": { "Äppel": 3, "Mjölk": 1, "Mjöl": 1 },
    "banankaka": { "Bannan": 3, "Mjölk": 2, "Mjöl": 1 },
    "dator": { "Datorchassi": 1, "Processor": 1, "Moderkort": 1 }
  };

  const recipe = recipes[type];
  if (!recipe) return;

  for (let ingredient in recipe) {
    if ((inventory[ingredient] || 0) < recipe[ingredient]) {
      // Inga ingredienser, sluta försöka baka
      return;
    }
  }

  for (let ingredient in recipe) {
    inventory[ingredient] -= recipe[ingredient];
  }

  cakes[type] = (cakes[type] || 0) + 1;

  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("cakes", JSON.stringify(cakes));

  updateInventoryDisplay();
  updateCakeDisplay();
}

// === SÄLJ PRODUKT ===
function sellCake(type) {
  const cakes = JSON.parse(localStorage.getItem("cakes"));
  if (!cakes[type] || cakes[type] <= 0) {
    alert("Du har inga produkter att sälja.");
    return;
  }

  const prices = {
    "äppelkaka": 35,
    "banankaka": 45,
    "dator": 5000
  };

  cakes[type] -= 1;
  localStorage.setItem("cakes", JSON.stringify(cakes));

  const sales = JSON.parse(localStorage.getItem("cakeSales") || "{}");
  sales[type] = (sales[type] || 0) + 1;
  localStorage.setItem("cakeSales", JSON.stringify(sales));

  addMoney(prices[type]);
  addXP(type === "dator" ? 25 : 10);
  updateCakeDisplay();
  renderBonusSection();
}

// === VISA PRODUKTER ===
function updateCakeDisplay() {
  const cakes = JSON.parse(localStorage.getItem("cakes"));
  for (const type in cakes) {
    const el = document.getElementById(`cake-${type}`);
    if (el) el.textContent = cakes[type];
  }
}

// === BAGERI ===
function buyBakery() {
  const price = 50000;
  if (getMoney() < price) {
    alert("Du har inte råd att köpa bageriet.");
    return;
  }

  localStorage.setItem("bakeryUnlocked", "true");
  addMoney(-price);
  window.location.href = "bageri.html";
}

function updateBakeryDisplay() {
  if (document.getElementById("bakery-content")) {
    const unlocked = localStorage.getItem("bakeryUnlocked") === "true";
    document.getElementById("bakery-content").style.display = unlocked ? "block" : "none";
    document.getElementById("locked-message").style.display = unlocked ? "none" : "block";
  }
}

// === PERSONAL ===
function hireEmployee() {
  const cost = 10000;
  if (getMoney() < cost) {
    alert("Inte tillräckligt med pengar!");
    return;
  }

  addMoney(-cost);
  let employees = parseInt(localStorage.getItem("employees") || "0");
  employees += 1;
  localStorage.setItem("employees", employees);
  updateEmployeeDisplay();
}

function updateEmployeeDisplay() {
  const el = document.getElementById("employee-count");
  if (el) el.textContent = localStorage.getItem("employees") || "0";
}

setInterval(() => {
  const employees = parseInt(localStorage.getItem("employees") || "0");
  for (let i = 0; i < employees; i++) {
    makeCake("äppelkaka");
    makeCake("banankaka");
  }
}, 10000);

// === ADMIN-KNAPP ===
function giveAdminMoney() {
  addMoney(50000);
  alert("Du fick 50 000 kr (admin)!");
}

// === BONUS-FUNKTION ===
function renderBonusSection() {
  const bonusSection = document.getElementById("bonus-section");
  if (!bonusSection) return;

  const soldBonuses = JSON.parse(localStorage.getItem("soldBonuses") || "{}");
  const cakeSales = JSON.parse(localStorage.getItem("cakeSales") || "{}");

  const thresholds = [10, 100, 1000];
  const cakeTypes = {
    "äppelkaka": "äppelkaka",
    "banankaka": "banankaka",
    "dator": "dator"
  };

  bonusSection.innerHTML = "";

  for (const cake in cakeTypes) {
    const sold = cakeSales[cake] || 0;

    thresholds.forEach(threshold => {
      const bonusKey = `${cake}-${threshold}`;
      if (sold >= threshold && !soldBonuses[bonusKey]) {
        const div = document.createElement("div");
        div.className = "action";

        const p = document.createElement("p");
        p.textContent = `🎉 Bonus! Du har sålt ${threshold} ${cake}!`;

        const button = document.createElement("button");
        button.textContent = "Hämta bonus";
        button.onclick = () => {
          addMoney(1000 * threshold);
          addXP(50);
          soldBonuses[bonusKey] = true;
          localStorage.setItem("soldBonuses", JSON.stringify(soldBonuses));
          renderBonusSection();
          alert(`Du fick en bonus för ${threshold} sålda ${cake}!`);
        };

        div.appendChild(p);
        div.appendChild(button);
        bonusSection.appendChild(div);
      }
    });
  }
}