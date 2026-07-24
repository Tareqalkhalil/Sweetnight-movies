async function main() {
  // Step 1: Search for One Piece
  console.log("=== Step 1: Search ===");
  const res = await fetch("https://topcinemaa.top/?s=one+piece", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  console.log("Search HTML length:", html.length);

  // Find the first result link that contains "one-piece"
  const linkRegex = /<a[^>]+href="(https:\/\/topcinemaa\.top\/[^"]*one-piece[^"]*)"[^>]*>/i;
  const linkMatch = html.match(linkRegex);
  if (!linkMatch) {
    console.log("No One Piece link found. Trying broader search...");
    const allLinks = html.match(/https:\/\/topcinemaa\.top\/[^"]+/g) || [];
    console.log("Sample links:", allLinks.slice(0, 10));
    return;
  }
  console.log("Detail URL:", linkMatch[1]);

  // Step 2: Fetch detail page
  console.log("\n=== Step 2: Detail Page ===");
  const res2 = await fetch(linkMatch[1], {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(15000),
  });
  const html2 = await res2.text();
  console.log("Detail HTML length:", html2.length);

  // Step 3: Extract seasons
  console.log("\n=== Step 3: Extract Seasons ===");
  const seasonRegex = /class="[^"]*Small--Box\s+Season[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>[\s\S]*?<div class="epnum"><span>الموسم<\/span>\s*([0-9]+)[\s\S]*?<h3 class="title">([^<]+)<\/h3>/gi;
  const seasons = [];
  let m;
  while ((m = seasonRegex.exec(html2)) !== null) {
    seasons.push({ number: m[2], title: m[3], href: m[1] });
    console.log(`Season ${m[2]}: ${m[3]} -> ${m[1].slice(0, 80)}`);
  }
  console.log("Total seasons:", seasons.length);

  if (seasons.length === 0) {
    // Check if "Small--Box Season" exists in HTML
    const smallBoxSeasons = html2.match(/Small--Box\s+Season/g);
    console.log("'Small--Box Season' occurrences:", smallBoxSeasons?.length || 0);
    
    // Search for any season indicators
    const seasonMentions = html2.match(/الموسم\s*\d+/g);
    console.log("Season mentions:", seasonMentions?.slice(0, 10));
    
    // Show a portion of HTML around season area
    const seasonSection = html2.match(/<div[^>]*class="[^"]*Season[^"]*"[^>]*>[\s\S]{0,500}/i);
    if (seasonSection) {
      console.log("Season section:", seasonSection[0].slice(0, 500));
    }
  }

  // Step 4: Try fetching first season detail
  if (seasons.length > 0) {
    console.log("\n=== Step 4: First Season Detail ===");
    const seasonUrl = seasons[0].href.startsWith("http") ? seasons[0].href : `https://topcinemaa.top${seasons[0].href}`;
    console.log("Fetching:", seasonUrl);
    try {
      const res3 = await fetch(seasonUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000),
      });
      const html3 = await res3.text();
      console.log("Season HTML length:", html3.length);

      // Extract episodes
      const epPattern = /<a\s+href="([^"]+)"[^>]*title="([^"]*)"[\s\S]*?<div class="ep-info">[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<div class="epnum">[\s\S]*?<span>[^<]*<\/span>\s*([0-9.]+)\s*<\/div>/gi;
      let epCount = 0;
      let epM;
      while ((epM = epPattern.exec(html3)) !== null) {
        epCount++;
        if (epCount <= 3) console.log(`Ep ${epM[4]}: ${epM[3]}`);
      }
      console.log("Total episodes in season 1:", epCount);

      if (epCount === 0) {
        // Try alternative patterns
        const altEp = html3.match(/الحلقة\s*\d+/g);
        console.log("Episode mentions:", altEp?.slice(0, 10));
        
        // Look for epnum divs
        const epNums = html3.match(/epnum[^>]*>[\s\S]{0,100}/g);
        console.log("epnum samples:", epNums?.slice(0, 3));
      }
    } catch (e) {
      console.error("Error fetching season:", e.message);
    }
  }
}

main().catch((e) => console.error("Fatal:", e));
