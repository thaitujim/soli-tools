# Soli Tools - Simple Google Sheets Web App

A lightweight, client-side web application that reads and writes data to Google Sheets using Google Apps Script. No backend server required!

## Features

✅ **Client-Side Only** - Pure JavaScript, no server needed  
✅ **Google Sheets Integration** - Store data directly in Google Sheets  
✅ **Simple Authentication** - Hardcoded username/password login  
✅ **Real-Time Data Sync** - Read and write to Google Sheets instantly  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Session Management** - 24-hour session timeout with localStorage  

## Project Structure

```
soli-tools/
├── index.html              # Main HTML file with login & app UI
├── css/
│   └── style.css          # Styling for the application
├── js/
│   ├── config.js          # Configuration (credentials, sheet ID, API URL)
│   ├── auth.js            # Authentication & session management
│   └── app.js             # Main application logic
├── apps-script.gs         # Google Apps Script code
└── README.md              # This file
```

## Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
4. Make sure there's a sheet named "Data" with headers: `name`, `email`, `message`, `timestamp`

### Step 2: Set Up Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete the default code
4. Copy the contents of `apps-script.gs` into the editor
5. Click **Deploy > New Deployment**
6. Select type: **Web app**
7. Set:
   - Execute as: Your Google Account
   - Who has access: Anyone
8. Click **Deploy** and copy the Deployment ID

### Step 3: Configure the Application

1. Open `js/config.js`
2. Replace `{DEPLOYMENT_ID}` with your Google Apps Script Deployment ID:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/userweb/exec'
   ```
3. Replace `YOUR_GOOGLE_SHEET_ID` with your Sheet ID:
   ```javascript
   SHEET_ID: 'YOUR_GOOGLE_SHEET_ID'
   ```

### Step 4: Add/Modify Users

Edit the `USERS` object in `js/config.js`:

```javascript
USERS: {
    'admin': 'password123',
    'user': 'user123',
    'yourname': 'yourpassword'  // Add more users here
}
```

### Step 5: Deploy the Website

You can host this on any static web hosting service:

- **GitHub Pages** - Free, easy to set up
- **Netlify** - Free with auto-deploy from git
- **Vercel** - Free serverless deployment
- **Firebase Hosting** - Google's hosting service
- **Any web server** - Or just open `index.html` locally

#### Option A: Deploy on GitHub Pages

```bash
# Initialize git if not already done
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/soli-tools.git
git branch -M main
git push -u origin main
```

Then go to GitHub repo Settings > Pages > Select main branch

#### Option B: Run Locally

Simply open `index.html` in your browser:

```bash
# On macOS
open index.html

# Or use a simple HTTP server
python -m http.server 8000
# Then visit http://localhost:8000
```

## Default Login Credentials

- **Username**: `admin`
- **Password**: `password123`

Or use the alternative account:
- **Username**: `user`
- **Password**: `user123`

## How It Works

1. **Login**: User enters hardcoded username/password
2. **Session**: Creates a localStorage session (24-hour timeout)
3. **Read Data**: Calls Google Apps Script endpoint with `getData` action
4. **Write Data**: Submits form data via Google Apps Script `appendData` action
5. **Google Sheets**: Apps Script reads/writes directly to Google Sheet

## Google Apps Script Functions

### `doPost(e)`
Main entry point. Receives POST requests with action parameter:
- `getData` - Returns all data from the sheet
- `appendData` - Adds new data row to the sheet

### `appendData(data)`
Adds a new row to the Google Sheet with the provided data

### `getData()`
Retrieves all data from the sheet and returns as JSON

## Customization

### Change Form Fields

Edit `index.html` to add/remove form fields in the "Add Data" section:

```html
<div class="form-group">
    <label for="fieldname">Field Label:</label>
    <input type="text" id="fieldname" name="fieldname" required>
</div>
```

Then update the Google Sheet headers to match the field names.

### Change Session Timeout

Edit `js/config.js`:

```javascript
SESSION_TIMEOUT: 24 * 60 * 60 * 1000  // Change 24 to desired hours
```

### Styling

Edit `css/style.css` to customize colors, fonts, and layout.

## Security Notes

⚠️ **This is a demo application** - Not suitable for production use because:

- Credentials are hardcoded in JavaScript (visible to users)
- Google Sheet ID is exposed in client code
- No encryption for sensitive data
- No user management or audit logs

For production applications, implement:
- Proper authentication (OAuth2, Firebase Auth, etc.)
- Backend API with authentication tokens
- Server-side validation
- Encrypted data storage
- Rate limiting and abuse protection

## Troubleshooting

### "Error loading data" message

1. **Check Google Apps Script URL**
   - Make sure it's deployed correctly
   - Test in browser console: `fetch(CONFIG.APPS_SCRIPT_URL, ...)`

2. **Check Sheet Name**
   - Verify "Data" sheet exists in your Google Sheet
   - Check that headers match the code

3. **Check CORS**
   - Google Apps Script should allow anyone to access
   - Verify deployment has "Who has access: Anyone"

### Form submission not working

1. Check browser console for errors (F12)
2. Verify Google Apps Script is deployed
3. Check network requests in DevTools

### Session expires too quickly

Change `SESSION_TIMEOUT` in `config.js` to a larger value (in milliseconds)

## License

MIT License - Feel free to use and modify for your own projects

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Google Apps Script logs (Apps Script editor > Executions)
3. Check browser console for JavaScript errors (F12 > Console tab)
