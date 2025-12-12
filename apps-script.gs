// Google Apps Script
// Deploy this as a web app accessible to anyone

// Configuration
const SHEET_NAME = 'Data'; // Name of the sheet in your Google Sheet

/**
 * Main entry point for the web app
 * Handles GET and POST requests from the frontend
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        
        if (action === 'appendData') {
            return appendData(data.data);
        } else if (action === 'getData') {
            return getData();
        } else {
            return createResponse(false, 'Unknown action');
        }
    } catch (error) {
        return createResponse(false, 'Error: ' + error.message);
    }
}

/**
 * Append data to the Google Sheet
 */
function appendData(data) {
    try {
        const sheet = getSheet();
        
        // Get headers from the first row
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Prepare the row data
        const row = [];
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (data.hasOwnProperty(header)) {
                row.push(data[header]);
            } else {
                row.push('');
            }
        }
        
        // Append to the sheet
        sheet.appendRow(row);
        
        return createResponse(true, 'Data added successfully');
    } catch (error) {
        return createResponse(false, 'Error appending data: ' + error.message);
    }
}

/**
 * Get all data from the Google Sheet
 */
function getData() {
    try {
        const sheet = getSheet();
        const data = sheet.getDataRange().getValues();
        
        if (data.length <= 1) {
            return createResponse(true, 'No data', []);
        }
        
        // Convert to array of objects
        const headers = data[0];
        const rows = [];
        
        for (let i = 1; i < data.length; i++) {
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = data[i][j];
            }
            rows.push(row);
        }
        
        return createResponse(true, 'Data retrieved successfully', rows.reverse()); // Reverse to show newest first
    } catch (error) {
        return createResponse(false, 'Error retrieving data: ' + error.message, []);
    }
}

/**
 * Helper function to get the sheet
 */
function getSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        // Add headers
        sheet.appendRow(['name', 'email', 'message', 'timestamp']);
    }
    
    return sheet;
}

/**
 * Helper function to create JSON response
 */
function createResponse(success, message, data = null) {
    const response = {
        success: success,
        message: message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Allow CORS by handling preflight requests
 */
function doGet(e) {
    return ContentService.createTextOutput('Google Apps Script is running')
        .setMimeType(ContentService.MimeType.TEXT);
}
