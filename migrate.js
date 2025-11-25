const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://bikeuser:NmWiG0hKb1OqUoRoUXHKlKAuH0CJqbjV@dpg-d491nhggjchc73f5pg9g-a.oregon-postgres.render.com/bike_marketplace',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  await client.connect();
  console.log('Connected to database');

  await client.query(`
    ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS seller_telegram VARCHAR(100),
    ADD COLUMN IF NOT EXISTS seller_whatsapp VARCHAR(20),
    ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);
  `);

  console.log('Migration completed!');
  await client.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
