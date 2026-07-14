// Mock review service. Replace with real API call in production.
export const reviewService = {
  add: async (formData) => {
    await new Promise((r) => setTimeout(r, 600));
    return { data: { id: `rev-${Date.now()}`, photos: [] } };
  },
  list: async (serviceId) => {
    await new Promise((r) => setTimeout(r, 300));
    return { data: [] };
  },
};
