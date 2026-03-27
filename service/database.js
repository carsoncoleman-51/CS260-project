const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db(config.database || 'startup');
const userCollection = db.collection('user');

// Test DB connection on startup so deployment failures are explicit.
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    await userCollection.createIndex({ username: 1 }, { unique: true });
    await userCollection.createIndex({ token: 1 }, { sparse: true });
    console.log(`Connected to MongoDB (${db.databaseName})`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

function getUser(username) {
  return userCollection.findOne({ username: username });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ username: user.username }, { $set: user });
}

function getLeaderboard(limit = 10, maxScore = Number.MAX_SAFE_INTEGER) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const safeMaxScore = Number.isFinite(maxScore) ? Math.floor(maxScore) : Number.MAX_SAFE_INTEGER;
  const options = {
    projection: {
      _id: 0,
      username: 1,
      score: 1,
      date: 1,
    },
    sort: { score: -1, date: -1 },
    limit: safeLimit,
  };

  return userCollection.find({ score: { $gte: 0, $lte: safeMaxScore } }, options).toArray();
}

async function resetScoresAbove(maxScore) {
  const safeMaxScore = Number.isFinite(maxScore) ? Math.floor(maxScore) : Number.MAX_SAFE_INTEGER;
  const result = await userCollection.updateMany(
    { score: { $gt: safeMaxScore } },
    { $set: { score: 0, date: '' } },
  );
  return result.modifiedCount;
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getLeaderboard,
  resetScoresAbove,
};
