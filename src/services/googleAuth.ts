import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Token might need to be acquired again via login button
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Login');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.error('Google Sign-In Error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Sends a structured HTML backup email to the specified address.
 */
export const sendGmailBackup = async (
  accessToken: string,
  recipientEmail: string,
  backupData: {
    assets: any[];
    workOrders: any[];
  }
): Promise<boolean> => {
  try {
    const subject = `[SpaceFlow] Safe System Backup - ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`;
    
    // Format a gorgeous, responsive HTML email body mimicking a premium business backup report
    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fcfbfe; color: #1c1a22; border: 1px solid #e8e0f5; border-radius: 20px; box-shadow: 0 4px 20px rgba(41, 7, 74, 0.03);">
        <div style="text-align: center; border-bottom: 2px solid #ecd7ff; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #29074a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🐝 BeeCarbonat & Spider SpaceFlow</h2>
          <p style="color: #ff9d2b; margin: 4px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Secure Operational Backup</p>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #514b5c; margin-bottom: 20px;">
          Your automated building operations, asset registries, and maintenance tickets have been safely archived to your Gmail inbox.
        </p>

        <!-- Quick Summary Cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background-color: #f3ebff; border: 1px solid #e2d1f9; padding: 12px; border-radius: 12px; text-align: center;">
            <div style="font-size: 10px; text-transform: uppercase; color: #76648c; font-weight: bold; letter-spacing: 0.5px;">Archived Assets</div>
            <div style="font-size: 22px; font-weight: 900; color: #29074a; margin: 4px 0;">${backupData.assets.length}</div>
          </div>
          <div style="background-color: #fff4e5; border: 1px solid #ffdcb0; padding: 12px; border-radius: 12px; text-align: center;">
            <div style="font-size: 10px; text-transform: uppercase; color: #9c6c2e; font-weight: bold; letter-spacing: 0.5px;">Active Work Orders</div>
            <div style="font-size: 22px; font-weight: 900; color: #ff9d2b; margin: 4px 0;">${backupData.workOrders.length}</div>
          </div>
        </div>

        <h3 style="color: #29074a; font-size: 14px; margin-top: 24px; margin-bottom: 12px; border-left: 3px solid #ff9d2b; padding-left: 8px;">Asset Registry Highlights</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f7f2fe; text-align: left; border-bottom: 1px solid #ecd7ff;">
              <th style="padding: 8px; font-weight: bold; color: #76648c;">Asset Name</th>
              <th style="padding: 8px; font-weight: bold; color: #76648c;">Category</th>
              <th style="padding: 8px; font-weight: bold; color: #76648c; text-align: right;">Health Score</th>
            </tr>
          </thead>
          <tbody>
            ${backupData.assets.map(a => `
              <tr style="border-bottom: 1px solid #f1ebfa;">
                <td style="padding: 8px; font-weight: bold; color: #1c1a22;">${a.name}</td>
                <td style="padding: 8px; color: #76648c;">${a.category}</td>
                <td style="padding: 8px; text-align: right; font-weight: bold; color: ${a.healthScore >= 90 ? '#10b981' : '#f59e0b'};">${a.healthScore}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="color: #29074a; font-size: 14px; margin-top: 24px; margin-bottom: 12px; border-left: 3px solid #ff9d2b; padding-left: 8px;">Work Orders Status Logs</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f7f2fe; text-align: left; border-bottom: 1px solid #ecd7ff;">
              <th style="padding: 8px; font-weight: bold; color: #76648c;">Ticket</th>
              <th style="padding: 8px; font-weight: bold; color: #76648c;">Title</th>
              <th style="padding: 8px; font-weight: bold; color: #76648c; text-align: right;">Priority / Status</th>
            </tr>
          </thead>
          <tbody>
            ${backupData.workOrders.map(w => `
              <tr style="border-bottom: 1px solid #f1ebfa;">
                <td style="padding: 8px; font-weight: bold; color: #ff9d2b;">${w.ticketNumber || 'WO-NEW'}</td>
                <td style="padding: 8px; color: #1c1a22;">${w.title}</td>
                <td style="padding: 8px; text-align: right; color: #76648c;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${w.priority}</span> | ${w.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 1px solid #ecd7ff; padding-top: 16px; margin-top: 32px; text-align: center; font-size: 10px; color: #968e9a; line-height: 1.5;">
          This secure backup was triggered by the administrator account for <strong>${recipientEmail}</strong>.<br />
          Timestamp: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })} • SpaceFlow Operations
        </div>
      </div>
    `;

    // Construct raw MIME email format correctly
    const emailParts = [
      `To: ${recipientEmail}`,
      'Subject: =?utf-8?B?' + btoa(unescape(encodeURIComponent(subject))) + '?=',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      emailBody
    ];
    const emailStr = emailParts.join('\r\n');
    
    // Base64URL encode with replacements to fulfill Google requirements
    const base64Safe = btoa(unescape(encodeURIComponent(emailStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Safe
      })
    });

    if (response.ok) {
      console.log('Gmail backup sent successfully.');
      return true;
    } else {
      const errText = await response.text();
      console.error('Failed to send backup via Gmail API:', errText);
      return false;
    }
  } catch (error) {
    console.error('Gmail send error:', error);
    return false;
  }
};
