const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let MONGODB_URI = "";

envContent.split('\n').forEach(line => {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.substring(line.indexOf('=') + 1).replace(/"/g, '').trim();
    }
});

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function clearOrders() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        // Reference collections by name to avoid needing full model definitions
        const db = mongoose.connection.db;

        console.log('Deleting orders...');
        const orderResult = await db.collection('orders').deleteMany({});
        console.log(`Successfully deleted ${orderResult.deletedCount} orders.`);

        console.log('Deleting notifications...');
        const notificationResult = await db.collection('notifications').deleteMany({});
        console.log(`Successfully deleted ${notificationResult.deletedCount} notifications.`);

        // Also check for any other order-linked data if necessary
        // For example, if there were specialized transaction logs or shipping logs

        console.log('Database cleanup completed successfully.');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

clearOrders();
