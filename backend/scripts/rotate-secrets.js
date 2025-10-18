#!/usr/bin/env node

/**
 * Automated Secret Rotation Script for Vercel
 *
 * ⚠️ WARNING: Rotating JWT_SECRET will log out ALL users!
 *
 * Usage:
 *   node rotate-secrets.js --dry-run  (test without updating)
 *   node rotate-secrets.js            (actually rotate)
 *
 * Required environment variables:
 *   VERCEL_TOKEN       - Your Vercel API token
 *   VERCEL_PROJECT_ID  - Your Vercel project ID
 *   VERCEL_TEAM_ID     - Your Vercel team ID (optional)
 */

const https = require("https");
const crypto = require("crypto");

// Check if dry run
const isDryRun = process.argv.includes("--dry-run");

// Configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

// Validate configuration
if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error("❌ Missing required environment variables:");
  console.error("   VERCEL_TOKEN:", VERCEL_TOKEN ? "✅" : "❌");
  console.error("   VERCEL_PROJECT_ID:", VERCEL_PROJECT_ID ? "✅" : "❌");
  console.error("\n💡 Set these in your environment or .env file");
  process.exit(1);
}

// Generate secure random secret
function generateSecret(bytes = 64) {
  return crypto.randomBytes(bytes).toString("hex");
}

// Make API request to Vercel
function vercelApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vercel.com",
      path: path + (VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""),
      method: method,
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${parsed.error?.message || body}`));
          }
        } catch (err) {
          reject(new Error(`Parse Error: ${err.message}`));
        }
      });
    });

    req.on("error", reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Get existing environment variables
async function getEnvVars() {
  try {
    const path = `/v9/projects/${VERCEL_PROJECT_ID}/env`;
    return await vercelApiRequest("GET", path);
  } catch (error) {
    throw new Error(`Failed to get env vars: ${error.message}`);
  }
}

// Delete environment variable
async function deleteEnvVar(envId) {
  try {
    const path = `/v9/projects/${VERCEL_PROJECT_ID}/env/${envId}`;
    return await vercelApiRequest("DELETE", path);
  } catch (error) {
    throw new Error(`Failed to delete env var: ${error.message}`);
  }
}

// Create new environment variable
async function createEnvVar(key, value, target = ["production", "preview", "development"]) {
  try {
    const path = `/v10/projects/${VERCEL_PROJECT_ID}/env`;
    const data = {
      key,
      value,
      type: "encrypted",
      target,
    };
    return await vercelApiRequest("POST", path, data);
  } catch (error) {
    throw new Error(`Failed to create env var: ${error.message}`);
  }
}

// Update environment variable (delete + create)
async function updateEnvVar(key, value, target = ["production", "preview", "development"]) {
  console.log(`  📝 Updating ${key}...`);

  // Find existing env var
  const envVars = await getEnvVars();
  const existing = envVars.envs?.find((env) => env.key === key);

  if (existing) {
    console.log(`     Found existing ${key}, deleting...`);
    await deleteEnvVar(existing.id);
  }

  // Create new one
  console.log(`     Creating new ${key}...`);
  await createEnvVar(key, value, target);
  console.log(`     ✅ ${key} updated`);
}

// Main rotation function
async function rotateSecrets() {
  console.log("\n🔄 Secret Rotation Script");
  console.log("=".repeat(60));
  console.log(
    `Mode: ${isDryRun ? "🧪 DRY RUN (no changes will be made)" : "⚠️  LIVE MODE (will update Vercel)"}`
  );
  console.log("=".repeat(60));
  console.log();

  try {
    // Generate new secrets
    console.log("🔐 Step 1: Generating new secrets...");
    const newJwtSecret = generateSecret(64);
    const newCryptoSecret = generateSecret(64);
    console.log("   ✅ JWT_SECRET:", newJwtSecret.substring(0, 20) + "...");
    console.log("   ✅ CRYPTO_SECRET:", newCryptoSecret.substring(0, 20) + "...");
    console.log();

    if (isDryRun) {
      console.log("🧪 DRY RUN MODE - Skipping Vercel updates");
      console.log("\n📝 These secrets would be updated:");
      console.log(`   JWT_SECRET=${newJwtSecret}`);
      console.log(`   CRYPTO_SECRET=${newCryptoSecret}`);
      console.log("\n💡 Run without --dry-run to actually update Vercel");
      return;
    }

    // Update Vercel
    console.log("☁️  Step 2: Updating Vercel environment variables...");
    console.log("   ⚠️  This will trigger a redeploy and log out all users!");
    console.log();

    await updateEnvVar("JWT_SECRET", newJwtSecret);
    await updateEnvVar("CRYPTO_SECRET", newCryptoSecret);

    // Success
    console.log("\n" + "=".repeat(60));
    console.log("🎉 Secret rotation completed successfully!");
    console.log("=".repeat(60));
    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("  • All users will be logged out");
    console.log("  • Vercel will redeploy automatically");
    console.log("  • Update your local .env file with new secrets\n");

    console.log("📝 Add these to your local backend/.env:");
    console.log("-".repeat(60));
    console.log(`JWT_SECRET=${newJwtSecret}`);
    console.log(`CRYPTO_SECRET=${newCryptoSecret}`);
    console.log("-".repeat(60));
    console.log();
  } catch (error) {
    console.error("\n❌ Rotation failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("  • Check VERCEL_TOKEN is valid");
    console.error("  • Check VERCEL_PROJECT_ID is correct");
    console.error("  • Verify you have permission to update env vars");
    console.error("  • Check Vercel API status: https://www.vercel-status.com/\n");
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  rotateSecrets().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

module.exports = { rotateSecrets, generateSecret };
