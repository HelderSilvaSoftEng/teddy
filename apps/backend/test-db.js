require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'teddy_db',
  synchronize: true,
  logging: true,
  entities: [require('./dist/app/modules/users/domain/entities/user.entity').User, require('./dist/app/modules/customers/domain/entities/customer.entity').Customer],
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
