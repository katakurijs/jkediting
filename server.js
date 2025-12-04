const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Vote data file path
const VOTES_FILE = path.join(__dirname, 'votes.json');

// Initialize votes file if it doesn't exist
async function initVotesFile() {
  try {
    await fs.access(VOTES_FILE);
  } catch {
    const initialData = {
      "Realest viewer": {},
      "Funniest viewer": {},
      "Most aura viewer": {},
      "Smartest viewer": {},
      "Kindest viewer": {},
      "Richest viewer": {},
      "The best viewer": {}
    };
    await fs.writeFile(VOTES_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Get votes
app.get('/api/votes', async (req, res) => {
  try {
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read votes' });
  }
});

// Cast vote
app.post('/api/vote', async (req, res) => {
  try {
    const { category, viewer } = req.body;
    
    const data = await fs.readFile(VOTES_FILE, 'utf8');
    const votes = JSON.parse(data);
    
    if (!votes[category]) {
      votes[category] = {};
    }
    
    if (!votes[category][viewer]) {
      votes[category][viewer] = 0;
    }
    
    votes[category][viewer]++;
    
    await fs.writeFile(VOTES_FILE, JSON.stringify(votes, null, 2));
    
    res.json({ success: true, votes: votes[category] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save vote' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

app.get('/vote/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'vote.html'));
});

// Start server
initVotesFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Voter server running on http://localhost:${PORT}`);
  });
});