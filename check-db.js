const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    user: 'postgres',
    password: 'TahameRaha24',
    host: 'localhost',
    port: 5432,
    database: 'bike_marketplace'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check tables
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );

    console.log('\n📋 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check users table structure
    console.log('\n👤 Users table structure:');
    const usersStructure = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'`
    );

    if (usersStructure.rows.length === 0) {
      console.log('  ❌ Users table does not exist!');
    } else {
      usersStructure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }

    // Check if there are any users
    const usersCount = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n✓ Users in database: ${usersCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
