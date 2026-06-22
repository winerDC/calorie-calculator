// ===== CONSTANTS & STATE =====
const DEFAULT_CAL = 100;

const foodCalories = Object.freeze({
  rice: 130,
  chicken: 165,
  egg: 78,
  apple: 95,
  banana: 105,
  bread: 80,
  milk: 120,
  fish: 150,
  burger: 295,
  pizza: 285,
  fries: 365,
  spaghetti: 220
});

let foods = safeParse("foods", []);
let goal = safeParse("goal", 2000);
let deleteIndex = null;

// ===== DOM CACHE =====
const DOM = {
  body: document.body,
  toast: document.getElementById("toast"),
  list: document.getElementById("list"),
  name: document.getElementById("name"),
  meal: document.getElementById("meal"),
  search: document.getElementById("search"),
  filter: document.getElementById("filter"),
  goalDisplay: document.getElementById("goal"),
  consumed: document.getElementById("consumed"),
  remaining: document.getElementById("remaining"),
  bar: document.getElementById("bar"),
  percent: document.getElementById("percent"),
  modal: document.getElementById("modal"),
  goalInput: document.getElementById("goalInput")
};

// ===== UTIL =====
function safeParse(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ===== UI =====
function toggleTheme() {
  DOM.body.classList.toggle("dark");
}

function showToast(msg) {
  DOM.toast.textContent = msg;
  DOM.toast.classList.add("show");
  setTimeout(() => DOM.toast.classList.remove("show"), 2000);
}

// ===== CORE =====
function addFood() {
  const name = DOM.name.value.trim().toLowerCase();
  const meal = DOM.meal.value;

  if (!name || !meal) {
    return showToast("Please enter food & meal");
  }

  const cal = foodCalories[name] ?? DEFAULT_CAL;

  foods = [
    ...foods,
    {
      name,
      cal,
      meal,
      time: new Date().toLocaleTimeString()
    }
  ];

  save("foods", foods);
  DOM.name.value = "";

  render();
  showToast(`${name} added (${cal} cal) ✅`);
}

// ===== RENDER =====
function render() {
  const search = DOM.search.value.toLowerCase();
  const filter = DOM.filter.value;

  // FILTER FIRST (clean separation)
  const visibleFoods = foods.filter(f =>
    f.name.includes(search) &&
    (!filter || f.meal === filter)
  );

  let total = 0;

  // Use fragment for better DOM performance
  const fragment = document.createDocumentFragment();

  visibleFoods.forEach((f, i) => {
    total += f.cal;

    const div = document.createElement("div");
    div.className = "food";

    // Safer than raw innerHTML (still templated but controlled)
    div.innerHTML = `
      <div>
        <b>${escapeHTML(f.name)}</b><br>
        ${f.cal} cal • ${f.meal}<br>
        <span class="small">${f.time}</span>
      </div>
      <button data-index="${i}">❌</button>
    `;

    fragment.appendChild(div);
  });

  DOM.list.replaceChildren(fragment);

  updateDashboard(total);
}

// ===== DASHBOARD =====
function updateDashboard(total) {
  DOM.goalDisplay.textContent = goal;
  DOM.consumed.textContent = total;
  DOM.remaining.textContent = goal - total;

  const percent = Math.min((total / goal) * 100, 100);

  DOM.bar.style.width = `${percent}%`;
  DOM.percent.textContent = `${Math.round(percent)}%`;
}

// ===== DELETE =====
DOM.list.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    deleteIndex = e.target.dataset.index;
    DOM.modal.classList.remove("hidden");
  }
});

function confirmDelete() {
  foods = foods.filter((_, i) => i !== Number(deleteIndex));
  save("foods", foods);

  DOM.modal.classList.add("hidden");
  render();
  showToast("Deleted ❌");
}

function cancelDelete() {
  DOM.modal.classList.add("hidden");
}

// ===== SETTINGS =====
function saveGoal() {
  const g = parseInt(DOM.goalInput.value);
  if (!g) return;

  goal = g;
  save("goal", goal);

  render();
  showToast("Goal updated 🎯");
}

// ===== SECURITY =====
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[match]));
}

// ===== INIT =====
render();