const dotenv = require('dotenv');
dotenv.config();
console.log('DB URL:', process.env.DATABASE_URL);
console.log('NEON URL:', process.env.NEON_DATABASE_URL);
