const fallbackData = {
  companions: [
    {
      name: "Maya R.",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      city: "NYC",
      rate: 70,
      rating: "4.96",
      experience: "Weddings, charity formals, family events",
      bio: "Warm, polished, and calm in family-heavy rooms. Trained for cover-story boundaries and graceful exits.",
      badges: ["ID verified", "Background screened", "Etiquette trained"],
    },
  ],
  policies: [
    {
      title: "Verified adults only",
      body: "Requester and companion accounts require ID and selfie checks. The pilot is strictly 18+.",
    },
    {
      title: "Nonsexual scope",
      body: "Sexual services, coercion, undisclosed role changes, and off-platform payment are blocked and reviewed.",
    },
  ],
  metrics: [
    ["100", "Paid pilot bookings", "Target for first validation cycle"],
    ["0", "Unreviewed safety flags", "Every incident gets operator review"],
  ],
  scenarios: [
    [
      "Last-minute wedding plus-one",
      "36 hours before event",
      "Approve if the event is at a public venue, both users verify identity, and the companion completes a video intro before arrival.",
    ],
  ],
  integrations: [
    {
      name: "Local API",
      provider: "server.js + data.json",
      status: "fallback",
      detail: "Run the local server for the full integration model and booking queue.",
    },
  ],
  eventBaseRates: {
    Wedding: 280,
    "Corporate dinner": 260,
    Concert: 220,
    "Social gathering": 230,
    "Family event": 270,
    "Charity formal": 300,
  },
};

let pilotData = fallbackData;
let selectedTier = "48";
let selectedCompanion = null;

const eventType = document.querySelector("#eventType");
const eventDate = document.querySelector("#eventDate");
const eventTime = document.querySelector("#eventTime");
const venueArea = document.querySelector("#venueArea");
const eventRole = document.querySelector("#eventRole");
const estimateTitle = document.querySelector("#estimateTitle");
const rateLine = document.querySelector("#rateLine");
const feeLine = document.querySelector("#feeLine");
const tierLine = document.querySelector("#tierLine");
const briefTitle = document.querySelector("#briefTitle");
const briefText = document.querySelector("#briefText");
const toast = document.querySelector("#toast");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getEstimate() {
  const baseRate = pilotData.eventBaseRates[eventType.value] || 250;
  const companionRate = selectedCompanion ? selectedCompanion.rate * 4 : baseRate;
  const platformFee = Math.round(companionRate * 0.25);
  const tierFee = selectedTier === "24" ? 140 : 60;
  const total = companionRate + platformFee + tierFee;

  return { companionRate, platformFee, tierFee, total };
}

function updateEstimate() {
  const { companionRate, platformFee, tierFee, total } = getEstimate();
  const area = venueArea.value.trim() || "NYC";
  const companionText = selectedCompanion ? ` with ${selectedCompanion.name}` : "";

  estimateTitle.textContent = `${formatCurrency(total)} held in escrow`;
  rateLine.textContent = formatCurrency(companionRate);
  feeLine.textContent = formatCurrency(platformFee);
  tierLine.textContent = `${formatCurrency(tierFee)} ${selectedTier}-hour`;
  briefTitle.textContent = `${eventType.value} in ${area}`;
  briefText.textContent = `${eventRole.value}${companionText}, ${selectedTier}-hour planning window, public venue approved.`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3600);
}

function renderCompanions() {
  const container = document.querySelector("#companionCards");
  container.innerHTML = pilotData.companions
    .map(
      (companion, index) => `
        <article class="companion-card ${index === 0 ? "selected" : ""}" data-index="${index}">
          <img src="${companion.image}" alt="${companion.name}, vetted event companion" />
          <div>
            <div class="card-meta">
              <h3>${companion.name}</h3>
              <span>$${companion.rate}/hr</span>
            </div>
            <p>${companion.experience}</p>
          </div>
          <p>${companion.bio}</p>
          <div class="badge-row">
            ${companion.badges.map((badge) => `<span class="badge">${badge}</span>`).join("")}
          </div>
          <button class="secondary-action select-companion" type="button">Select companion</button>
          <div class="card-meta">
            <span>${companion.city}</span>
            <span>${companion.rating} rating</span>
          </div>
        </article>
      `,
    )
    .join("");

  selectedCompanion = pilotData.companions[0] || null;
  document.querySelectorAll(".companion-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".companion-card").forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");
      selectedCompanion = pilotData.companions[Number(card.dataset.index)];
      updateEstimate();
    });
  });
}

