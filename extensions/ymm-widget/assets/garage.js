// extensions/ymm-widget/assets/garage.js
// My Garage storefront widget — vanilla JS, no dependencies
// Persists vehicles server-side via /apps/ymm-parts/api/garage

(function () {
  "use strict";

  const widget = document.getElementById("ymm-garage-widget");
  if (!widget) return;

  const API_YMM = widget.dataset.apiYmm;
  const API_GARAGE = widget.dataset.apiGarage;
  const SHOP = widget.dataset.shop;

  // ---------- Identity ----------
  // Uses Shopify customer ID if logged in, else anonymous localStorage token
  function getCustomerToken() {
    const metaCustomer = document.querySelector("meta[name='shopify-customer-id']");
    if (metaCustomer) return "customer:" + metaCustomer.content;
    let anon = localStorage.getItem("ymm_garage_token");
    if (!anon) { anon = "anon:" + Math.random().toString(36).slice(2) + Date.now(); localStorage.setItem("ymm_garage_token", anon); }
    return anon;
  }

  const TOKEN = getCustomerToken();

  function apiHeaders() {
    return { "Content-Type": "application/json", "X-Customer-Token": TOKEN, "X-Shop-Domain": SHOP };
  }

  // ---------- State ----------
  let garage = [];
  let activeVehicle = null;
  let addMode = false;

  // ---------- DOM refs ----------
  const garageList = document.getElementById("garage-list");
  const garageEmpty = document.getElementById("garage-empty");
  const garageCount = document.getElementById("garage-count");
  const addForm = document.getElementById("garage-add-form");
  const btnShowAdd = document.getElementById("garage-show-add");
  const btnCancelAdd = document.getElementById("garage-cancel-add");
  const btnSaveVehicle = document.getElementById("garage-save-vehicle");
  const selYear = document.getElementById("garage-year");
  const selMake = document.getElementById("garage-make");
  const selModel = document.getElementById("garage-model");
  const inputNickname = document.getElementById("garage-nickname");
  const inputEngine = document.getElementById("garage-engine");
  const inputSubmodel = document.getElementById("garage-submodel");
  const activeBar = document.getElementById("garage-active-bar");
  const activeLabel = document.getElementById("garage-active-label");
  const statusMsg = document.getElementById("garage-status");

  function showStatus(msg, type, dur) {
    statusMsg.textContent = msg;
    statusMsg.className = "garage-status " + (type || "info");
    statusMsg.style.display = "block";
    if (dur !== 0) setTimeout(() => { statusMsg.style.display = "none"; }, dur || 3000);
  }

  // ---------- Load garage ----------
  async function loadGarage() {
    try {
      const res = await fetch(API_GARAGE, { headers: apiHeaders() });
      const data = await res.json();
      garage = data.vehicles || [];
      renderGarage();
      const def = garage.find(v => v.isDefault);
      if (def) setActiveVehicle(def);
    } catch (e) {
      showStatus("Could not load garage.", "error");
    }
  }

  // ---------- Render garage list ----------
  function renderGarage() {
    garageList.innerHTML = "";
    garageCount.textContent = garage.length + "/5";

    if (garage.length === 0) {
      garageEmpty.style.display = "block";
      btnShowAdd.style.display = "flex";
      return;
    }

    garageEmpty.style.display = "none";
    btnShowAdd.style.display = garage.length < 5 ? "flex" : "none";

    garage.forEach(function (v) {
      const card = document.createElement("div");
      card.className = "garage-card" + (v.isDefault ? " garage-card--default" : "");
      card.innerHTML = `
        <div class="garage-card-info">
          <div class="garage-card-icon">
            <svg width="18" height="14" viewBox="0 0 32 22" fill="none">
              <path d="M3 15L5.5 8.5H26.5L29 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <rect x="3" y="14.5" width="26" height="6" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="9" cy="20.5" r="2.5" fill="currentColor"/>
              <circle cx="23" cy="20.5" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          <div class="garage-card-text">
            ${v.nickname ? `<span class="garage-card-nickname">${v.nickname}</span>` : ""}
            <span class="garage-card-label">${v.label}</span>
            ${v.engine ? `<span class="garage-card-sub">${v.engine}${v.submodel ? " · " + v.submodel : ""}</span>` : (v.submodel ? `<span class="garage-card-sub">${v.submodel}</span>` : "")}
          </div>
          ${v.isDefault ? '<span class="garage-badge-default">Default</span>' : ""}
        </div>
        <div class="garage-card-actions">
          ${!v.isDefault ? `<button class="garage-btn-sm garage-btn-setdefault" data-id="${v.id}" title="Set as default">Use</button>` : ""}
          <button class="garage-btn-sm garage-btn-shop" data-year="${v.year}" data-make="${v.make}" data-model="${v.model}" title="Shop parts for this vehicle">Shop Parts</button>
          <button class="garage-btn-sm garage-btn-remove" data-id="${v.id}" title="Remove vehicle">✕</button>
        </div>
      `;
      garageList.appendChild(card);
    });

    // Wire up actions
    garageList.querySelectorAll(".garage-btn-remove").forEach(function (btn) {
      btn.addEventListener("click", function () { removeVehicle(parseInt(btn.dataset.id)); });
    });
    garageList.querySelectorAll(".garage-btn-setdefault").forEach(function (btn) {
      btn.addEventListener("click", function () { setDefault(parseInt(btn.dataset.id)); });
    });
    garageList.querySelectorAll(".garage-btn-shop").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const params = new URLSearchParams({ year: btn.dataset.year, make: btn.dataset.make, model: btn.dataset.model });
        window.location.href = "/search?" + params.toString();
      });
    });
  }

  // ---------- Active vehicle bar ----------
  function setActiveVehicle(v) {
    activeVehicle = v;
    if (v) {
      activeLabel.textContent = v.nickname ? v.nickname + " — " + v.label : v.label;
      activeBar.style.display = "flex";
      // Dispatch event so other widgets (YMM selector) can pre-fill
      window.dispatchEvent(new CustomEvent("ymm:garage:active", { detail: v }));
      // Save to session
      sessionStorage.setItem("ymm_vehicle", JSON.stringify({ year: v.year, make: v.make, model: v.model }));
    } else {
      activeBar.style.display = "none";
    }
  }

  // ---------- Add vehicle ----------
  async function populateYears() {
    const res = await fetch(API_YMM + "?action=years");
    const data = await res.json();
    selYear.innerHTML = '<option value="">Select Year</option>';
    (data.years || []).forEach(function (y) {
      const o = document.createElement("option"); o.value = y; o.textContent = y; selYear.appendChild(o);
    });
  }

  selYear.addEventListener("change", async function () {
    selMake.innerHTML = '<option value="">Loading...</option>'; selMake.disabled = true;
    selModel.innerHTML = '<option value="">Select Model</option>'; selModel.disabled = true;
    if (!selYear.value) { selMake.innerHTML = '<option value="">Select Make</option>'; return; }
    const res = await fetch(API_YMM + "?action=makes&year=" + selYear.value);
    const data = await res.json();
    selMake.innerHTML = '<option value="">Select Make</option>';
    (data.makes || []).forEach(function (m) {
      const o = document.createElement("option"); o.value = m; o.textContent = m; selMake.appendChild(o);
    });
    selMake.disabled = false;
  });

  selMake.addEventListener("change", async function () {
    selModel.innerHTML = '<option value="">Loading...</option>'; selModel.disabled = true;
    if (!selMake.value) { selModel.innerHTML = '<option value="">Select Model</option>'; return; }
    const res = await fetch(API_YMM + "?action=models&year=" + selYear.value + "&make=" + encodeURIComponent(selMake.value));
    const data = await res.json();
    selModel.innerHTML = '<option value="">Select Model</option>';
    (data.models || []).forEach(function (m) {
      const o = document.createElement("option"); o.value = m; o.textContent = m; selModel.appendChild(o);
    });
    selModel.disabled = false;
  });

  btnShowAdd.addEventListener("click", function () {
    addMode = true;
    addForm.style.display = "block";
    btnShowAdd.style.display = "none";
    populateYears();
  });

  btnCancelAdd.addEventListener("click", function () {
    addMode = false;
    addForm.style.display = "none";
    btnShowAdd.style.display = garage.length < 5 ? "flex" : "none";
    selYear.value = ""; selMake.innerHTML = '<option value="">Select Make</option>'; selMake.disabled = true;
    selModel.innerHTML = '<option value="">Select Model</option>'; selModel.disabled = true;
    inputNickname.value = ""; inputEngine.value = ""; inputSubmodel.value = "";
  });

  btnSaveVehicle.addEventListener("click", async function () {
    if (!selYear.value || !selMake.value || !selModel.value) { showStatus("Please select year, make and model.", "error"); return; }
    btnSaveVehicle.disabled = true; btnSaveVehicle.textContent = "Saving...";
    try {
      const res = await fetch(API_GARAGE, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          year: selYear.value, make: selMake.value, model: selModel.value,
          nickname: inputNickname.value || undefined,
          engine: inputEngine.value || undefined,
          submodel: inputSubmodel.value || undefined,
          setDefault: garage.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showStatus(data.error || "Failed to save.", "error"); return; }
      garage.push(data.vehicle);
      if (data.vehicle.isDefault) setActiveVehicle(data.vehicle);
      renderGarage();
      btnCancelAdd.click();
      showStatus("Vehicle added to your garage!", "success");
    } catch (e) {
      showStatus("Error saving vehicle.", "error");
    } finally {
      btnSaveVehicle.disabled = false; btnSaveVehicle.textContent = "Save Vehicle";
    }
  });

  async function removeVehicle(id) {
    try {
      const res = await fetch(API_GARAGE, { method: "DELETE", headers: apiHeaders(), body: JSON.stringify({ id }) });
      if (!res.ok) return;
      garage = garage.filter(v => v.id !== id);
      renderGarage();
      if (activeVehicle && activeVehicle.id === id) {
        const def = garage.find(v => v.isDefault);
        setActiveVehicle(def || null);
      }
      showStatus("Vehicle removed.", "info");
    } catch (e) { showStatus("Error removing vehicle.", "error"); }
  }

  async function setDefault(id) {
    try {
      await fetch(API_GARAGE, { method: "PATCH", headers: apiHeaders(), body: JSON.stringify({ id }) });
      garage = garage.map(v => ({ ...v, isDefault: v.id === id }));
      renderGarage();
      const def = garage.find(v => v.id === id);
      if (def) setActiveVehicle(def);
      showStatus("Default vehicle updated.", "success");
    } catch (e) { showStatus("Error updating default.", "error"); }
  }

  // Init
  loadGarage();
})();
