// extensions/ymm-widget/assets/ymm.js
// Storefront widget — vanilla JS, no dependencies

(function () {
  "use strict";

  const widget = document.getElementById("ymm-parts-finder");
  if (!widget) return;

  const API_BASE = widget.dataset.apiUrl;
  const REDIRECT_URL = widget.dataset.redirectUrl || "/search";

  const selYear = document.getElementById("ymm-year");
  const selMake = document.getElementById("ymm-make");
  const selModel = document.getElementById("ymm-model");
  const btnSearch = document.getElementById("ymm-search-btn");
  const btnReset = document.getElementById("ymm-reset-btn");
  const statusEl = document.getElementById("ymm-status");

  let selectedCategory = "";

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "ymm-status " + type;
    statusEl.style.display = "block";
  }

  function hideStatus() {
    statusEl.style.display = "none";
  }

  function setSelectLoading(sel, loading) {
    sel.disabled = loading;
    if (loading) {
      sel.innerHTML = '<option value="">Loading...</option>';
    }
  }

  function populateSelect(sel, items, placeholder) {
    sel.innerHTML = '<option value="">' + placeholder + "</option>";
    items.forEach(function (item) {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      sel.appendChild(opt);
    });
    sel.disabled = false;
  }

  function updateSearchBtn() {
    btnSearch.disabled = !selYear.value || !selMake.value || !selModel.value;
  }

  // Load years on init
  fetch(API_BASE + "?action=years")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.years) populateSelect(selYear, data.years, "Select Year");
    })
    .catch(function () { showStatus("Failed to load vehicle data.", "error"); });

  // Year change → load makes
  selYear.addEventListener("change", function () {
    selMake.innerHTML = '<option value="">Select Make</option>';
    selMake.disabled = true;
    selModel.innerHTML = '<option value="">Select Model</option>';
    selModel.disabled = true;
    hideStatus();
    updateSearchBtn();

    if (!selYear.value) return;
    setSelectLoading(selMake, true);

    fetch(API_BASE + "?action=makes&year=" + selYear.value)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.makes) populateSelect(selMake, data.makes, "Select Make");
        else { selMake.innerHTML = '<option value="">No makes found</option>'; }
      })
      .catch(function () { showStatus("Failed to load makes.", "error"); });
  });

  // Make change → load models
  selMake.addEventListener("change", function () {
    selModel.innerHTML = '<option value="">Select Model</option>';
    selModel.disabled = true;
    hideStatus();
    updateSearchBtn();

    if (!selMake.value) return;
    setSelectLoading(selModel, true);

    fetch(API_BASE + "?action=models&year=" + selYear.value + "&make=" + encodeURIComponent(selMake.value))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.models) populateSelect(selModel, data.models, "Select Model");
        else { selModel.innerHTML = '<option value="">No models found</option>'; }
      })
      .catch(function () { showStatus("Failed to load models.", "error"); });
  });

  selModel.addEventListener("change", function () {
    hideStatus();
    updateSearchBtn();
  });

  // Category buttons
  document.querySelectorAll(".ymm-cat").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".ymm-cat").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      selectedCategory = btn.dataset.cat || "";
    });
  });

  // Search
  btnSearch.addEventListener("click", function () {
    if (!selYear.value || !selMake.value || !selModel.value) return;

    const params = new URLSearchParams({
      year: selYear.value,
      make: selMake.value,
      model: selModel.value,
    });

    if (selectedCategory) params.set("category", selectedCategory);

    // Save to sessionStorage for results page to use
    sessionStorage.setItem("ymm_vehicle", JSON.stringify({
      year: selYear.value,
      make: selMake.value,
      model: selModel.value,
      category: selectedCategory,
    }));

    // Redirect to search/collection page
    const base = REDIRECT_URL.includes("?") ? REDIRECT_URL + "&" : REDIRECT_URL + "?";
    window.location.href = base + params.toString();
  });

  // Reset
  btnReset.addEventListener("click", function () {
    selYear.value = "";
    selMake.innerHTML = '<option value="">Select Make</option>';
    selMake.disabled = true;
    selModel.innerHTML = '<option value="">Select Model</option>';
    selModel.disabled = true;
    document.querySelectorAll(".ymm-cat").forEach(function (b) { b.classList.remove("active"); });
    const firstCat = document.querySelector(".ymm-cat");
    if (firstCat) firstCat.classList.add("active");
    selectedCategory = "";
    btnSearch.disabled = true;
    hideStatus();
    sessionStorage.removeItem("ymm_vehicle");
  });

  // Restore from sessionStorage if returning to page
  const saved = sessionStorage.getItem("ymm_vehicle");
  if (saved) {
    try {
      const v = JSON.parse(saved);
      if (v.year) selYear.value = v.year;
      // Trigger cascading reload
      selYear.dispatchEvent(new Event("change"));
    } catch (e) {}
  }
})();
