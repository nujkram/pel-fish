/**
 * Migration script to add isActive field to all existing records
 * Run this with: node scripts/migrate-active-records.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateRecords() {
	const uri = process.env.DATABASE_URL;

	if (!uri) {
		console.error('ERROR: DATABASE_URL environment variable is not set');
		console.error('Please create a .env file with DATABASE_URL=your_mongodb_connection_string');
		process.exit(1);
	}

	const dbName = process.env.MONGODB_DB || process.env.DATABASE_NAME;

	console.log('Connecting to MongoDB...');
	const client = new MongoClient(uri);

	try {
		await client.connect();
		console.log('✓ Connected successfully to MongoDB');

		const db = dbName ? client.db(dbName) : client.db();
		const recordsCollection = db.collection('records');

		// Get initial counts
		const totalRecords = await recordsCollection.countDocuments({});
		console.log(`\nTotal records in database: ${totalRecords}`);

		if (totalRecords === 0) {
			console.log('\nNo records found in the database.');
			console.log('The database might be empty, or you might need to add some records first.');
			return;
		}

		// Count records without isActive field
		const recordsWithoutActive = await recordsCollection.countDocuments({
			isActive: { $exists: false }
		});

		const recordsWithActive = await recordsCollection.countDocuments({
			isActive: { $exists: true }
		});

		console.log(`Records with isActive field: ${recordsWithActive}`);
		console.log(`Records without isActive field: ${recordsWithoutActive}`);

		if (recordsWithoutActive === 0) {
			console.log('\n✓ All records already have isActive field. Nothing to migrate.');

			// Show breakdown
			const activeCount = await recordsCollection.countDocuments({ isActive: true });
			const inactiveCount = await recordsCollection.countDocuments({ isActive: false });
			console.log(`  - Active (isActive: true): ${activeCount}`);
			console.log(`  - Inactive (isActive: false): ${inactiveCount}`);
			return;
		}

		console.log(`\n→ Updating ${recordsWithoutActive} records to set isActive: true...`);

		// Update all records without isActive to set it to true
		const result = await recordsCollection.updateMany(
			{ isActive: { $exists: false } },
			{ $set: { isActive: true } }
		);

		console.log(`✓ Successfully updated ${result.modifiedCount} records`);

		// Verify the update
		const finalTotal = await recordsCollection.countDocuments({});
		const activeRecords = await recordsCollection.countDocuments({ isActive: true });
		const inactiveRecords = await recordsCollection.countDocuments({ isActive: false });

		console.log('\n=== Final Status ===');
		console.log(`Total records: ${finalTotal}`);
		console.log(`Active records (isActive: true): ${activeRecords}`);
		console.log(`Inactive records (isActive: false): ${inactiveRecords}`);

		console.log('\n✓ Migration completed successfully!');
		console.log('You can now refresh your Reports page to see the data.');
	} catch (error) {
		console.error('\n✗ Error during migration:', error);
		process.exit(1);
	} finally {
		await client.close();
		console.log('\nDatabase connection closed');
	}
}

// Run the migration
migrateRecords()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n✗ Migration failed:', error);
		process.exit(1);
	});
