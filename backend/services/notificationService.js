const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { executeQuery } = require('../config/database');
require('dotenv').config();

class NotificationService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.appName = 'Production Management System';
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  }

// Send notification to users
async function sendNotification({ type, title, message, relatedTable, relatedId, departmentId, roles, userIds }) {
  try {
    let users = [];
    
    if (departmentId) {
      // Get department users
      users = await executeQuery(`
        SELECT u.id, u.email, u.first_name, u.last_name 
        FROM users u 
        WHERE u.department_id = ? AND u.is_active = 1
      `, [departmentId]);
    }
    
    if (roles && roles.length > 0) {
      // Get users by roles
      const roleUsers = await executeQuery(`
        SELECT u.id, u.email, u.first_name, u.last_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE r.name IN (${roles.map(() => '?').join(',')}) AND u.is_active = 1
      `, roles);
      users = [...users, ...roleUsers];
    }
    
    if (userIds && userIds.length > 0) {
      // Get specific users
      const specificUsers = await executeQuery(`
        SELECT u.id, u.email, u.first_name, u.last_name 
        FROM users u 
        WHERE u.id IN (${userIds.map(() => '?').join(',')}) AND u.is_active = 1
      `, userIds);
      users = [...users, ...specificUsers];
    }
    
    // Remove duplicates
    users = users.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
    
    // Create notifications in database
    for (const user of users) {
      await executeQuery(`
        INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.id, title, message, type, relatedTable, relatedId]);
      
      // Send email notification
      if (user.email) {
        await sendEmail(user.email, title, message, user.first_name);
      }
    }
    
    return { success: true, notificationsSent: users.length };
  } catch (error) {
    console.error('Notification service error:', error);
    return { success: false, error: error.message };
  }
}

// Send email
async function sendEmail(to, subject, message, firstName) {
  if (!transporter) {
    console.log('Email not configured, skipping email to:', to);
    return { success: false, error: 'Email not configured' };
  }
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Production Management System</h2>
          <p>Hello ${firstName},</p>
          <p>${message}</p>
          <p>Please log in to the system to view more details.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message from the Production Management System.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendNotification,
  sendEmail
};