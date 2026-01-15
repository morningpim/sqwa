const KEY = "sqw_applicants_v1";
const EVT = "sqw_applicants_changed";

const safeParse = (v, fallback) => {
  try {
    return JSON.parse(v) ?? fallback;
  } catch {
    return fallback;
  }
};

export const readAllApplicants = () => safeParse(localStorage.getItem(KEY), []);

export const writeAllApplicants = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event(EVT));
};

export const addApplicant = (payload) => {
  const list = readAllApplicants();
  const item = {
    id: crypto?.randomUUID?.() || String(Date.now()),
    createdAt: new Date().toISOString(),
    status: "pending", // pending | approved | rejected
    ...payload,
  };
  writeAllApplicants([item, ...list]);
};

export const updateApplicantStatus = (id, status, note = "") => {
  const list = readAllApplicants();
  writeAllApplicants(
    list.map((a) =>
      a.id === id
        ? { ...a, status, statusNote: note, updatedAt: new Date().toISOString() }
        : a
    )
  );
};

export const removeApplicant = (id) => {
  const list = readAllApplicants();
  writeAllApplicants(list.filter((a) => a.id !== id));
};

export const subscribeApplicantsChanged = (cb) => {
  const fn = () => cb?.();
  window.addEventListener(EVT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVT, fn);
    window.removeEventListener("storage", fn);
  };
};

export function seedMockApplicants() {
  const mocks = [
    {
      id: crypto.randomUUID(),
      type: "general",
      name: "สมชาย",
      lastname: "ใจดี",
      email: "somchai@test.com",
      phone: "0811111111",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: "seller",
      role: "agent",
      name: "วิชัย",
      lastname: "นายหน้า",
      email: "agent@test.com",
      phone: "0822222222",
      shopName: "VC Property",
      agentLicense: "AG-12345",
      bankAccount: "123-4-56789-0",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: "seller",
      role: "landlord",
      name: "อรทัย",
      lastname: "เจ้าของที่",
      email: "land@test.com",
      phone: "0833333333",
      shopName: "Owner Direct",
      bankAccount: "222-3-44444-1",
      status: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: "investor",
      name: "ธนพล",
      lastname: "นักลงทุน",
      email: "invest@test.com",
      phone: "0844444444",
      investorScore: 28,
      investorQuiz: {
        q1: 3, q2: 3, q3: 3, q4: 4, q5: 3,
        q6: 3, q7: 3, q8: 3, q9: 2, q10: 2,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: "seller",
      role: "agent",
      name: "ปรีชา",
      lastname: "โดนปฏิเสธ",
      email: "reject@test.com",
      phone: "0855555555",
      agentLicense: "AG-99999",
      status: "rejected",
      statusNote: "เอกสารไม่ครบ",
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem("sqw_applicants_v1", JSON.stringify(mocks));
  window.dispatchEvent(new Event("sqw_applicants_changed"));
}
