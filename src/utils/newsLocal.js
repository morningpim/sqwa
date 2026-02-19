const KEY = "local_news";

/* ---------------- GET ---------------- */
export function readAllNews(){
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

/* ---------------- CREATE ---------------- */
export function createNews(data){
  const list = readAllNews();
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data
  };
  localStorage.setItem(KEY, JSON.stringify([item, ...list]));
  notify();
}

/* ---------------- DELETE ---------------- */
export function removeNews(id){
  const list = readAllNews().filter(n => n.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  notify();
}

/* ---------------- UPDATE ---------------- */
export function updateNews(id, patch){
  const list = readAllNews().map(n =>
    n.id === id ? { ...n, ...patch } : n
  );
  localStorage.setItem(KEY, JSON.stringify(list));
  notify();
}

/* ---------------- SUBSCRIBE ---------------- */
let listeners = [];
function notify(){
  listeners.forEach(fn => fn());
}
export function subscribeNewsChanged(fn){
  listeners.push(fn);
  return () => listeners = listeners.filter(x=>x!==fn);
}
