// src/utils/investorProfile.js
const KEY = "sqw_investor_profile_v1";

export function defaultInvestorProfile() {
  return {
    goal: "flipping",       // flipping | capital_gain | passive_income
    gis: "infra",           // infra | zoning | price_history
    budget: "low",          // low | mid | high
    updatedAt: new Date().toISOString(),
  };
}

export function loadInvestorProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultInvestorProfile();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultInvestorProfile();

    return {
      ...defaultInvestorProfile(),
      ...parsed,
    };
  } catch {
    return defaultInvestorProfile();
  }
}

export function saveInvestorProfile(profile) {
  const payload = {
    ...defaultInvestorProfile(),
    ...(profile || {}),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}

export function clearInvestorProfile() {
  localStorage.removeItem(KEY);
}
