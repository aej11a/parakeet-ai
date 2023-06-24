CREATE TABLE chats (
  uid VARCHAR(36) PRIMARY KEY,
  user_uid VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255)
);

CREATE TABLE messages (
  uid VARCHAR(36) PRIMARY KEY,
  chat_uid VARCHAR(36) NOT NULL,
  user_uid VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role ENUM('system', 'user', 'assistant') NOT NULL DEFAULT 'user'
);