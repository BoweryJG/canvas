import { Handler } from '@netlify/functions';

// Email attachment interface
interface EmailAttachment {
  content: string;
  name: string;
  type: string;
}

// Email provider configurations
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.demo-key';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'resend-demo-key';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { 
      to, 
      subject, 
      content, 
      provider = 'sendgrid',
      attachments = [],
      from = 'noreply@canvas-intel.com',
      fromName = 'Canvas Intelligence'
    } = JSON.parse(event.body || '{}');

    if (!to || !subject || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, content' })
      };
    }

    console.log(`📧 Sending email via ${provider}: ${subject} to ${to}`);

    let result;
    
    if (provider === 'sendgrid') {
      result = await sendWithSendGrid(to, subject, content, from, fromName, attachments);
    } else if (provider === 'resend') {
      result = await sendWithResend(to, subject, content, from, fromName, attachments);
    } else {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    if (result.success) {
      console.log(`✅ Email sent successfully: ${result.messageId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          messageId: result.messageId,
          provider: provider
        })
      };
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      })
    };
  }
};

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(
  to: string, 
  subject: string, 
  content: string, 
  from: string, 
  fromName: string, 
  attachments: EmailAttachment[]
) {
  try {
    const emailData = {
      personalizations: [{
        to: [{ email: to }],
        subject: subject
      }],
      from: {
        email: from,
        name: fromName
      },
      content: [{
        type: 'text/html',
        value: formatEmailContent(content)
      }],
      attachments: attachments.map(att => ({
        content: att.content,
        filename: att.name,
        type: att.type,
        disposition: 'attachment'
      }))
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
      return { success: true, messageId };
    } else {
      const errorText = await response.text();
      return { success: false, error: `SendGrid error: ${response.status} - ${errorText}` };
    }

  } catch (error) {
    return { 
      success: false, 
      error: `SendGrid request failed: ${error instanceof Error ? error.message : error}` 
    };
  }
}

/**
 * Send email using Resend
 */
async function sendWithResend(
  to: string, 
  subject: string, 
  content: string, 
  from: string, 
  fromName: string, 
  attachments: EmailAttachment[]
) {
  try {
    const emailData = {
      from: `${fromName} <${from}>`,
      to: [to],
      subject: subject,
      html: formatEmailContent(content),
      attachments: attachments.map(att => ({
        filename: att.name,
        content: att.content
      }))
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, messageId: result.id };
    } else {
      const errorText = await response.text();
      return { success: false, error: `Resend error: ${response.status} - ${errorText}` };
    }

  } catch (error) {
    return { 
      success: false, 
      error: `Resend request failed: ${error instanceof Error ? error.message : error}` 
    };
  }
}

/**
 * Format email content with professional styling
 */
function formatEmailContent(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Intelligence</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e1e5e9;
      border-radius: 0 0 8px 8px;
    }
    .footer {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 14px;
      color: #666;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 15px 0;
      font-weight: 500;
    }
    .highlight {
      background: #f0f7ff;
      padding: 15px;
      border-left: 4px solid #667eea;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>🎯 Canvas Intelligence Platform</h2>
    <p>Medical Sales Intelligence & Research</p>
  </div>
  
  <div class="content">
    ${content.replace(/\n/g, '<br>')}
    
    <div class="highlight">
      <strong>🔬 This message was powered by:</strong><br>
      • Real-time web research across medical directories<br>
      • Claude 4 AI analysis for strategic insights<br>
      • Verified practice intelligence (not assumptions)<br>
    </div>
    
    <p>
      <a href="#" class="cta-button">📅 Schedule 15-Minute Discussion</a>
    </p>
  </div>
  
  <div class="footer">
    <p>
      <strong>Canvas Intelligence Platform</strong><br>
      Advanced Medical Sales Intelligence<br>
      <small>This email was generated using verified practice research and AI analysis.</small>
    </p>
    
    <p>
      <small>
        If you'd prefer not to receive these research-based insights, 
        <a href="#">click here to unsubscribe</a>.
      </small>
    </p>
  </div>
</body>
</html>
  `.trim();
}