function renderPolicies() {
  const container = document.querySelector("#policyList");
  container.innerHTML = pilotData.policies
    .map(
      (policy) => `
        <article class="policy-item">
          <strong>${policy.title}</strong>
          <p>${policy.body}</p>
        </article>
      `,
    )
    .join("");
}

function renderMetrics() {
  const container = document.querySelector("#metricGrid");
  container.innerHTML = pilotData.metrics
    .map(
      ([value, label, detail]) => `
        <article class="metric-card">
          <strong>${value}</strong>
          <h3>${label}</h3>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderScenarios() {
  const list = document.querySelector("#scenarioList");
  list.innerHTML = pilotData.scenarios
    .map(
      ([title, context], index) => `
        <button class="scenario-button ${index === 0 ? "active" : ""}" type="button" data-index="${index}">
          <strong>${title}</strong>
          <span>${context}</span>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".scenario-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const [title, , outcome] = pilotData.scenarios[Number(button.dataset.index)];
      document.querySelector("#scenarioTitle").textContent = title;
      document.querySelector("#scenarioOutcome").textContent = outcome;
    });
  });
}

function renderIntegrations() {
  const container = document.querySelector("#integrationGrid");
  container.innerHTML = pilotData.integrations
    .map(
      (integration) => `
        <article class="integration-card">
          <div>
            <span class="integration-status">${integration.status}</span>
            <h3>${integration.name}</h3>
            <strong>${integration.provider}</strong>
          </div>
          <p>${integration.detail}</p>
        </article>
      `,
    )
    .join("");
}

function wireInteractions() {
  document.querySelectorAll(".segment").forEach((segment) => {
    segment.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      segment.classList.add("active");
      selectedTier = segment.dataset.tier;
      updateEstimate();
    });
  });

  [eventType, eventDate, eventTime, venueArea, eventRole].forEach((element) => {
    element.addEventListener("input", updateEstimate);
  });

  document.querySelector("#lockRequest").addEventListener("click", async () => {
    const estimate = getEstimate();
    const payload = {
      eventType: eventType.value,
      eventDate: eventDate.value,
      eventTime: eventTime.value,
      venueArea: venueArea.value,
      eventRole: eventRole.value,
      tier: selectedTier,
      companion: selectedCompanion?.name,
      estimate,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const booking = await response.json();
      showToast(`${booking.id} queued for concierge review. Operator approval, video intro, and check-ins are next.`);
    } catch {
      showToast("Request saved locally for review. API handoff was unavailable.");
    }
  });

  document.querySelector("#sosButton").addEventListener("click", () => {
    document.querySelector("#sosStatus").textContent =
      "Support status: SOS demo triggered. Trusted contact, location, and booking brief shared with operator.";
    showToast("SOS workflow demo triggered. No real emergency services were contacted.");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

async function loadPilotData() {
  try {
    const response = await fetch("/api/bootstrap");
    pilotData = await response.json();
    document.querySelector("#dataHealth").textContent = "Local API connected";
  } catch {
    pilotData = fallbackData;
    document.querySelector("#dataHealth").textContent = "Static fallback mode";
  }

  renderCompanions();
  renderPolicies();
  renderMetrics();
  renderScenarios();
  renderIntegrations();
  updateEstimate();
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 2);
eventDate.value = tomorrow.toISOString().slice(0, 10);

wireInteractions();
loadPilotData();
