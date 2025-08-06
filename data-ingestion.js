const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

async function ingestData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing data');
    
    const payloadsDir = path.join(__dirname, 'whatsapp sample payloads');
    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} JSON files to process`);
    
    for (const file of files) {
      const filePath = path.join(payloadsDir, file);
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`Processing ${file}...`);
      
      // Extract the changes array
      const changes = payload.metaData?.entry?.[0]?.changes || [];
      
      for (const change of changes) {
        const value = change.value;
        
        if (value.messages && value.messages.length > 0) {
          // This is a message payload
          for (const message of value.messages) {
            const contact = value.contacts?.[0];
            
            const messageDoc = {
              wamid: message.id,
              from: message.from,
              to: value.metadata?.display_phone_number,
              timestamp: parseInt(message.timestamp),
              text: message.text?.body || '',
              type: message.type,
              status: 'sent', // Default status
              contact_name: contact?.profile?.name || 'Unknown',
              wa_id: contact?.wa_id,
              created_at: new Date(),
              updated_at: new Date()
            };
            
            await collection.insertOne(messageDoc);
            console.log(`Inserted message: ${messageDoc.wamid}`);
          }
        } else if (value.statuses && value.statuses.length > 0) {
          // This is a status payload
          for (const status of value.statuses) {
            const result = await collection.updateOne(
              { wamid: status.id },
              { 
                $set: { 
                  status: status.status,
                  updated_at: new Date()
                }
              }
            );
            
            if (result.matchedCount > 0) {
              console.log(`Updated status for message ${status.id} to ${status.status}`);
            } else {
              console.log(`Warning: No message found with wamid ${status.id}`);
            }
          }
        }
      }
    }
    
    console.log('Data ingestion completed successfully!');
    
    // Print summary
    const totalMessages = await collection.countDocuments();
    console.log(`Total messages in database: ${totalMessages}`);
    
  } catch (error) {
    console.error('Error during data ingestion:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the ingestion script
ingestData().catch(console.error); 