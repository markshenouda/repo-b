const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to repo-b - Target Repository',
    description: 'This repository receives webhooks from repo-a and creates notification PRs',
    endpoints: {
      '/': 'This endpoint',
      '/health': 'Health check',
      '/notifications': 'View notification history',
      '/notifications/:id': 'View specific notification',
      '/stats': 'Webhook statistics'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    role: 'webhook_receiver'
  });
});

app.get('/notifications', (req, res) => {
  try {
    const notificationsDir = path.join(__dirname, '../data/notifications');
    
    if (!fs.existsSync(notificationsDir)) {
      return res.json({
        message: 'No notifications directory found',
        notifications: [],
        count: 0
      });
    }
    
    const files = fs.readdirSync(notificationsDir)
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => b.localeCompare(a)); // Sort by filename (newest first)
    
    const notifications = files.map(file => {
      const filePath = path.join(notificationsDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract basic info from markdown content
      const lines = content.split('\n');
      const titleMatch = lines.find(line => line.startsWith('# '));
      const repoMatch = lines.find(line => line.includes('**Repository**:'));
      const commitMatch = lines.find(line => line.includes('**Commit**:'));
      
      return {
        filename: file,
        title: titleMatch ? titleMatch.replace('# ', '') : 'Data Change Notification',
        repository: repoMatch ? repoMatch.split(':')[1].trim() : 'Unknown',
        commit: commitMatch ? commitMatch.split(':')[1].trim().substring(0, 7) : 'Unknown',
        created: stats.birthtime,
        size: stats.size
      };
    });
    
    res.json({
      message: 'Notification history',
      notifications: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to read notifications',
      message: error.message
    });
  }
});

app.get('/notifications/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../data/notifications', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Notification not found',
        filename: filename
      });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    
    res.json({
      filename: filename,
      content: content,
      created: stats.birthtime,
      modified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to read notification file',
      message: error.message
    });
  }
});

app.get('/stats', (req, res) => {
  try {
    const notificationsDir = path.join(__dirname, '../data/notifications');
    
    if (!fs.existsSync(notificationsDir)) {
      return res.json({
        total_notifications: 0,
        latest_notification: null,
        average_size: 0,
        webhook_status: 'No notifications received'
      });
    }
    
    const files = fs.readdirSync(notificationsDir)
      .filter(file => file.endsWith('.md'));
    
    if (files.length === 0) {
      return res.json({
        total_notifications: 0,
        latest_notification: null,
        average_size: 0,
        webhook_status: 'No notifications received'
      });
    }
    
    const stats = files.map(file => {
      const filePath = path.join(notificationsDir, file);
      return fs.statSync(filePath);
    });
    
    const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0);
    const latestFile = files.sort((a, b) => b.localeCompare(a))[0];
    const latestStats = fs.statSync(path.join(notificationsDir, latestFile));
    
    res.json({
      total_notifications: files.length,
      latest_notification: {
        filename: latestFile,
        created: latestStats.birthtime
      },
      average_size: Math.round(totalSize / files.length),
      total_size: totalSize,
      webhook_status: 'Active - receiving notifications'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to calculate statistics',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`repo-b server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see available endpoints`);
});