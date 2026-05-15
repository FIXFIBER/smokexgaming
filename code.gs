/**
 * SmokeX Gaming - Elite Auth Database
 * Advanced Google Apps Script Backend
 */

const SHEET_NAME = "Users";
const OTP_SHEET_NAME = "OTPs";

/**
 * Hardcoded Administrative Credentials
 */
const ADMIN_CREDENTIALS = {
  username: "admin",
  email: "hghhvhjh66@gmail.com",
  password: "smokexgaming"
};

/**
 * Creates a SmokeX management menu in your Google Sheet.
 * This allows you to manually trigger the database setup.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔥 SmokeX Admin')
    .addItem('Initialize / Repair Sheets', 'initDatabase')
    .addItem('Purge Expired OTPs', 'purgeExpiredOTPs')
    .addToUi();
}

/**
 * Core system to ensure the database sheet exists and is formatted correctly.
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const setupSheet = (name, headers, color) => {
    let s = ss.getSheetByName(name);
    if (!s) {
      s = ss.insertSheet(name);
      s.appendRow(headers).setFrozenRows(1);
      s.getRange(1, 1, 1, headers.length)
       .setFontWeight("bold")
       .setBackground(color)
       .setFontColor("#000000");
    }
    return s;
  };

  const userSheet = setupSheet(SHEET_NAME, ["Username", "Email", "Password", "CreatedAt"], "#ffd700");
  setupSheet(OTP_SHEET_NAME, ["Email", "OTP", "Timestamp"], "#ff4444");
  
  // We removed the .hideSheet() command so you can see the 'OTPs' tab at the bottom.
  return userSheet;
}

/**
 * Automatically removes OTPs older than 10 minutes.
 */
function purgeExpiredOTPs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(OTP_SHEET_NAME);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const now = new Date().getTime();
  for (let i = data.length - 1; i >= 1; i--) {
    if (now - new Date(data[i][2]).getTime() > 600000) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * Standardized JSON response helper
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait for up to 30 seconds for other processes to finish
    lock.waitLock(30000);
    
    // Auto-clean expired codes on every request to keep it "Advanced"
    purgeExpiredOTPs();

    const sheet = initDatabase();
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const rows = sheet.getDataRange().getValues();

    switch (action) {
      case "signup":
        return handleSignUp(sheet, rows, data);
      case "login":
        return handleLogin(rows, data);
      case "verifyOTP":
        return handleVerifyOTP(data);
      case "forgotPassword":
        return handleForgotPassword(data);
      case "resetPassword":
        return handleResetPassword(data);
      case "changePassword":
        return handleChangePassword(data);
      case "syncUserData":
        return syncUserData(data);
      default:
        return createResponse({ result: "error", message: "Invalid request." });
    }
  } catch (err) {
    return createResponse({ result: "error", message: "System Error: " + err.message });
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}

/**
 * Securely hashes a password using SHA-256
 */
