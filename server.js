const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require('path'); // Added missing import for path

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://kutral.github.io", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['https://kutral.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('client/build'));

// Root route for health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoint to get all messages

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

// Import and run the webhook payload processor
const { processPayloads } = require('./webhook-payload-processor');

let db;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to emit WebSocket events
function emitToUser(wa_id, event, data) {
  io.emit(event, { wa_id, ...data });
}

// API Routes

// GET /api/conversations - Fetch all distinct conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME);
    
    // Aggregate to get conversations with last message info
    const conversations = await collection.aggregate([
      {
        $group: {
          _id: '$wa_id',
          wa_id: { $first: '$wa_id' },
          name: { $first: '$contact_name' },
          last_message: { $last: '$text' },
          last_message_timestamp: { $last: '$timestamp' },
          message_count: { $sum: 1 }
        }
      },
      {
        $sort: { last_message_timestamp: -1 }
      }
    ]).toArray();
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversations/:wa_id - Fetch all messages for a conversation
app.get('/api/conversations/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const collection = db.collection(COLLECTION_NAME);
    
    const messages = await collection
      .find({ wa_id })
      .sort({ timestamp: 1 })
      .toArray();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/messages - Send a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { to, text } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({ error: 'Missing required fields: to, text' });
    }
    
    const collection = db.collection(COLLECTION_NAME);
    
    // Generate a unique message ID
    const wamid = `wamid.${uuidv4().replace(/-/g, '').toUpperCase()}`;
    
    const newMessage = {
      wamid,
      from: '918329446654', // Business phone number
      to,
      timestamp: Math.floor(Date.now() / 1000),
      text,
      type: 'text',
      status: 'sent',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await collection.insertOne(newMessage);
    
    // Emit WebSocket event for real-time updates
    emitToUser(to, 'new_message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/webhooks - Handle incoming webhooks (Bonus feature)
app.post('/api/webhooks', async (req, res) => {
  try {
    const payload = req.body;
    const collection = db.collection(COLLECTION_NAME);
    
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
            status: 'sent',
            contact_name: contact?.profile?.name || 'Unknown',
            wa_id: contact?.wa_id,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          await collection.insertOne(messageDoc);
          
          // Emit WebSocket event
          emitToUser(contact?.wa_id, 'new_message', messageDoc);
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
            // Get the updated message to emit
            const updatedMessage = await collection.findOne({ wamid: status.id });
            emitToUser(updatedMessage.wa_id, 'status_update', {
              wamid: status.id,
              status: status.status
            });
          }
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Use the port provided by Render, falling back to 10000 for local development
const PORT = process.env.PORT || 10000;

// API endpoint to get all messages
app.get('/api/messages', async (req, res) => {
  console.log('GET /api/messages request received');
  try {
    const messages = await db.collection(COLLECTION_NAME).find({}).toArray();
    console.log(`Found ${messages.length} messages in database`);
    console.log('Messages:', JSON.stringify(messages, null, 2));
    
    // Enable CORS explicitly for this endpoint
    res.header('Access-Control-Allow-Origin', 'https://kutral.github.io');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    res.json(messages);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function startServer() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB successfully');
    
    // Process sample payloads
    console.log('Starting to process sample payloads...');
    const messages = await processPayloads(db);
    console.log(`Successfully processed ${messages.length} messages`);
    
    // Start the server
    return new Promise((resolve) => {
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        resolve();
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    throw error; // Let Render know there was an error
  }
}

startServer(); 