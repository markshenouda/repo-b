# Notifications Directory

This directory contains notification files automatically generated when the webhook receiver GitHub Action processes incoming webhooks from repo-a.

## File Structure

Each notification file follows the naming pattern: `change-YYYYMMDD-HHMMSS.md`

Example: `change-20240115-143022.md`

## Notification File Format

Each notification file contains:

### Header Information
- **Repository**: Source repository that triggered the webhook
- **Commit**: Full commit SHA that caused the change
- **Author**: Person who made the commit
- **Timestamp**: When the commit was made

### Content Sections

1. **Commit Message**: The original commit message from the source repository
2. **Changed Files**: List of files that were modified in the data folder
3. **Summary**: Explanation of what the notification represents
4. **Actions Required**: Checklist of recommended follow-up actions
5. **Links**: Direct links to view changes, commit details, and source repository

## Automatic Processing

When a webhook is received:

1. A new branch is created with pattern: `data-change-notification-{commit-short}-{timestamp}`
2. A notification file is generated in this directory
3. The file is committed to the new branch
4. A Pull Request is created with detailed information
5. Labels are automatically added: `webhook-notification`, `data-change`, `automated`

## Viewing Notifications

### Via Web Interface
- Browse this directory on GitHub to see all notification files
- Each PR contains a summary of the changes

### Via API Endpoints
If the repo-b application is running:
- `GET /notifications` - List all notifications
- `GET /notifications/{filename}` - View specific notification
- `GET /stats` - View webhook statistics

### Via Command Line
```bash
# List all notification files
ls -la data/notifications/

# View latest notification
cat data/notifications/$(ls -t data/notifications/*.md | head -1)

# Count total notifications
ls data/notifications/*.md 2>/dev/null | wc -l
```

## File Lifecycle

1. **Creation**: Notification file is created when webhook is received
2. **Review**: Team reviews the PR and notification content
3. **Merge**: PR is merged to acknowledge the notification
4. **Archive**: Notification files remain for audit trail

## Troubleshooting

### No Notification Files
- Check if webhooks are being sent from repo-a
- Verify GitHub Actions workflow is running in repo-b
- Check repository secrets and permissions

### Malformed Notification Files
- Review the webhook payload format
- Check GitHub Actions logs for errors
- Verify JSON parsing in the workflow

### Missing Information
- Ensure all required fields are included in webhook payload
- Check that repo-a is sending complete commit information
- Verify file change detection is working correctly

## Best Practices

1. **Regular Review**: Check notifications regularly for important changes
2. **Action Items**: Complete the checklist items in each notification
3. **Documentation**: Update relevant documentation when data changes
4. **Testing**: Test applications after significant data changes
5. **Cleanup**: Periodically archive old notification files if needed

## Integration

These notification files can be integrated with:
- Project management tools (via GitHub API)
- Monitoring systems (via webhook endpoints)
- Documentation systems (via automated updates)
- Testing pipelines (via change detection)