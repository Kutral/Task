const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

// Mock data based on the sample payloads
const mockMessages = [
  {
    wamid: "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
    from: "919937320320",
    to: "918329446654",
    timestamp: 1754400000,
    text: "Hi, I'd like to know more about your services.",
    type: "text",
    status: "sent",
    contact_name: "Ravi Kumar",
    wa_id: "919937320320",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    wamid: "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=",
    from: "918329446654",
    to: "919937320320",
    timestamp: 1754400020,
    text: "Hi Ravi! Sure, I'd be happy to help you with that. Could you tell me what you're looking for?",
    type: "text",
    status: "read",
    contact_name: "Ravi Kumar",
    wa_id: "919937320320",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    wamid: "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=",
    from: "929967673820",
    to: "918329446654",
    timestamp: 1754401000,
    text: "Hi, I saw your ad. Can you share more details?",
    type: "text",
    status: "sent",
    contact_name: "Neha Joshi",
    wa_id: "929967673820",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    wamid: "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggM0RFNDkxRjEwNDhDQzgwMzk3NzA1ODc1RkU3QzI0MzU=",
    from: "918329446654",
    to: "929967673820",
    timestamp: 1754401020,
    text: "Hi Neha! Absolutely. We offer curated home decor pieces—are you looking for nameplates, wall art, or something else?",
    type: "text",
    status: "delivered",
    contact_name: "Neha Joshi",
    wa_id: "929967673820",
    created_at: new Date(),
    updated_at: new Date()
  }
];

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
    // Group messages by wa_id to get conversations
    const conversationsMap = new Map();
    
    mockMessages.forEach(message => {
      if (!conversationsMap.has(message.wa_id)) {
        conversationsMap.set(message.wa_id, {
          wa_id: message.wa_id,
          name: message.contact_name,
          last_message: message.text,
          last_message_timestamp: message.timestamp,
          message_count: 0
        });
      }
      
      const conversation = conversationsMap.get(message.wa_id);
      conversation.message_count++;
      
      // Update last message if this one is more recent
      if (message.timestamp > conversation.last_message_timestamp) {
        conversation.last_message = message.text;
        conversation.last_message_timestamp = message.timestamp;
      }
    });
    
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.last_message_timestamp - a.last_message_timestamp);
    
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
    const messages = mockMessages
      .filter(msg => msg.wa_id === wa_id)
      .sort((a, b) => a.timestamp - b.timestamp);
    
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
      contact_name: 'Business', // This would be fetched from the conversation
      wa_id: to,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Add to mock data
    mockMessages.push(newMessage);
    
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
          
          mockMessages.push(messageDoc);
          
          // Emit WebSocket event
          emitToUser(contact?.wa_id, 'new_message', messageDoc);
        }
      } else if (value.statuses && value.statuses.length > 0) {
        // This is a status payload
        for (const status of value.statuses) {
          const messageIndex = mockMessages.findIndex(msg => msg.wamid === status.id);
          
          if (messageIndex !== -1) {
            mockMessages[messageIndex].status = status.status;
            mockMessages[messageIndex].updated_at = new Date();
            
            emitToUser(mockMessages[messageIndex].wa_id, 'status_update', {
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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`📱 Frontend should be available at http://localhost:3000`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
}); 