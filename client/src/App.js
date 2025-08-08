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

    // Fetch conversations on mount
    fetchConversations();

    return () => {
      newSocket.close();
    };
  }, []);

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

  const fetchMessages = async (wa_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${wa_id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.wa_id);
  };

  const handleSendMessage = async (text) => {
    if (!selectedConversation || !text.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedConversation.wa_id,
          text: text.trim()
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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