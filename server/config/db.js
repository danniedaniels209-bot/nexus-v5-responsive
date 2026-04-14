const mongoose = require('mongoose');
const dns      = require('dns');

// Force IPv4 — fixes querySrv ECONNREFUSED on Windows/certain ISPs
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('\n❌  MONGO_URI is missing from server/.env\n');
    process.exit(1);
  }

  const opts = {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  // ── Primary attempts (SRV URI) ──────────────────────────────────
  for (let i = 1; i <= 2; i++) {
    try {
      const conn = await mongoose.connect(uri, opts);
      console.log(`✅  MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️   Attempt ${i} failed (${err.message})${i < 2 ? ' — retrying in 3s…' : ''}`);
      if (i < 2) await new Promise(r => setTimeout(r, 3000));
    }
  }

  // ── Fallback 1: MONGO_URI_DIRECT (direct Atlas shard URI) ───────
  const directUri = process.env.MONGO_URI_DIRECT;
  if (directUri) {
    console.info('ℹ️   SRV resolution failed — attempting fallback with public DNS...');
    console.info('ℹ️   Connecting with fallback URI...');
    try {
      const conn = await mongoose.connect(directUri, opts);
      console.log(`✅  MongoDB connected (fallback): ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️   Direct URI fallback failed: ${err.message}`);
    }
  }

  // ── Fallback 2: retry SRV with Google public DNS ─────────────────
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.info('ℹ️   SRV resolution failed — attempting fallback with public DNS...');
    console.info('ℹ️   Connecting with fallback URI...');
    const conn = await mongoose.connect(uri, { ...opts, serverSelectionTimeoutMS: 12000 });
    console.log(`✅  MongoDB connected (fallback): ${conn.connection.host}`);
    return;
  } catch (err) {
    console.error('\n❌  MongoDB failed after all attempts.');
    console.error('   To fix: add MONGO_URI_DIRECT to server/.env');
    console.error('   Get it: Atlas → Connect → Drivers → disable "Use SRV"\n');
    process.exit(1);
  }
};

module.exports = connectDB;
