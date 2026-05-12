require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const prisma = require('./utils/database');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`CampusConnect API running on port ${PORT}`, { env: process.env.NODE_ENV });
});

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
