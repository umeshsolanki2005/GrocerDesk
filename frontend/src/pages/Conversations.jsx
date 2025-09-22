import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import { Send, Search } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Simple localStorage-backed conversations for staff communication
// In a real app, this would be WebSocket/Server driven.

const STORAGE_KEY = 'grocerdesk_conversations';
const UNREAD_KEY = 'grocerdesk_conversations_unread';

const Conversations = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const loadMessages = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setMessages(parsed);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadMessages();
    // Clear unread on open
    localStorage.setItem(UNREAD_KEY, '0');
    // Listen for cross-tab updates
    const handler = (e) => {
      if (e.key === STORAGE_KEY) loadMessages();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const saveMessages = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setMessages(items);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      author: user?.name || 'Unknown',
      role: user?.role || 'staff',
      text: input.trim(),
      ts: new Date().toISOString(),
    };
    const next = [...messages, msg];
    saveMessages(next);
    setInput('');
    
    // Increment unread count for other tabs/users
    const currentUnread = parseInt(localStorage.getItem(UNREAD_KEY) || '0');
    localStorage.setItem(UNREAD_KEY, (currentUnread + 1).toString());
  };

  const filtered = messages.filter((m) =>
    m.text.toLowerCase().includes(search.toLowerCase()) ||
    (m.author || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Staff Conversations
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><Search /></InputAdornment>
            )}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map((m) => (
              <React.Fragment key={m.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`${m.author} (${m.role})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {new Date(m.ts).toLocaleString()}
                        </Typography>
                        {` — ${m.text}`}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <Typography color="text.secondary" textAlign="center" sx={{ my: 2 }}>
                No messages yet
              </Typography>
            )}
          </List>

          <Box display="flex" gap={1} mt={2}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            />
            <Button variant="contained" endIcon={<Send />} onClick={sendMessage}>
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Conversations;
