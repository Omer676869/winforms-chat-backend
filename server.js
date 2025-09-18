const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: random 5-digit ID
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

// Export app for Vercel
module.exports = app;
