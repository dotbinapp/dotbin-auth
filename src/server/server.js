const app = require('../app');
const connectDb = require('../dbs/postgresql/connection');

const PORT = process.env.PORT || 4100;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`dotbin-auth listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('🔴 Error al iniciar dotbin-auth:', error.message);
    process.exit(1);
  }
};

startServer();
