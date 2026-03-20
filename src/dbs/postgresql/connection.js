const { connectPostgres } = require('./index');

const connectDb = async () => {
  await connectPostgres();
  console.log('🟢 dotbin-auth: conectado a PostgreSQL (Prisma)');
};

module.exports = connectDb;
