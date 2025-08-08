// webhook-payload-processor.js
// Reads WhatsApp webhook payloads and processes them into MongoDB

const fs = require('fs');
const path = require('path');

const PAYLOADS_DIR = path.join(__dirname, 'whatsapp sample payloads');

// Process messages webhook
async function processMessagesWebhook(collection, entry) {
  const value = entry.changes[0].value;
  if (value.messages) {
    for (const message of value.messages) {
      const contact = value.contacts?.[0];
      const processedMessage = {
        id: message.id,
        from: message.from,
        timestamp: parseInt(message.timestamp),
        text: message.text?.body,
        type: message.type,
        name: contact?.profile?.name || message.from,
        status: 'sent',
        wa_id: contact?.wa_id
      };
      await collection.updateOne(
        { id: message.id },
        { $set: processedMessage },
        { upsert: true }
      );
      console.log(`Processed message:`, JSON.stringify(processedMessage, null, 2));
    }
  }
}

// Process status webhook
async function processStatusWebhook(collection, entry) {
  const value = entry.changes[0].value;
  if (value.statuses) {
    for (const status of value.statuses) {
      await collection.updateOne(
        { id: status.id },
        { $set: { status: status.status } }
      );
      console.log(`Updated status for message ${status.id} to ${status.status}`);
    }
  }
}

// Main function to process all payloads
async function processPayloads(db) {
  const collection = db.collection('processed_messages');
  
  // Clear existing messages
  await collection.deleteMany({});
  console.log('Cleared existing messages');
  
  const files = fs.readdirSync(PAYLOADS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} payload files to process`);
  
  // Process files sequentially to maintain order
  for (const file of files) {
    try {
      const filePath = path.join(PAYLOADS_DIR, file);
      console.log(`Processing file: ${file}`);
      
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (payload.payload_type === 'whatsapp_webhook') {
        const entry = payload.metaData.entry[0];
        const value = entry.changes[0].value;
        
        if (value.messages) {
          await processMessagesWebhook(collection, entry);
        } else if (value.statuses) {
          await processStatusWebhook(collection, entry);
        }
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  }

  const messages = await collection.find({}).toArray();
  console.log(`Successfully processed ${messages.length} messages`);
  return messages;
}

module.exports = { processPayloads };
