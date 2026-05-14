const baseURL = import.meta.env.VITE_SERVER_URL ?? "";

async function convertToJson(res) {
  if (!res.ok) throw new Error("Bad Response");
  try {
    return await res.json();
  } catch (err) {
    // If the body is not JSON (e.g., 404 HTML), return an empty list to avoid runtime failures
    return [];
  }
}

function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

const fallbackCategories = ["tents", "backpacks", "sleeping-bags", "hammocks"];

export default class ProductData {
  async getData(category) {
    if (baseURL) {
      const response = await fetch(
        `${ensureTrailingSlash(baseURL)}products/search/${category}`,
      );
      const data = await convertToJson(response);
      return data?.Result ?? [];
    }

    const response = await fetch(`/json/${category}.json`);
    if (!response.ok) return [];
    const data = await convertToJson(response);
    return Array.isArray(data) ? data : data?.Result ?? [];
  }

  async findProductById(id) {
    if (baseURL) {
      const response = await fetch(
        `${ensureTrailingSlash(baseURL)}product/${id}`,
      );
      const data = await convertToJson(response);
      return data?.Result;
    }

    for (const category of fallbackCategories) {
      const response = await fetch(`/json/${category}.json`);
      if (!response.ok) continue;
      const items = await convertToJson(response);
      const list = Array.isArray(items) ? items : items?.Result ?? [];
      const match = list.find((item) => item.Id === id);
      if (match) return match;
    }

    throw new Error(`Product with id ${id} not found in local data`);
  }

  // Submits the order to the server. Falls back to a local log if no server URL is set.
  async checkout(order) {
    if (!baseURL) {
      console.log("No server URL set. Logging order locally:", order);
      return { success: true, message: "Order logged locally." };
    }

    const response = await fetch(`${ensureTrailingSlash(baseURL)}checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return await convertToJson(response);
  }
}



