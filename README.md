# repo-b - Target Repository

This is the target repository in a cross-repository webhook system. It receives webhooks from `repo-a` when data folder changes occur and automatically creates notification PRs with change details.

## 🏗️ Architecture

```
repo-a (Source) ──webhook──> repo-b (Target)
     │                           │
     ├─ data/ changes            ├─ receives webhook
     ├─ GitHub Action            ├─ creates PR
     └─ sends notification       └─ logs changes
```

## 📁 Repository Structure

```
repo-b/
├── .github/
│   └── workflows/
│       └── webhook-receiver.yml   # Receives webhooks & creates PRs
├── data/
│   └── notifications/             # 📝 Generated notification files
│       ├── change-YYYYMMDD-HHMMSS.md
│       └── README.md
├── src/
│   └── app.js                     # Demo application
├── package.json
├── .gitignore
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/YOUR_USERNAME/repo-b.git
cd repo-b
npm install
```

### 2. Verify Webhook Reception
The repository is ready to receive webhooks! No additional configuration needed.

### 3. Test Reception
Trigger a webhook from repo-a by modifying files in its `/data` folder, then check:
- Actions tab for "Data Change Notification PR Creator" workflow
- Pull Requests for new notification PRs
- `data/notifications/` folder for generated files

## 🔧 How It Works

### Webhook Reception Process

1. **Webhook Received**: GitHub receives `repository_dispatch` event from repo-a
2. **Branch Creation**: Creates new branch: `data-change-notification-{commit-short}-{timestamp}`
3. **Notification Generation**: Creates markdown file with change details
4. **PR Creation**: Opens Pull Request with comprehensive change information
5. **Labeling**: Adds labels: `webhook-notification`, `data-change`, `automated`

### Generated Notification Format
```markdown
# Data Change Notification

**Repository**: YOUR_USERNAME/repo-a
**Commit**: abc123def456...
**Author**: John Doe
**Timestamp**: 2024-01-15T14:30:22Z

## Commit Message
Update user roles and permissions

## Changed Files
- `data/config/feature-flags.json`
- `data/users/roles.json`

## Links
- [View Changes](https://github.com/...)
- [Commit Details](https://github.com/...)
```

## 📊 Demo Application

Run the demo application to monitor webhook activity:

```bash
npm start
# Visit http://localhost:3001
```

### Available Endpoints
- `GET /` - API overview
- `GET /health` - Health check
- `GET /notifications` - List all received notifications
- `GET /notifications/:filename` - View specific notification
- `GET /stats` - Webhook reception statistics

### Example API Responses

**GET /notifications**
```json
{
  "message": "Notification history",
  "notifications": [
    {
      "filename": "change-20240115-143022.md",
      "title": "Data Change Notification",
      "repository": "YOUR_USERNAME/repo-a",
      "commit": "abc123d",
      "created": "2024-01-15T14:30:22Z",
      "size": 1024
    }
  ],
  "count": 1
}
```

**GET /stats**
```json
{
  "total_notifications": 5,
  "latest_notification": {
    "filename": "change-20240115-143022.md",
    "created": "2024-01-15T14:30:22Z"
  },
  "average_size": 1024,
  "webhook_status": "Active - receiving notifications"
}
```

## 🔍 Monitoring Webhooks

### GitHub Actions Dashboard
- Navigate to Actions tab → "Data Change Notification PR Creator"
- Monitor workflow runs for successful webhook processing
- Check logs for any processing errors

### Pull Request Management
- Review notification PRs with label `webhook-notification`
- Each PR contains detailed change information
- Merge PRs to acknowledge notifications

### Notification Files
```bash
# List all notifications
ls -la data/notifications/

# View latest notification
cat data/notifications/$(ls -t data/notifications/*.md | head -1)

# Count total notifications
ls data/notifications/*.md 2>/dev/null | wc -l
```

## 📈 Webhook Statistics

### Processing Metrics
- **Average Processing Time**: ~30-60 seconds
- **Success Rate**: Monitor via GitHub Actions
- **Storage Usage**: ~1KB per notification file

### Notification Patterns
- **File Naming**: `change-YYYYMMDD-HHMMSS.md`
- **Branch Naming**: `data-change-notification-{commit-short}-{timestamp}`
- **PR Titles**: `🔔 Data Change Notification: {commit-short}`

