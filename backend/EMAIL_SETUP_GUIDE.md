# Email Configuration Setup Guide

## Gmail SMTP Configuration

To enable email notifications in your GameBazaar application, you'll need to configure Gmail SMTP settings.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. In Google Account Security settings
2. Go to "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character password

### Step 3: Update Environment Variables
Edit your `.env` file in the backend folder and update these values:

```bash
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=GameBazaar <your_gmail@gmail.com>
```

### Example Configuration
```bash
# Replace with your actual Gmail credentials
EMAIL_USERNAME=gamebazaar.notifications@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=GameBazaar <gamebazaar.notifications@gmail.com>
```

### Step 4: Test Email Functionality
After updating the configuration:
1. Restart your backend server
2. Register a new user to test welcome email
3. Place an order to test order confirmation email
4. Approve an order (as admin) to test approval email

### Email Types Implemented
1. **Welcome Email** - Sent when users register
2. **Order Confirmation** - Sent when orders are placed
3. **Payment Confirmation** - Sent when payment is processed
4. **Order Status Updates** - Sent when admin changes order status:
   - Approved
   - Processing
   - Shipped
   - Delivered
   - Cancelled

### Troubleshooting

#### Authentication Error: "Username and Password not accepted"
If you see this error, it means Gmail is rejecting your credentials. To fix:

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the setup process

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/security
   - Click "App passwords" (only visible after 2FA is enabled)
   - Select "Mail" and your device/app name
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
   - Use this App Password in your `.env` file, NOT your regular Gmail password

3. **Update your .env file**:
   ```bash
   EMAIL_PASSWORD=your_16_character_app_password_here
   ```

#### Other Common Issues
- Make sure 2FA is enabled on your Google account
- Use App Password, not your regular Gmail password
- Check that "Less secure app access" is NOT enabled (use App Password instead)
- Verify the EMAIL_USERNAME matches your Gmail address exactly
- Check server logs for email sending errors
- Remove any spaces from the App Password when copying to .env

### Security Notes
- Never commit your actual email credentials to version control
- Use environment variables for sensitive information
- Consider using a dedicated email account for application notifications
- In production, consider using professional email services like SendGrid or AWS SES
