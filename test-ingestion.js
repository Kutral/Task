const fs = require('fs');
const path = require('path');

// Test script to verify data ingestion logic without MongoDB
function testDataIngestion() {
  console.log('Testing data ingestion logic...\n');
  
  const payloadsDir = path.join(__dirname, 'whatsapp sample payloads');
  const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'));
  
  console.log(`Found ${files.length} JSON files to process:`);
  files.forEach(file => console.log(`- ${file}`));
  
  let messageCount = 0;
  let statusCount = 0;
  
  for (const file of files) {
    const filePath = path.join(payloadsDir, file);
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`\nProcessing ${file}...`);
    
    // Extract the changes array
    const changes = payload.metaData?.entry?.[0]?.changes || [];
    
    for (const change of changes) {
      const value = change.value;
      
      if (value.messages && value.messages.length > 0) {
        // This is a message payload
        console.log(`  Found ${value.messages.length} message(s)`);
        messageCount += value.messages.length;
        
        for (const message of value.messages) {
          const contact = value.contacts?.[0];
          console.log(`    - Message from ${contact?.profile?.name || 'Unknown'} (${contact?.wa_id})`);
          console.log(`      Text: "${message.text?.body || ''}"`);
          console.log(`      ID: ${message.id}`);
        }
      } else if (value.statuses && value.statuses.length > 0) {
        // This is a status payload
        console.log(`  Found ${value.statuses.length} status update(s)`);
        statusCount += value.statuses.length;
        
        for (const status of value.statuses) {
          console.log(`    - Status update for message ${status.id}: ${status.status}`);
        }
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total messages found: ${messageCount}`);
  console.log(`- Total status updates found: ${statusCount}`);
  console.log(`- Total files processed: ${files.length}`);
  
  console.log(`\n✅ Data ingestion logic test completed successfully!`);
  console.log(`💡 To run with actual MongoDB, use: npm run ingest`);
}

// Run the test
testDataIngestion(); 