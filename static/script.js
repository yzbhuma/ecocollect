const form = document.getElementById("pickupForm");
const formMessage = document.getElementById("formMessage");
const preferredDate = document.getElementById("preferredDate");

if (preferredDate) preferredDate.min = new Date().toISOString().split("T")[0];

function countItems(text) {
  if (!text) return 0;
  return text.split(",").map(x => x.trim()).filter(Boolean).reduce((total, item) => {
    const match = item.match(/^(\d+)\s+/);
    return total + (match ? Number(match[1]) : 1);
  }, 0);
}

async function loadRequests() {
  try {
    const response = await fetch("/api/requests");
    const requests = await response.json();
    const totalItems = requests.reduce((sum, r) => sum + countItems(r.items), 0);

    document.getElementById("statRequests").textContent = requests.length;
    document.getElementById("statItems").textContent = totalItems;
    document.getElementById("driveHouseholds").textContent = requests.length;
    document.getElementById("driveItems").textContent = totalItems;
    document.getElementById("driveKg").textContent = `${Math.round(totalItems * 2.2)} kg`;

    const progress = Math.min(100, Math.round((requests.length / 15) * 100));
    document.getElementById("driveProgress").style.width = `${progress}%`;
    document.getElementById("driveProgressText").textContent = `${progress}%`;

    const list = document.getElementById("collectionList");
    if (!requests.length) {
      list.innerHTML = '<p class="empty-state">No collection requests yet. Submit the form to start.</p>';
      return;
    }

    list.innerHTML = requests.slice(0, 8).map(r => `
      <div class="collection-entry">
        <span>${escapeHtml(r.name)} • ${escapeHtml(r.area)}</span>
        <span>${countItems(r.items)} item(s)</span>
      </div>`).join("");
  } catch (error) {
    document.getElementById("collectionList").innerHTML =
      '<p class="empty-state">Could not load database records.</p>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Unable to save request.");

    formMessage.className = "form-message success";
    formMessage.innerHTML = `✓ <strong>${escapeHtml(result.message)}</strong> Your details are now stored in the database.`;
    form.reset();
    preferredDate.min = new Date().toISOString().split("T")[0];
    loadRequests();
    document.getElementById("drive").scrollIntoView({behavior:"smooth"});
  } catch (error) {
    formMessage.className = "form-message error";
    formMessage.textContent = "✕ " + error.message;
  }
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => document.getElementById("navLinks").classList.remove("open"));
});

loadRequests();
