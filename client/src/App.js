import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://task-llea.onrender.com' : 'http://localhost:5000';

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Fetch messages on mount
    fetchMessages();

    return () => {
      newSocket.close();
    };
  }, []);

  // Fallback: inject sample messages if conversations are empty after loading
  useEffect(() => {
    if (!loading && conversations.length === 0) {
      const sampleMessages = [
        {
          id: "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
          from: "919937320320",
          timestamp: 1754400000,
          text: "Hi, I'd like to know more about your services.",
          type: "text",
          name: "Ravi Kumar",
          status: "sent",
          wa_id: "919937320320"
        },
        {
          id: "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=",
          from: "918329446654",
          timestamp: 1754400020,
          text: "Hi Ravi! Sure, I'd be happy to help you with that. Could you tell me what you're looking for?",
          type: "text",
          name: "Ravi Kumar",
          status: "read",
          wa_id: "919937320320"
        },
        {
          id: "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=",
          from: "929967673820",
          timestamp: 1754401000,
          text: "Hi, I saw your ad. Can you share more details?",
          type: "text",
          name: "Neha Joshi",
          status: "sent",
          wa_id: "929967673820"
        },
        {
          id: "wamid.HBgMOTI5OTY3NjczODIwFQIAEhggM0RFNDkxRjEwNDhDQzgwMzk3NzA1ODc1RkU3QzI0MzU=",
          from: "918329446654",
          timestamp: 1754401030,
          text: "Hi Neha! Absolutely. We offer curated home decor pieces—are you looking for nameplates, wall art, or something else?",
          type: "text",
          name: "Neha Joshi",
          status: "delivered",
          wa_id: "929967673820"
        }
      ];
      // Group messages by wa_id
      const conversationGroups = sampleMessages.reduce((groups, msg) => {
        const phoneNumber = msg.wa_id;
        if (!groups[phoneNumber]) {
          groups[phoneNumber] = {
            id: phoneNumber,
            name: msg.name,
            messages: []
          };
        }
        groups[phoneNumber].messages.push(msg);
        return groups;
      }, {});
      const conversationList = Object.values(conversationGroups);
      setConversations(conversationList);
      setMessages(conversationList[0]?.messages || []);
      setSelectedConversation(conversationList[0] || null);
    }
  }, [loading, conversations]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      console.log('Fetching messages from:', `${API_BASE_URL}/api/messages`);
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received messages:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array of messages, got:', typeof data);
        return;
      }
      
      // Group messages by conversation (wa_id or from number)
      const conversationsMap = data.reduce((acc, message) => {
        const conversationId = message.wa_id || message.from;
        if (!acc[conversationId]) {
          acc[conversationId] = {
            id: conversationId,
            name: message.name || conversationId,
            messages: []
          };
        }
        acc[conversationId].messages.push(message);
        acc[conversationId].messages.sort((a, b) => a.timestamp - b.timestamp);
        return acc;
      }, {});

      const conversationsList = Object.values(conversationsMap);
      console.log('Processed conversations:', conversationsList);
      setConversations(conversationsList);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (data) => {
      if (data.wa_id === selectedConversation?.wa_id) {
        setMessages(prev => [...prev, data]);
      }
      // Update conversations list
      fetchConversations();
    });

    // Listen for status updates
    socket.on('status_update', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.wamid === data.wamid 
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });

    return () => {
      socket.off('new_message');
      socket.off('status_update');
    };
  }, [socket, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`);
      const data = await response.json();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (wa_id) => {
    try {
      const conversation = conversations.find(c => c.id === wa_id);
      if (conversation) {
        setMessages(conversation.messages);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchConversationMessages(conversation.id);
  };

  const handleSendMessage = (message, isSampleMessages = false) => {
    if (isSampleMessages && Array.isArray(message)) {
      setMessages(message);
      // Group messages by conversation
      const conversationGroups = message.reduce((groups, msg) => {
        const phoneNumber = msg.wa_id;
        if (!groups[phoneNumber]) {
          groups[phoneNumber] = {
            phoneNumber,
            name: msg.name,
            lastMessage: msg.text,
            timestamp: msg.timestamp
          };
        } else if (msg.timestamp > groups[phoneNumber].timestamp) {
          groups[phoneNumber].lastMessage = msg.text;
          groups[phoneNumber].timestamp = msg.timestamp;
        }
        return groups;
      }, {});
      
      const conversationList = Object.values(conversationGroups);
      setConversations(conversationList);
      if (conversationList.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationList[0]);
      }
      return;
    }

    if (selectedConversation) {
      const newMessage = {
        text: message,
        from: '918329446654', // Business number
        timestamp: Math.floor(Date.now() / 1000),
        type: 'text',
        status: 'sent',
        wa_id: selectedConversation.phoneNumber
      };
      
      setMessages([...messages, newMessage]);
      if (socket) {
        socket.emit('message', newMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading WhatsApp Web...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="whatsapp-container">
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
        />
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App; 