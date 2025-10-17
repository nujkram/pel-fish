import { dev } from '$app/environment';
import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const uri = process.env['DATABASE_URL'];

const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true
};

let cachedDb: any;

if (!uri) {
	throw new Error('Please set DATABASE_URL in your environment');
}

if (dev && !uri?.includes('Staging') && !uri?.includes('Test')) {
	console.info('🚨 You are using Production database in development mode 🚨');
}

if (dev && uri?.includes('Test')) {
	console.info('🚨 You are using Test database in development mode 🚨');
}

async function connectToDatabase() {
	if (cachedDb) return cachedDb;

	const client = await MongoClient.connect(uri, options);

	// Use explicit override if provided; otherwise use the DB in the URI
	const dbNameOverride = process.env['MONGODB_DB'] || process.env['DATABASE_NAME'];
	const db = dbNameOverride ? client.db(dbNameOverride) : client.db();
	cachedDb = db;
	return db;
}
const clientPromise = async () => await connectToDatabase();
// cachedDb = new MongoClient(uri, options);
// clientPromise = cachedDb.connect();

// Export a module-scoped MongoClient promise.
// By doing this in a separate module,
// the client can be shared across functions.
export default clientPromise;
