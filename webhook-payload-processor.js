// webhook-payload-processor.js
// Reads WhatsApp webhook payloads and processes them into MongoDB

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Function to process a single message
function processMessage(message, contact) {
    return {
        messageId: message.id,
        from: contact ? contact.wa_id : message.from,
        timestamp: message.timestamp,
        text: message.text?.body,
        type: message.type,
        name: contact?.profile?.name,
    };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://eswar:0DGvxNXN2HH22rHC@cluster0.eupdq4t.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=Cluster0';
const PAYLOADS_DIR = path.join(__dirname, 'whatsapp sample payloads');

async function processPayloads(db) {
    const collection = db.collection('processed_messages');
    
    // Clear existing messages
    await collection.deleteMany({});
    
    const files = fs.readdirSync(PAYLOADS_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
        const filePath = path.join(PAYLOADS_DIR, file);
        const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (payload.payload_type === 'whatsapp_webhook') {
            const entry = payload.metaData.entry[0];
            const contact = entry.changes[0].value.contacts?.[0];
            const messages = entry.changes[0].value.messages || [];
            
            for (const message of messages) {
                const processedMessage = processMessage(message, contact);
                await collection.insertOne(processedMessage);
            }
        }
    }
    
    return await collection.find({}).toArray();
}

module.exports = { processPayloads };
      const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (file.includes('message')) {
        // Insert new message, exclude _id from $set
        const { _id, ...payloadWithoutId } = payload;
        await collection.updateOne(
          { id: payload.id || payload.meta_msg_id },
          { $set: { ...payloadWithoutId, status: 'sent' } },
          { upsert: true }
        );
        console.log(`Inserted/updated message: ${file}`);
      } else if (file.includes('status')) {
        // Update status
        const id = payload.id || payload.meta_msg_id;
        if (id && payload.status) {
          await collection.updateOne(
            { id },
            { $set: { status: payload.status } }
          );
          console.log(`Updated status for message: ${id} to ${payload.status}`);
        }
      }
    }
    console.log('Processing complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}
