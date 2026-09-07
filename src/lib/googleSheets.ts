// Google Sheets & Drive API Client for BeeCarbonat CAFM & Facility Management
// Scopes required:
// - https://www.googleapis.com/auth/spreadsheets
// - https://www.googleapis.com/auth/drive.readonly / https://www.googleapis.com/auth/drive.file

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
  owners?: { displayName: string; emailAddress: string }[];
}

export interface SheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
    rowCount: number;
    columnCount: number;
  }[];
}

export interface SheetValuesResult {
  range: string;
  majorDimension: string;
  values: any[][];
}

/**
 * List spreadsheets from user's Google Drive
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink, owners)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime desc&pageSize=25`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to fetch spreadsheets from Google Drive (${response.status})`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Error listing user spreadsheets:', err);
    throw err;
  }
}

/**
 * Fetch spreadsheet metadata (tabs and title)
 */
export async function getSpreadsheetDetails(accessToken: string, spreadsheetId: string): Promise<SheetMetadata> {
  try {
    const cleanId = extractSpreadsheetId(spreadsheetId);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to fetch spreadsheet details (${response.status})`);
    }

    const data = await response.json();
    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title || 'Untitled Spreadsheet',
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
      sheets: (data.sheets || []).map((s: any) => ({
        sheetId: s.properties?.sheetId,
        title: s.properties?.title,
        index: s.properties?.index,
        rowCount: s.properties?.gridProperties?.rowCount || 0,
        columnCount: s.properties?.gridProperties?.columnCount || 0
      }))
    };
  } catch (err: any) {
    console.error('Error fetching spreadsheet details:', err);
    throw err;
  }
}

/**
 * Read values from a given range
 */
export async function readSpreadsheetRange(
  accessToken: string, 
  spreadsheetId: string, 
  range: string
): Promise<SheetValuesResult> {
  try {
    const cleanId = extractSpreadsheetId(spreadsheetId);
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodedRange}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to read spreadsheet range (${response.status})`);
    }

    const data = await response.json();
    return {
      range: data.range,
      majorDimension: data.majorDimension || 'ROWS',
      values: data.values || []
    };
  } catch (err: any) {
    console.error('Error reading spreadsheet values:', err);
    throw err;
  }
}

/**
 * Update (overwrite) cell values in a range
 */
export async function updateSpreadsheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<{ updatedCells: number; updatedRows: number }> {
  try {
    const cleanId = extractSpreadsheetId(spreadsheetId);
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to update spreadsheet range (${response.status})`);
    }

    const data = await response.json();
    return {
      updatedCells: data.updatedCells || 0,
      updatedRows: data.updatedRows || 0
    };
  } catch (err: any) {
    console.error('Error updating spreadsheet values:', err);
    throw err;
  }
}

/**
 * Append row values to a table/sheet
 */
export async function appendSpreadsheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<{ updatedRows: number; updatedCells: number }> {
  try {
    const cleanId = extractSpreadsheetId(spreadsheetId);
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to append rows to spreadsheet (${response.status})`);
    }

    const data = await response.json();
    return {
      updatedRows: data.updates?.updatedRows || 0,
      updatedCells: data.updates?.updatedCells || 0
    };
  } catch (err: any) {
    console.error('Error appending rows to spreadsheet:', err);
    throw err;
  }
}

/**
 * Create a new Google Spreadsheet with default CAFM & ESG structure
 */
export async function createCafmSpreadsheet(
  accessToken: string, 
  title: string = `BeeCarbonat CAFM - Export ${new Date().toLocaleDateString('fr-FR')}`
): Promise<SheetMetadata> {
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    
    const requestBody = {
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'Equipements_Assets',
            gridProperties: { rowCount: 100, columnCount: 10 }
          }
        },
        {
          properties: {
            title: 'Ordres_Travail_GMAO',
            gridProperties: { rowCount: 100, columnCount: 10 }
          }
        },
        {
          properties: {
            title: 'Telemetrie_ESG_Energie',
            gridProperties: { rowCount: 100, columnCount: 10 }
          }
        },
        {
          properties: {
            title: 'Synthese_KPIs',
            gridProperties: { rowCount: 50, columnCount: 6 }
          }
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to create Google Spreadsheet (${response.status})`);
    }

    const data = await response.json();
    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title,
      spreadsheetUrl: data.spreadsheetUrl,
      sheets: (data.sheets || []).map((s: any) => ({
        sheetId: s.properties?.sheetId,
        title: s.properties?.title,
        index: s.properties?.index,
        rowCount: s.properties?.gridProperties?.rowCount || 0,
        columnCount: s.properties?.gridProperties?.columnCount || 0
      }))
    };
  } catch (err: any) {
    console.error('Error creating CAFM spreadsheet:', err);
    throw err;
  }
}

/**
 * Format helper to extract spreadsheet ID if user enters full URL
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}
