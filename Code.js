// Google Apps Script
// Deploy this as a web app accessible to anyone

// Configuration
const SHEET_NAME = 'Sheet1'; // Name of the sheet in your Google Sheet

/**
 * Main entry point for the web app
 * Handles GET requests from the frontend
 */
function doPost(e) {
    // Keep for backwards compatibility if needed
    return doGet(e);
}

/**
 * Append data to the Google Sheet
 */
function appendData(data) {
    try {
        const sheet = getSheet();
        
        // Append directly to columns A and B (no headers)
        const row = [
            data.name || '',
            data.value || ''
        ];
        
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
        const lastRow = sheet.getLastRow();
        
        if (lastRow <= 2) {
            return createResponse(true, 'No data', []);
        }
        
        // Read columns A, B and C directly, starting from row 3 (skip first 2 rows)
        const data = sheet.getRange(3, 1, lastRow - 2, 3).getValues();
        
        // Convert to array of objects with ingredient properties
        const rows = [];
        for (let i = 0; i < data.length; i++) {
            rows.push({
                IngredientType: data[i][0],
                IngredientDetails: data[i][1],
                IngredientQuantity: data[i][2]
            });
        }
        
        return createResponse(true, 'Data retrieved successfully', rows);
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
        // No headers - columns A and B will be used directly
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
 * Handle GET requests from the frontend
 */
function doGet(e) {
    try {
        const action = e.parameter.action;
        const dataParam = e.parameter.data;
        
        if (action === 'appendData' && dataParam) {
            const data = JSON.parse(dataParam);
            return appendData(data);
        } else if (action === 'getData') {
            return getData();
        } else {
            return createResponse(false, 'Unknown action');
        }
    } catch (error) {
        return createResponse(false, 'Error: ' + error.message);
    }
}
