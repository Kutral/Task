# WhatsApp Chat Interface - Full Stack Developer Evaluation Task

A WhatsApp-like chat interface implementation for RapidQuest's Full Stack Developer evaluation. The task involves creating a real-time chat interface that processes and displays WhatsApp messages with a focus on real-time updates and a faithful recreation of the WhatsApp Web UI.

## Features

- Real-time WhatsApp message processing and display
- WhatsApp Web-like interface with authentic styling
- Support for multiple conversations
- Message status tracking (sent, delivered, read)
- Real-time message updates through WebSocket
- Responsive design matching WhatsApp Web

## Tech Stack

### Backend
- Node.js with Express
- MongoDB for message storage
- Socket.IO for real-time updates
- WebSocket for bi-directional communication

### Frontend
- React.js with Hooks
- Socket.IO Client
- CSS3 with WhatsApp Web styling
- Modern JavaScript (ES6+)

## Setup and Installation

### Backend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp env.example .env
   # Set MONGODB_URI in .env
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   Server runs on port 10000 by default

### Frontend Setup
1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm start
   ```
   Frontend runs on port 3000 by default

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js        # Main application component
│   │   └── index.js      # Entry point
│   └── package.json
├── whatsapp sample payloads/  # Sample webhook data
├── server.js              # Express server setup
├── webhook-payload-processor.js  # WhatsApp webhook processing
└── package.json
```

## API Endpoints

- `POST /webhook` - Receive WhatsApp webhook updates
- `GET /api/messages` - Get all messages
- `GET /api/conversations` - Get all conversations

## Live Demo

The application is deployed and can be accessed at:
- Frontend: https://kutral.github.io/Task/
- Backend: https://task-llea.onrender.com

## 🔧 API Endpoints

### Conversations
- `GET /api/conversations` - Fetch all conversations
- `GET /api/conversations/:wa_id` - Fetch messages for a conversation

### Messages
- `POST /api/messages` - Send a new message
- `POST /api/webhooks` - Handle incoming webhooks (bonus feature)

## 🎯 Features in Detail

### Real-time Messaging
- WebSocket connection for instant message delivery
- Optimistic UI updates for better user experience
- Automatic message status updates

### Message Status Indicators
- Single grey tick (✓) for sent messages
- Double grey ticks (✓✓) for delivered messages
- Double blue ticks (✓✓) for read messages

### Responsive Design
- Desktop: Two-pane layout (conversation list + chat window)
- Mobile: Adaptive layout with touch-friendly interface
- Cross-browser compatibility

### Data Management
- MongoDB integration for persistent storage
- Efficient data aggregation for conversation lists
- Real-time database updates via webhooks

## 🚀 Deployment

### Deploy to Heroku
1. Create a Heroku account and install Heroku CLI
2. Set up MongoDB Atlas cluster
3. Configure environment variables in Heroku dashboard
4. Deploy using Heroku Git integration

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Environment Variables for Production
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=production
PORT=5000
```

## 🧪 Testing

### Backend Testing
```bash
# Test API endpoints
curl http://localhost:5000/api/conversations
```

### Frontend Testing
```bash
cd client
npm test
```

## 🔍 Sample Data

The application includes sample WhatsApp webhook payloads that demonstrate:
- Message payloads with contact information
- Status update payloads
- Multiple conversations with different users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WhatsApp Web for UI inspiration
- Socket.IO for real-time communication
- MongoDB for data persistence
- React team for the amazing framework

## 📞 Support

For support, email support@whatsapp-clone.com or create an issue in the repository.

---

**Note**: This is a demonstration project and is not affiliated with WhatsApp Inc. Use responsibly and in accordance with WhatsApp's terms of service. 