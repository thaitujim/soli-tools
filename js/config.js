// Configuration File

// Google Apps Script Deployment URL
// Replace this with your actual Google Apps Script deployment URL
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzV4YVBPSm84U8PR-2l_bGU1TQJZnO05LGTNw--EhcrxvIRcqistwgsqoRGvSLQHTMl/exec',
    
    // Google Sheet ID
    // Replace this with your actual Google Sheet ID
    SHEET_ID: '1P553_BHlYbViOH7_G2IsIw7YN-E4V2TbFbXVIqESgx4',
    
    // Login Credentials (Hardcoded for demo purposes)
    // In production, use a proper authentication system
    USERS: {
        'admin': 'password123',
        'user': '123'
    },
    
    // Session Settings
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    STORAGE_KEY: 'soli_tools_session'
};
