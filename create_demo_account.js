// create_demo_account.js
// Creates a demo account for employer demonstrations

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createDemoAccount() {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error('✗ MONGODB_URI not found in environment variables');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected\n');

        const User = require('./server/models/User');

        // Prompt for demo account details
        console.log('=== Create Demo Account ===\n');

        const useDefaults = await question('Use default demo credentials? (y/n): ');

        let email, password, name;

        if (useDefaults.toLowerCase() === 'y') {
            email = 'demo@walletwise.com';
            password = 'DemoPass123!';
            name = 'Demo User';
        } else {
            email = await question('Email: ');
            password = await question('Password: ');
            name = await question('Name: ');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('\n⚠️  User already exists with this email');
            const overwrite = await question('Delete and recreate? (y/n): ');

            if (overwrite.toLowerCase() === 'y') {
                await User.deleteOne({ email });
                console.log('✓ Existing user deleted');
            } else {
                console.log('Cancelled');
                rl.close();
                await mongoose.disconnect();
                process.exit(0);
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const demoUser = new User({
            email,
            password: hashedPassword,
            name
        });

        await demoUser.save();

        console.log('\n✓ Demo account created successfully!\n');
        console.log('─────────────────────────────────');
        console.log('Demo Credentials:');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Name:     ${name}`);
        console.log('─────────────────────────────────\n');

        console.log('Add this to your README.md:\n');
        console.log('```markdown');
        console.log('## 🚀 Live Demo\n');
        console.log('**Demo Credentials**:');
        console.log(`- Email: ${email}`);
        console.log(`- Password: ${password}`);
        console.log('```\n');

        rl.close();
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('✗ Error creating demo account:', error.message);
        rl.close();
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the script
createDemoAccount();
