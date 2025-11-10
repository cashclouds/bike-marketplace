const { Client } = require('pg');

async function setupDatabase() {
  // Подключаемся к postgres БД (по умолчанию)
  const client = new Client({
    user: 'postgres',
    password: 'TahameRaha24',
    host: 'localhost',
    port: 5432,
    database: 'postgres' // Подключаемся к default БД
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Создаем БД bike_marketplace
    await client.query('CREATE DATABASE bike_marketplace;');
    console.log('Database bike_marketplace created successfully');

    await client.end();

    // Теперь подключаемся к новой БД и создаем таблицы
    const dbClient = new Client({
      user: 'postgres',
      password: 'TahameRaha24',
      host: 'localhost',
      port: 5432,
      database: 'bike_marketplace'
    });

    await dbClient.connect();
    console.log('Connected to bike_marketplace database');

    // Создаем таблицы
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bikes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        seller_id INTEGER REFERENCES users(id),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER REFERENCES users(id),
        bike_id INTEGER REFERENCES bikes(id),
        quantity INTEGER DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
    await dbClient.end();
    console.log('Database setup complete!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Database already exists, skipping creation');

      // Все равно создаем таблицы если их нет
      const dbClient = new Client({
        user: 'postgres',
        password: 'TahameRaha24',
        host: 'localhost',
        port: 5432,
        database: 'bike_marketplace'
      });

      try {
        await dbClient.connect();
        await dbClient.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS bikes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100),
            seller_id INTEGER REFERENCES users(id),
            image_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            buyer_id INTEGER REFERENCES users(id),
            bike_id INTEGER REFERENCES bikes(id),
            quantity INTEGER DEFAULT 1,
            total_price DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Tables created successfully');
        await dbClient.end();
      } catch (tableError) {
        console.error('Error creating tables:', tableError);
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

setupDatabase();
