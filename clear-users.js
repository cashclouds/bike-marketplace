const { Client } = require('pg');

async function clearUsers() {
  const client = new Client({
    user: 'postgres',
    password: 'TahameRaha24',
    host: 'localhost',
    port: 5432,
    database: 'bike_marketplace'
  });

  try {
    await client.connect();
    console.log('🗑️ Clearing users table...');

    // Delete all listings first (they reference users)
    await client.query('DELETE FROM listings');
    console.log('✓ Listings deleted');

    // Delete all users
    await client.query('DELETE FROM users');
    console.log('✓ Users deleted');

    // Check count
    const result = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users in database: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

clearUsers();
