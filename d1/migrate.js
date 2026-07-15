#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');

const args = process.argv.slice(2);
const command = args[0];
const migrationsDir = join(__dirname, '..', 'd1', 'migrations');

function getMigrations() {
  const files = [];
  const dir = existsSync(migrationsDir) ? migrationsDir : './d1/migrations';
  
  try {
    const entries = require('fs').readdirSync(dir);
    for (const entry of entries) {
      if (entry.endsWith('.sql')) {
        files.push({
          name: entry.replace('.sql', ''),
          path: join(dir, entry)
        });
      }
    }
  } catch (error) {
    console.error('Error reading migrations directory:', error.message);
  }
  
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function runMigration(dbPath, migrationName, sql) {
  try {
    execSync(`sqlite3 ${dbPath} "${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit'
    });
    console.log(`✓ Applied: ${migrationName}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed: ${migrationName}`, error.message);
    return false;
  }
}

function applyMigrations(dbPath) {
  if (!existsSync(dbPath)) {
    const dbDir = require('path').dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    console.log('Creating new database:', dbPath);
  }

  const migrations = getMigrations();
  if (migrations.length === 0) {
    console.log('No migrations found');
    return;
  }

  console.log(`Found ${migrations.length} migrations`);

  const applied = [];
  for (const migration of migrations) {
    try {
      const sql = readFileSync(migration.path, 'utf8');
      if (runMigration(dbPath, migration.name, sql)) {
        applied.push(migration.name);
      }
    } catch (error) {
      console.error(`Error reading migration ${migration.name}:`, error.message);
    }
  }

  console.log(`Applied ${applied.length} migrations`);
}

function revertMigration(dbPath, migrationName) {
  const migrations = getMigrations();
  const migration = migrations.find(m => m.name === migrationName);
  
  if (!migration) {
    console.error(`Migration not found: ${migrationName}`);
    return;
  }

  try {
    const sql = readFileSync(migration.path, 'utf8');
    console.log(`Reverting: ${migrationName}`);
    
    const reverseSql = sql
      .split('--')[0]
      .split(';')
      .filter(line => line.trim())
      .map(line => line.replace('CREATE', 'DROP').replace('IF NOT EXISTS', 'IF EXISTS'))
      .join(';');
    
    if (runMigration(dbPath, migration.name, reverseSql)) {
      console.log(`✓ Reverted: ${migrationName}`);
    }
  } catch (error) {
    console.error(`Error reverting ${migration.name}:`, error.message);
  }
}

function showHelp() {
  console.log(`
D1 Database Migration CLI

Usage: node migrate.js <command> [options]

Commands:
  apply        Apply all pending migrations
  revert [name]  Revert a specific migration
  list         List all migrations
  help         Show this help message

Examples:
  node migrate.js apply
  node migrate.js revert 001_create_schema
  node migrate.js list
`);
}

switch (command) {
  case 'apply':
    applyMigrations('d1/database.db');
    break;
  case 'revert':
    if (!args[1]) {
      console.error('Migration name required');
      process.exit(1);
    }
    revertMigration('d1/database.db', args[1]);
    break;
  case 'list':
    console.log('Migrations:');
    getMigrations().forEach(m => console.log(`  - ${m.name}`));
    break;
  case 'help':
  default:
    showHelp();
}
