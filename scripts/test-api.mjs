async function main() {
  const API = "http://localhost:3002/api/admin/import-topcinema";
  
  console.log("=== Test 1: Single search ===");
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "one piece",
        contentType: "anime",
        limit: 1,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2).slice(0, 2000));
  } catch (e) {
    console.error("Error:", e.message);
  }

  console.log("\n=== Test 2: Direct Series URL ===");
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "https://topcinemaa.top/series/one-piece/",
        contentType: "anime",
        limit: 1,
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2).slice(0, 2000));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main().catch((e) => console.error("Fatal:", e));
