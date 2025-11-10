const { Client } = require('pg');

async function createBrandsAndModels() {
  const client = new Client({
    user: 'postgres',
    password: 'TahameRaha24',
    host: 'localhost',
    port: 5432,
    database: 'bike_marketplace'
  });

  try {
    await client.connect();
    console.log('🔧 Creating brands and models tables...\n');

    // Create brands table
    console.log('Creating brands table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        logo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Brands table created\n');

    // Create models table
    console.log('Creating models table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(brand_id, name)
      )
    `);
    console.log('✓ Models table created\n');

    // Create components table
    console.log('Creating components table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS components (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Components table created\n');

    // Insert sample brands
    console.log('Inserting sample brands...');
    const brands = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube', 'Canyon', 'Orbea', 'Bianchi'];

    for (const brand of brands) {
      await client.query(
        'INSERT INTO brands (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [brand]
      );
    }
    console.log(`✓ ${brands.length} brands inserted\n`);

    // Insert sample models for Trek
    console.log('Inserting sample models...');
    const trekModels = ['FX 3', 'Marlin 5', 'Domane AL 2', 'Madone SL 6', 'Rail 5'];
    const trek = await client.query('SELECT id FROM brands WHERE name = $1', ['Trek']);

    if (trek.rows.length > 0) {
      for (const model of trekModels) {
        await client.query(
          'INSERT INTO models (brand_id, name, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [trek.rows[0].id, model, 'road']
        );
      }
    }
    console.log(`✓ ${trekModels.length} models inserted\n`);

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createBrandsAndModels();
