import React from 'react';
import './ConversationList.css';

const ConversationList = ({ conversations, selectedConversation, onConversationSelect }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>Chats</h2>
      </div>
      <div className="conversation-items">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.wa_id}
              className={`conversation-item ${
                selectedConversation?.wa_id === conversation.wa_id ? 'selected' : ''
              }`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="conversation-avatar">
                <div className="avatar-circle">
                  {conversation.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="conversation-content">
                <div className="conversation-name">
                  {conversation.name}
                </div>
                <div className="conversation-preview">
                  {truncateText(conversation.last_message || 'No messages yet')}
                </div>
              </div>
              <div className="conversation-time">
                {conversation.last_message_timestamp && 
                  formatTime(conversation.last_message_timestamp)
                }
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList; 