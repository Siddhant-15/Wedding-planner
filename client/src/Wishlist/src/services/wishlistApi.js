// Toggle
const USE_MOCK = true;
const LS_KEY = "wishlists_mock_v2";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

// --------------------
// MOCK STORAGE
// --------------------
const seed = () => {
  const existing = localStorage.getItem(LS_KEY);
  if (existing) return JSON.parse(existing);
  const data = { wishlists: [], items: [] };
  localStorage.setItem(LS_KEY, JSON.stringify(data));
  return data;
};

const read = () => seed();
const write = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

// --------------------
// REAL FETCH
// --------------------
const realFetch = async (path, opts = {}) => {
  try {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important for auth cookies
      ...opts,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Request failed: ${res.status}`);
    }

    return res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
};

// --------------------
// API
// --------------------
export const wishlistApi = {
  // ------------------------
  // WISHLISTS
  // ------------------------

  async list() {
    if (!USE_MOCK) return realFetch("/wishlists");

    await delay();
    const { wishlists, items } = read();

    return wishlists.map((w) => {
      const wItems = items.filter((i) => i.wishlist_id === w.id);
      return {
        ...w,
        item_count: wItems.length,
        cover_image: wItems[0]?.service?.image || null,
        last_updated: wItems[0]?.created_at || w.created_at,
      };
    });
  },

  async create({ name, description = "", is_public = false }) {
    if (!USE_MOCK)
      return realFetch("/wishlists", {
        method: "POST",
        body: JSON.stringify({ name, description, is_public }),
      });

    await delay();
    const data = read();

    const w = {
      id: uid(),
      name: name.trim(),
      description,
      is_public,
      created_at: new Date().toISOString(),
    };

    data.wishlists.push(w);
    write(data);
    return w;
  },

  async update(id, patch) {
    if (!USE_MOCK)
      return realFetch(`/wishlists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

    await delay();
    const data = read();

    const w = data.wishlists.find((x) => x.id === id);
    if (!w) throw new Error("Wishlist not found");

    Object.assign(w, patch);
    write(data);

    return w;
  },

  async remove(id) {
    if (!USE_MOCK)
      return realFetch(`/wishlists/${id}`, { method: "DELETE" });

    await delay();
    const data = read();

    data.wishlists = data.wishlists.filter((w) => w.id !== id);
    data.items = data.items.filter((i) => i.wishlist_id !== id);

    write(data);
    return { ok: true };
  },

  async getDetail(id) {
    if (!USE_MOCK) return realFetch(`/wishlists/${id}`);

    await delay();
    const { wishlists, items } = read();

    const w = wishlists.find((x) => x.id === id);
    if (!w) throw new Error("Wishlist not found");

    const wItems = items.filter((i) => i.wishlist_id === id);

    return { ...w, items: wItems };
  },

  // ------------------------
  // ITEMS
  // ------------------------

  async addItem({ wishlist_id, service_id, service }) {
    if (!USE_MOCK)
      return realFetch(`/wishlists/items`, {
        method: "POST",
        body: JSON.stringify({ wishlist_id, service_id }),
      });

    await delay();
    const data = read();

    const exists = data.items.find(
      (i) => i.wishlist_id === wishlist_id && i.service.id === service_id
    );

    if (exists) return exists;

    const item = {
      id: uid(),
      wishlist_id,
      service, // keep full object only in mock
      note: "",
      priority: 0,
      created_at: new Date().toISOString(),
    };

    data.items.push(item);
    write(data);

    return item;
  },

  async removeItem(itemId) {
    if (!USE_MOCK)
      return realFetch(`/wishlists/items/${itemId}`, {
        method: "DELETE",
      });

    await delay();
    const data = read();

    data.items = data.items.filter((i) => i.id !== itemId);
    write(data);

    return { ok: true };
  },

  async updateItem(itemId, patch) {
    if (!USE_MOCK)
      return realFetch(`/wishlists/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

    await delay();
    const data = read();

    const item = data.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");

    Object.assign(item, patch);
    write(data);

    return item;
  },

  async moveItem(itemId, target_wishlist_id) {
    return this.updateItem(itemId, {
      wishlist_id: target_wishlist_id,
    });
  },

  // ------------------------
  // CHECK IF SAVED
  // ------------------------

  async findItemForService(service_id) {
    if (!USE_MOCK) {
      // ⚠️ You need to implement this endpoint in backend
      return realFetch(`/wishlists/items/by-service/${service_id}`);
    }

    await delay(50);
    const { items } = read();

    return items.find((i) => i.service.id === service_id) || null;
  },
};

// ------------------------
// SMART NAME SUGGESTION
// ------------------------

export const suggestNameForService = (service) => {
  const t = (service?.service_type || service?.type || "").toLowerCase();

  if (t.includes("venue")) return "Venues";
  if (t.includes("cater")) return "Catering";
  if (t.includes("photo")) return "Photography";
  if (t.includes("dj") || t.includes("music")) return "Music & DJ";
  if (t.includes("decor")) return "Decoration";
  if (t.includes("makeup")) return "Makeup Artists";
  if (t.includes("plan") || t.includes("event")) return "Event Planners";

  return "My Wishlist";
};