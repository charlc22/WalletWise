// test_connection.js
// Quick script to test MongoDB connection

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('✗ MONGODB_URI not found in environment variables');
    console.log('Please set MONGODB_URI in your .env file or environment');
    process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('\n✓ Successfully connected to MongoDB!\n');

        // Get database stats
        const User = require('./server/models/User');
        const BankStatement = require('./server/models/BankStatement');

        try {
            const userCount = await User.countDocuments();
            const statementCount = await BankStatement.countDocuments();
            const processedStatements = await BankStatement.countDocuments({ isProcessed: true });

            console.log('Database Statistics:');
            console.log('─────────────────────');
            console.log(`Total Users:       ${userCount}`);
            console.log(`Total Statements:  ${statementCount}`);
            console.log(`Processed:         ${processedStatements}`);
            console.log(`Pending:           ${statementCount - processedStatements}`);

            // Check if collections have indexes
            const userIndexes = await User.collection.getIndexes();
            const stmtIndexes = await BankStatement.collection.getIndexes();

            console.log('\nIndexes:');
            console.log('─────────────────────');
            console.log(`Users:      ${Object.keys(userIndexes).length} indexes`);
            console.log(`Statements: ${Object.keys(stmtIndexes).length} indexes`);

            console.log('\n✓ Database is healthy and ready!\n');
        } catch (err) {
            console.error('Error querying database:', err.message);
        }

        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error('\n✗ Connection failed:', err.message);
        console.log('\nPossible issues:');
        console.log('1. Check your MONGODB_URI is correct');
        console.log('2. Verify network access (IP whitelist) in MongoDB Atlas');
        console.log('3. Ensure username and password are correct');
        console.log('4. Check if password needs URL encoding (special characters)');
        process.exit(1);
    });
