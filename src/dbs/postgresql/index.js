const { PrismaClient } = require('@prisma/client');
const config = require('../../config');

let client;

const connectPostgres = async () => {
  const url = config?.dbs?.postgresql?.url;

  if (!url) {
    throw new Error('DATABASE_URL no está definida. Revisa config/dbs.json y variables de entorno.');
  }

  if (!client) {
    client = new PrismaClient({
      datasources: {
        db: { url },
      },
    });

    await client.$connect();
  }

  return client;
};

const getPostgresClient = () => {
  if (!client) {
    throw new Error('PostgreSQL aún no fue inicializado. Llama a connectPostgres primero.');
  }

  return client;
};

module.exports = {
  connectPostgres,
  getPostgresClient,
};
