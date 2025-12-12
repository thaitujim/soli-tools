// Configuration File

// Google Apps Script Deployment URL
// Replace this with your actual Google Apps Script deployment URL
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/d/AKfycbwcrPpy0haKXqKEtck6XeuZqjxgSf59tSh4tLh1eLhCg-_0V5t9An329aTPI5yrBDOOXQ/userweb/exec',
    
    // Google Sheet ID
    // Replace this with your actual Google Sheet ID
    SHEET_ID: '1FWnFpQEGsdFddRGTsZnBEqb0b98_dOap-kOc_Nx0FeM',
    
    // Login Credentials (Hardcoded for demo purposes)
    // In production, use a proper authentication system
    USERS: {
        'admin': 'password123',
        'user': 'user123'
    },
    
    // Session Settings
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    STORAGE_KEY: 'soli_tools_session'
};
