#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const dbPath = 'd1/database.db';
const seedFile = join(__dirname, '002_seed_data.sql');

function runSeed() {
  if (!existsSync(dbPath)) {
    console.error('Database not found. Run migrations first:');
    console.log('  node d1/migrate.js apply');
    process.exit(1);
  }

  if (!existsSync(seedFile)) {
    console.error('Seed file not found:', seedFile);
    process.exit(1);
  }

  try {
    const sql = readFileSync(seedFile, 'utf8');
    execSync(`sqlite3 ${dbPath} "${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit'
    });
    console.log('✓ Seed data applied successfully');
  } catch (error) {
    console.error('✗ Failed to apply seed data:', error.message);
    process.exit(1);
  }
}

runSeed();
