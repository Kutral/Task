# WhatsApp Chat Interface - Full Stack Developer Evaluation Task

I have given my best to complete the task it is hard , so kindly review the task and give me the opportunity to work with you. A WhatsApp-like chat interface implementation for RapidQuest's Full Stack Developer evaluation. This implementation uses MongoDB Atlas for data storage and is deployed on Render.com for reliable cloud hosting. The application provides real-time chat functionality with a faithful recreation of the WhatsApp Web UI.


## Deployment
- Frontend: GitHub Pages (https://kutral.github.io/Task/)
- Backend: Render.com (https://task-llea.onrender.com)
- Database: MongoDB Atlas

## Features

- Real-time WhatsApp message processing and display
- WhatsApp Web-like interface with authentic styling
- Support for multiple conversations
- Message status tracking (sent, delivered, read)
- Real-time message updates through WebSocket
- Responsive design matching WhatsApp Web
- Cloud deployment with auto-scaling support
- Persistent data storage in MongoDB Atlas

## Tech Stack

### Backend
- Node.js with Express
- MongoDB Atlas for cloud database
- Socket.IO for real-time updates
- WebSocket for bi-directional communication
- Render.com for backend hosting

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
3. Copy `.env.example` to `.env` and configure MongoDB Atlas:
   ```bash
   cp env.example .env
   # Set MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   Server runs on port 10000 by default

### MongoDB Atlas Configuration
1. Create a MongoDB Atlas account
2. Set up a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and add it to .env
6. Database will be auto-initialized on first run

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

## Deployment Details

The application is deployed using a modern cloud stack:

### Frontend Deployment (GitHub Pages)
- URL: https://kutral.github.io/Task/
- Automated deployment via GitHub Actions
- Static hosting with global CDN

### Backend Deployment (Render.com)
- URL: https://task-llea.onrender.com
- Auto-deployment from GitHub main branch
- Zero-downtime deployments
- Automatic SSL/TLS certificates
- Environment variables configured in Render dashboard

### Database (MongoDB Atlas)
- Cloud-hosted MongoDB cluster
- Automatic backups and scaling
- Data replication for high availability
- Secure connection via MongoDB Atlas URI

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
