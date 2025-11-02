/**
 * Migration script to add isActive field to all existing records
 * Run this with: node --loader ts-node/esm scripts/migrate-active-records.ts
 * Or: tsx scripts/migrate-active-records.ts
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateRecords() {
	const uri = process.env.DATABASE_URL;

	if (!uri) {
		console.error('ERROR: DATABASE_URL environment variable is not set');
		process.exit(1);
	}

	const dbName = process.env.MONGODB_DB || process.env.DATABASE_NAME;

	console.log('Connecting to MongoDB...');
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log('Connected successfully to MongoDB');

		const db = dbName ? client.db(dbName) : client.db();
		const recordsCollection = db.collection('records');

		// Count records without isActive field
		const recordsWithoutActive = await recordsCollection.countDocuments({
			isActive: { $exists: false }
		});

		console.log(`Found ${recordsWithoutActive} records without isActive field`);

		if (recordsWithoutActive === 0) {
			console.log('All records already have isActive field. Nothing to migrate.');
			return;
		}

		// Update all records without isActive to set it to true
		const result = await recordsCollection.updateMany(
			{ isActive: { $exists: false } },
			{ $set: { isActive: true } }
		);

		console.log(`✓ Successfully updated ${result.modifiedCount} records`);

		// Verify the update
		const totalRecords = await recordsCollection.countDocuments({});
		const activeRecords = await recordsCollection.countDocuments({ isActive: true });
		const inactiveRecords = await recordsCollection.countDocuments({ isActive: false });

		console.log('\nFinal Status:');
		console.log(`  Total records: ${totalRecords}`);
		console.log(`  Active records: ${activeRecords}`);
		console.log(`  Inactive records: ${inactiveRecords}`);
	} catch (error) {
		console.error('Error during migration:', error);
		process.exit(1);
	} finally {
		await client.close();
		console.log('\nDatabase connection closed');
	}
}

// Run the migration
migrateRecords()
	.then(() => {
		console.log('\nMigration completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\nMigration failed:', error);
		process.exit(1);
	});
