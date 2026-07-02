/**
 * middleware/spamFilter.js
 * Server-side spam protection for the public quote form.
 *
 * Checks:
 * 1. Gibberish name detection (no spaces, random case, no vowel pattern)
 * 2. Absurd cargo weight (over 100,000 kg)
 * 3. Missing or too-short port data
 * 4. Disposable email domains
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com",
  "yopmail.com","trashmail.com","sharklasers.com","guerrillamailblock.com",
  "grr.la","guerrillamail.info","spam4.me","dispostable.com",
  "maildrop.cc","discard.email","fakeinbox.com","mailnull.com",
]);

function hasVowels(str) {
  return /[aeiouAEIOU]/.test(str);
}

function isGibberishName(name) {
  if (!name || typeof name !== "string") return true;
  const clean = name.trim();
  if (clean.length < 2) return true;
  // Has a space = likely a real name (first + last)
  if (clean.includes(" ")) return false;
  // Single word: flag if over 10 chars with no vowels OR alternating case pattern
  if (clean.length > 10 && !hasVowels(clean)) return true;
  // Alternating upper/lower with no vowels — classic random string
  const upper = clean.replace(/[^A-Za-z]/g, "");
  if (upper.length > 8) {
    let alternations = 0;
    for (let i = 1; i < upper.length; i++) {
      const prev = upper[i - 1];
      const curr = upper[i];
      if (prev === prev.toUpperCase() && curr === curr.toLowerCase()) alternations++;
      else if (prev === prev.toLowerCase() && curr === curr.toUpperCase()) alternations++;
    }
    // Over 60% alternations = gibberish
    if (alternations / upper.length > 0.6) return true;
  }
  return false;
}

function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}

function spamFilter(req, res, next) {
  const body = req.body || {};

  const name = String(body?.shipper?.name || body?.requestor?.name || "").trim();
  const email = String(body?.shipper?.email || body?.requestor?.email || "").trim().toLowerCase();
  const weightRaw = String(body?.cargo?.weight || "").replace(/[^0-9.]/g, "");
  const weight = parseFloat(weightRaw);
  const originPort = String(body?.ports?.originPort || "").trim();
  const destPort = String(body?.ports?.destinationPort || "").trim();

  // 1. Gibberish name
  if (isGibberishName(name)) {
    console.warn("🚫 Spam filter: gibberish name rejected:", name);
    return res.status(400).json({
      ok: false,
      message: "Please enter your full name.",
    });
  }

  // 2. Absurd weight
  if (!isNaN(weight) && weight > 100000) {
    console.warn("🚫 Spam filter: absurd weight rejected:", weight);
    return res.status(400).json({
      ok: false,
      message: "Please check your cargo weight — that value looks incorrect.",
    });
  }

  // 3. Missing ports
  if (originPort.length < 2 || destPort.length < 2) {
    console.warn("🚫 Spam filter: missing ports rejected");
    return res.status(400).json({
      ok: false,
      message: "Please provide both origin and destination.",
    });
  }

  // 4. Disposable email
  if (isDisposableEmail(email)) {
    console.warn("🚫 Spam filter: disposable email rejected:", email);
    return res.status(400).json({
      ok: false,
      message: "Please use a valid email address.",
    });
  }

  next();
}

module.exports = spamFilter;