## 🧪 Testing Webhook Reception

### Manual Testing
1. **Trigger from repo-a**: Make changes to repo-a's `/data` folder
2. **Monitor Actions**: Check GitHub Actions for workflow execution
3. **Verify PR**: Look for new PR with notification details
4. **Check Files**: Confirm notification file was created

### Webhook Simulation
```bash
# Test webhook endpoint manually (requires PAT)
curl -X POST \
  -H "Authorization: token YOUR_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/repo-b/dispatches \
  -d '{
    "event_type": "data_folder_changed",
    "client_payload": {
      "repository": "YOUR_USERNAME/repo-a",
      "commit_sha": "test123456789",
      "commit_message": "Test webhook",
      "author": "Test User",
      "changed_files": ["data/test.json"],
      "timestamp": "2024-01-15T12:00:00Z",
      "compare_url": "https://github.com/test/compare"
    }
  }'
```

## 🔧 Workflow Configuration

### Webhook Receiver Workflow
The `.github/workflows/webhook-receiver.yml` file handles:
- Webhook payload processing
- Branch and file creation
- PR generation with rich formatting
- Error handling and logging

### Key Features
- **Rich PR Descriptions**: Formatted tables and links
- **Automatic Labeling**: Consistent PR categorization
- **File Organization**: Timestamped notification files
- **Error Handling**: Graceful failure management

## 🛠️ Troubleshooting

### No Webhooks Received
```bash
# Check if repo-a is sending webhooks
# Verify repo-a GitHub Actions logs

# Check repository dispatch permissions
# Ensure repo-a has correct target repository settings
```

### Workflow Failures
```bash
# View workflow logs
gh run list --repo YOUR_USERNAME/repo-b --workflow="webhook-receiver.yml"
gh run view RUN_ID --log

# Check for common issues:
# - Branch naming conflicts
# - File permission errors
# - JSON parsing issues
```

### PR Creation Issues
- **Branch Conflicts**: Ensure unique branch names with timestamps
- **Permission Errors**: Verify GitHub token permissions
- **Rate Limiting**: Monitor GitHub API usage

## 📚 Notification File Management

### File Lifecycle
1. **Creation**: Generated when webhook received
2. **Review**: Team reviews PR and notification content
3. **Merge**: PR merged to acknowledge notification
4. **Archive**: Files remain for audit trail

### Cleanup Strategies
```bash
# Archive old notifications (optional)
mkdir -p data/notifications/archive/2024
mv data/notifications/change-2024*.md data/notifications/archive/2024/

# Remove very old notifications (if needed)
find data/notifications/ -name "change-*.md" -mtime +90 -delete
```

## 🔒 Security Considerations

### Webhook Security
- Uses GitHub's `repository_dispatch` for secure delivery
- No external webhook endpoints exposed
- Built-in GitHub authentication and authorization

### Access Control
- Only authorized repositories can trigger webhooks
- GitHub token permissions control access scope
- Audit trail maintained through Git history

## 📊 Integration Opportunities

### External Systems
- **Project Management**: Link notifications to tickets
- **Monitoring**: Alert on critical data changes
- **Documentation**: Auto-update docs based on changes
- **Testing**: Trigger test suites on data modifications

### API Integration
```javascript
// Example: Fetch latest notifications
const response = await fetch('http://localhost:3001/notifications');
const notifications = await response.json();
console.log(`Received ${notifications.count} notifications`);
```

## 📚 Related Documentation

- [Setup Guide](../plans/setup-guide.md) - Complete setup instructions
- [Architecture Plan](../plans/architecture-plan.md) - System design details
- [Test Cases](../tests/webhook-test-cases.md) - Testing procedures
- [Notifications README](data/notifications/README.md) - Notification file details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/webhook-enhancement`
3. Improve webhook processing or notification formatting
4. Test with repo-a webhook triggers
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/repo-b/issues)
- **Webhook Problems**: Check repo-a configuration and logs
- **PR Questions**: Review notification PR templates and formatting

---

**Note**: This repository is designed to work in conjunction with repo-a. Ensure both repositories are properly configured for the webhook system to function correctly.