const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // for SUPABASE_URL + SUPABASE_KEY

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = "https://mmppzofgrysuolikhxqo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcHB6b2ZncnlzdW9saWtoeHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzI3NTcsImV4cCI6MjA3MzgwODc1N30.eUx2QjwY2brQQ9_8z0NL6r9Sh5XT9VvXaJHv1vJMcmE";
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate random 5-digit ID
function generateId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// Register user
app.get('/api/register', async (req, res) => {
  const user_id = generateId();
  const { error } = await supabase.from('users').insert({ user_id });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: user_id });
});

// Send public message
app.post('/api/messages/public', async (req, res) => {
  const { userId, text } = req.body;
  const { data, error } = await supabase.from('public_messages').insert({ user_id: userId, text }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Get public messages
app.get('/api/messages/public', async (req, res) => {
  const { data, error } = await supabase.from('public_messages').select('*').order('timestamp', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add friend
app.post('/api/friends/add', async (req, res) => {
  const { userId, friendId } = req.body;
  const { error } = await supabase.from('friends').insert({ user_id: userId, friend_id: friendId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: 'ok' });
});

// Send private message
app.post('/api/messages/private', async (req, res) => {
  const { senderId, recipientId, text } = req.body;
  const { data, error } = await supabase.from('private_messages').insert({ sender_id: senderId, recipient_id: recipientId, text }).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Get private messages
app.get('/api/messages/private', async (req, res) => {
  const { user, friend } = req.query;
  const { data, error } = await supabase
    .from('private_messages')
    .select('*')
    .or(`and(sender_id.eq.${user},recipient_id.eq.${friend}),and(sender_id.eq.${friend},recipient_id.eq.${user})`)
    .order('timestamp', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(3000, () => console.log('Server running'));
