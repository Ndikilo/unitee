require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_app');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const showDatabaseInfo = async () => {
  try {
    await connectDB();

    console.log('\n🗄️  DATABASE STORAGE INFORMATION');
    console.log('=====================================');
    
    // Get database name and connection info
    const dbName = mongoose.connection.db.databaseName;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;
    
    console.log(`📍 Database Location:`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database Name: ${dbName}`);
    console.log(`   Full URI: mongodb://${host}:${port}/${dbName}`);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Collections (Tables) in Database:`);
    console.log(`   Total Collections: ${collections.length}`);
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   📁 ${collectionName}: ${count} documents`);
    }

    // Show detailed data for each collection
    console.log(`\n📋 DETAILED DATA BREAKDOWN:`);
    console.log('=====================================');

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      
      if (count > 0) {
        console.log(`\n📁 Collection: ${collectionName.toUpperCase()}`);
        console.log(`   Documents: ${count}`);
        
        // Get sample document to show structure
        const sampleDoc = await mongoose.connection.db.collection(collectionName).findOne();
        if (sampleDoc) {
          console.log(`   Sample Structure:`);
          const keys = Object.keys(sampleDoc);
          keys.forEach(key => {
            const value = sampleDoc[key];
            const type = Array.isArray(value) ? 'Array' : typeof value;
            console.log(`     • ${key}: ${type}`);
          });
        }
      }
    }

    // Show storage size information
    const stats = await mongoose.connection.db.stats();
    console.log(`\n💾 STORAGE STATISTICS:`);
    console.log('=====================================');
    console.log(`   Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total Documents: ${stats.objects}`);
    console.log(`   Average Document Size: ${stats.avgObjSize} bytes`);

    // Show physical file location (MongoDB data directory)
    console.log(`\n📂 PHYSICAL FILE LOCATION:`);
    console.log('=====================================');
    console.log(`   MongoDB typically stores data in:`);
    console.log(`   Windows: C:\\data\\db\\`);
    console.log(`   Linux/Mac: /data/db/`);
    console.log(`   Or custom path specified in MongoDB config`);
    console.log(`   \n   Your database files are named:`);
    console.log(`   • ${dbName}.0, ${dbName}.1, etc. (data files)`);
    console.log(`   • ${dbName}.ns (namespace file)`);
    console.log(`   • journal/ folder (transaction logs)`);

    console.log(`\n🔧 HOW TO ACCESS YOUR DATA:`);
    console.log('=====================================');
    console.log(`   1. MongoDB Compass (GUI): mongodb://${host}:${port}/${dbName}`);
    console.log(`   2. MongoDB Shell: mongosh "mongodb://${host}:${port}/${dbName}"`);
    console.log(`   3. This Node.js app: Already connected!`);
    console.log(`   4. Backup command: mongodump --db ${dbName}`);
    console.log(`   5. Restore command: mongorestore --db ${dbName} dump/${dbName}/`);

    process.exit(0);
  } catch (error) {
    console.error('Error showing database info:', error);
    process.exit(1);
  }
};

showDatabaseInfo();