function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(byte => {
    const v = (byte < 0) ? byte + 256 : byte;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function handleSignUp(sheet, rows, data) {
  const emailExists = rows.some(row => row[1] === data.email);
  if (emailExists) {
    return createResponse({ result: "error", message: "This email is already registered. If you forgot your password, please use the 'Forgot Password' option.", code: "EMAIL_EXISTS" });
  }

  // STAGE 2: If OTP is provided, verify it and THEN create the account
  if (data.otp) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const otpSheet = ss.getSheetByName(OTP_SHEET_NAME);
    const otpData = otpSheet.getDataRange().getValues();
    
    const entry = otpData.find(row => row[0] === data.email && row[1].toString() === data.otp.toString());
    
    if (entry) {
      // Check Expiration (10 Minutes)
      const timestamp = new Date(entry[2]).getTime();
      if (new Date().getTime() - timestamp > 600000) {
        return createResponse({ result: "error", message: "The verification code has expired. Please try again." });
      }

      // OTP is valid - NOW we save the user to the database
      const securePassword = hashPassword(data.password);
      sheet.appendRow([data.username, data.email, securePassword, new Date()]);
      
      // Clean up the used OTP
      const rowIndex = otpData.indexOf(entry) + 1;
      otpSheet.deleteRow(rowIndex);
      
      return createResponse({ result: "success" });
    }
    return createResponse({ result: "error", message: "The code you entered is incorrect." });
  } 
  
  // STAGE 1: No OTP provided, so generate one and send the email
  else {
    const code = Math.floor(100000 + Math.random() * 900000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const otpSheet = ss.getSheetByName(OTP_SHEET_NAME);
    
    // Clear any existing OTPs for this email to avoid confusion
    const currentOtps = otpSheet.getDataRange().getValues();
    for (let i = currentOtps.length - 1; i >= 1; i--) {
      if (currentOtps[i][0] === data.email) otpSheet.deleteRow(i + 1);
    }
    
    otpSheet.appendRow([data.email, code, new Date()]);
    sendOTPEmail(data.email, code);
    return createResponse({ result: "otp_sent", message: "A verification code has been sent to your email." });
  }
}

function sendOTPEmail(email, code) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #000;">SmokeX Gaming - Verification Code</h2>
      <p>Hello,</p>
      <p>Please use the following verification code to complete your sign-in:</p>
      <div style="font-size: 32px; font-weight: bold; padding: 20px; background-color: #f4f4f4; display: inline-block; letter-spacing: 5px;">
        ${code}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
      <p style="font-size: 12px; color: #888;">&copy; 2024 SmokeX Gaming</p>
    </div>
  `;

  GmailApp.sendEmail(email, "SMOKEXGAMING: Your Verification Code is " + code, "", {
    name: "SMOKEXGAMING",
    to: email,
    htmlBody: htmlBody
  });
}

function handleLogin(rows, data) {
  let authenticatedUser = null;

  if (data.email === ADMIN_CREDENTIALS.email && data.password === ADMIN_CREDENTIALS.password) {
    authenticatedUser = ADMIN_CREDENTIALS.username;
  } else {
    const inputHash = hashPassword(data.password);
    const user = rows.find(row => row[1] === data.email && row[2] === inputHash);
    if (user) authenticatedUser = user[0];
  }

  if (authenticatedUser) {
    return createResponse({ result: "success", username: authenticatedUser });
  }

  return createResponse({ result: "error", message: "Invalid email or password." });
}

function handleVerifyOTP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const otpSheet = ss.getSheetByName(OTP_SHEET_NAME);
  const otpRows = otpSheet.getDataRange().getValues();
  
  const entry = otpRows.find(row => row[0] === data.email && row[1].toString() === data.otp.toString());
  
  if (entry) {
    // Check Expiration (10 Minutes = 600,000ms)
    const timestamp = new Date(entry[2]).getTime();
    const now = new Date().getTime();
    if (now - timestamp > 600000) {
      return createResponse({ result: "error", message: "The verification code has expired. Please try again." });
    }

    // OTP is valid. Now find the username for the session.
    if (data.email === ADMIN_CREDENTIALS.email) {
        return createResponse({ result: "success", username: ADMIN_CREDENTIALS.username });
    }
    const userRows = ss.getSheetByName(SHEET_NAME).getDataRange().getValues();
    const user = userRows.find(row => row[1] === data.email);
    
    // Clean up OTP after use
    const rowIndex = otpRows.indexOf(entry) + 1;
    otpSheet.deleteRow(rowIndex);
    
    return createResponse({ result: "success", username: user ? user[0] : "CHAMPION" });
  }
  
  return createResponse({ result: "error", message: "The code you entered is incorrect." });
}

/**
 * Handles requests for password reset.
 * Sends an OTP to the user's registered email.
 */
function handleForgotPassword(data) {
  const email = data.email;
  if (!email) {
    return createResponse({ result: "error", message: "Email is required for password reset." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAME);
  const userRows = userSheet.getDataRange().getValues();

  // Check if the email exists in the user database
  const userExists = userRows.some(row => row[1] === email);
  if (!userExists) {
    return createResponse({ result: "error", message: "This email is not registered.", code: "EMAIL_NOT_FOUND" });
  }

  const otpSheet = ss.getSheetByName(OTP_SHEET_NAME);
  
  // Clear any existing OTPs for this email to ensure only the latest is valid
  const currentOtps = otpSheet.getDataRange().getValues();
  for (let i = currentOtps.length - 1; i >= 1; i--) { // Iterate backwards to safely delete rows
    if (currentOtps[i][0] === email) {
      otpSheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed and header row
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpSheet.appendRow([email, code, new Date()]);
  sendOTPEmail(email, code);
  
  return createResponse({ result: "otp_sent", message: "A password reset code has been sent to your email." });
}

/**
 * Handles the final step of password reset: verifying OTP and updating password.
 */
function handleResetPassword(data) {
  const { email, otp, newPassword } = data;
  if (!email || !otp || !newPassword) {
    return createResponse({ result: "error", message: "Email, OTP, and new password are required." });
  }

  // Verify the OTP first (reusing handleVerifyOTP's logic for simplicity, but more explicit here)
  const verifyResponse = handleVerifyOTP(data); // Pass data directly, it has email and otp
  if (verifyResponse.getContent().includes('"result":"error"')) {
    return verifyResponse; // Return the error from OTP verification
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAME);
  const userRows = userSheet.getDataRange().getValues();
  const userIndex = userRows.findIndex(row => row[1] === email);
  userSheet.getRange(userIndex + 1, 3).setValue(hashPassword(newPassword)); // Column 3 is Password

  return createResponse({ result: "success", message: "Your password has been successfully reset." });
}

/**
 * Handles changing a user's password from the settings page.
 */
function handleChangePassword(data) {
  const { email, currentPassword, newPassword } = data;
  if (!email || !currentPassword || !newPassword) {
    return createResponse({ result: "error", message: "All password fields are required." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAME);
  const userRows = userSheet.getDataRange().getValues();

  const userIndex = userRows.findIndex(row => row[1] === email);
  if (userIndex === -1) {
    return createResponse({ result: "error", message: "User not found." });
  }

  const storedHashedPassword = userRows[userIndex][2];
  const inputHashedCurrentPassword = hashPassword(currentPassword);

  if (storedHashedPassword !== inputHashedCurrentPassword) {
    return createResponse({ result: "error", message: "Incorrect current password." });
  }

  // Update password
  userSheet.getRange(userIndex + 1, 3).setValue(hashPassword(newPassword));

  return createResponse({ result: "success", message: "Password changed successfully!" });
}

/**
 * ADVANCED IDENTITY SYNC
 * Synchronizes all user-specific data to the cloud vault.
 */
function syncUserData(data) {
  const { email, avatar, lockedGame, lockExpiry, username } = data;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const userIndex = rows.findIndex(row => row[1] === email);

  if (userIndex === -1) return createResponse({ result: "error", message: "Identity not found in Arena." });

  const rowNum = userIndex + 1;
  
  // Column mapping: 1:Username, 5:Avatar, 6:LockedGame, 7:LockExpiry
  if (username !== undefined) sheet.getRange(rowNum, 1).setValue(username);
  if (avatar !== undefined) sheet.getRange(rowNum, 5).setValue(avatar);
  if (lockedGame !== undefined) sheet.getRange(rowNum, 6).setValue(lockedGame);
  if (lockExpiry !== undefined) sheet.getRange(rowNum, 7).setValue(lockExpiry);

  // Advanced: Log activity
  sheet.getRange(rowNum, 4).setValue(new Date()); // Update "Last Active"

  return createResponse({ result: "success", message: "Cloud Sync Complete" });
}
}
