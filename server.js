const express = require('express');
const path = require('path');
const fs = require('fs').promises;
require("dotenv").config();
const session = require("express-session");
const UAParser = require("ua-parser-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", true);

app.use(
  session({
    secret: "jk67",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(express.urlencoded({ extended: true }));

// Vote data file path
const VOTES_FILE = path.join(__dirname, 'votes.json');

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// SEND EMAIL FUNCTION
async function sendVisitorEmail(message) {
  try {
    await resend.emails.send({
      from: "Website Alerts <onboarding@resend.dev>",
      to: process.env.SEND_TO,
      subject: "New Visitor",
      text: message,
    });
  } catch (error) {
    console.error("Resend email error:", error);
  }
}

// IP INFO API
async function getIPInfo(ip) {
  try {
    const clean = ip.split(",")[0].trim();
    const res = await axios.get(`https://ipapi.co/${clean}/json/`);
    return res.data;
  } catch {
    return null;
  }
}
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

app.get('/vote/:id', async (req, res) => {
  const ipRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ip = req.headers["x-real-ip"] || req.ip;

  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();

  const ipInfo = await getIPInfo(ip);

  const message = `
New Visitor:

IP: ${ip}
Country: ${ipInfo?.country_name || "Unknown"}
City: ${ipInfo?.city || "Unknown"}

Device: ${ua.device.type || "Desktop"}
Browser: ${ua.browser.name || "Unknown"}
OS: ${ua.os.name || "Unknown"}

Page: /
Referer: ${req.headers.referer || "Direct"}
Time: ${new Date().toISOString()}
`;

  sendVisitorEmail(message);
  res.sendFile(path.join(__dirname, 'public', 'views', 'vote.html'));
});

// Start server
initVotesFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Voter server running on http://localhost:${PORT}`);
  });
});