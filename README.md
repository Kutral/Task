# WhatsApp Web Clone

A complete, production-ready WhatsApp Web clone built with Node.js, Express, React, and MongoDB. Features real-time messaging, status updates, and a responsive design that mimics the original WhatsApp Web interface.

## 🚀 Features

- **Real-time Messaging**: WebSocket integration for instant message delivery
- **Status Updates**: Message status indicators (sent, delivered, read)
- **Responsive Design**: Mobile-friendly interface
- **Conversation Management**: List and manage multiple conversations
- **Message History**: Persistent message storage in MongoDB
- **Webhook Support**: Handle incoming WhatsApp webhooks
- **Modern UI**: WhatsApp Web-like interface with smooth animations

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **Socket.IO** for real-time communication
- **CORS** enabled for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **Socket.IO Client** for real-time updates
- **CSS3** with responsive design
- **Modern JavaScript** (ES6+)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd whatsapp-web-clone
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your MongoDB connection string
# For local MongoDB: MONGODB_URI=mongodb://localhost:27017
# For MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### 4. Run Data Ingestion Script
```bash
# This will populate the database with sample data
npm run ingest
```

### 5. Start the Development Server
```bash
# Start the backend server (from root directory)
npm run dev

# In a new terminal, start the frontend (from root directory)
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
whatsapp-web-clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main App component
│   │   └── App.css        # Main styles
│   └── package.json
├── whatsapp sample payloads/  # Sample webhook data
├── server.js              # Express server
├── data-ingestion.js      # Data migration script
├── package.json           # Backend dependencies
└── README.md
```

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