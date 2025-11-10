const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'dpg-d491nhggjchc73f5pg9g-a.oregon-postgres.render.com',
  port: 5432,
  database: 'bike_marketplace',
  user: 'bikeuser',
  password: 'NmWiG0hKb1OqUoRoUXHKlKAuH0CJqbjV',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigrations() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Run schema migration
    console.log('Running schema migration...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql/01_init_schema.sql'), 'utf8');
    await client.query(schemaSQL);
    console.log('✓ Schema migration completed');

    // Run seed data
    console.log('Running seed data migration...');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'sql/02_seed_data.sql'), 'utf8');
    await client.query(seedSQL);
    console.log('✓ Seed data migration completed');

    console.log('\n✅ Database initialization successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
