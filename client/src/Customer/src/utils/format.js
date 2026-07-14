// Currency / address / pricing helpers
export const formatCurrency = (n, currency = "INR") => {
  const num = Number(n);
  if (!num || isNaN(num)) return "-";
  if (currency === "INR") {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toLocaleString("en-IN")}`;
  }
  return `${currency} ${num.toLocaleString()}`;
};

export const formatAddress = (s) => {
  const parts = [s?.area, s?.city, s?.state].filter(Boolean);
  return parts.join(", ");
};

export const titleCase = (str = "") =>
  String(str).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Pull the lowest meaningful "starting price" out of variants.
export const getStartingPrice = (service) => {
  const candidates = [];
  service?.variants?.forEach((v) => {
    const p = v?.pricing || {};
    [p.base_price, p.rental_price, p.veg_price, p.non_veg_price, p.price, p.price_with_video]
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
      .forEach((n) => candidates.push(n));
  });
  return candidates.length ? Math.min(...candidates) : null;
};

export const getCoverImage = (service) => {
  if (Array.isArray(service?.images) && service.images.length) return service.images[0];
  const cover = service?.media?.find?.((m) => m.is_cover);
  if (cover) return cover.media_url;
  return service?.media?.[0]?.media_url || "/placeholder.svg";
};

export const getAllImages = (service) => {
  if (Array.isArray(service?.images) && service.images.length) return service.images;
  if (Array.isArray(service?.media)) return service.media.map((m) => m.media_url);
  return [];
};
