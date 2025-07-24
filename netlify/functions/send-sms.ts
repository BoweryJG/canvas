import { Handler } from '@netlify/functions';

// Twilio SMS status response interface
interface TwilioMessage {
  sid: string;
  status: string;
  price?: string;
  direction: string;
  from: string;
  to: string;
  body: string;
  date_created: string;
  date_updated: string;
  date_sent?: string;
  error_code?: string;
  error_message?: string;
}

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'demo-account-sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'demo-auth-token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

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
      message,
      from = TWILIO_PHONE_NUMBER,
      mediaUrls = []
    } = JSON.parse(event.body || '{}');

    if (!to || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: to, message' })
      };
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid phone number format' })
      };
    }

    // Validate message length (SMS limit is 160 chars for single segment)
    if (message.length > 1600) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message too long (max 1600 characters)' })
      };
    }

    console.log(`💬 Sending SMS to ${to}: ${message.substring(0, 50)}...`);

    const result = await sendTwilioSMS(to, message, from, mediaUrls);

    if (result.success) {
      console.log(`✅ SMS sent successfully: ${result.messageId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          messageId: result.messageId,
          status: result.status,
          cost: result.cost
        })
      };
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'SMS sending failed'
      })
    };
  }
};

/**
 * Send SMS using Twilio API
 */
async function sendTwilioSMS(
  to: string, 
  message: string, 
  from: string, 
  mediaUrls: string[] = []
): Promise<{ success: boolean; messageId?: string; status?: string; cost?: string; error?: string }> {
  
  try {
    // Prepare Twilio API credentials
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', from);
    formData.append('Body', message);
    
    // Add media URLs if provided (for MMS)
    mediaUrls.forEach(url => {
      formData.append('MediaUrl', url);
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        cost: result.price || 'Unknown'
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: `Twilio error: ${errorData.message || response.statusText}`
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `Twilio request failed: ${error instanceof Error ? error.message : error}`
    };
  }
}

/**
 * Send WhatsApp message using Twilio WhatsApp API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  mediaUrls: string[] = []
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('To', `whatsapp:${to}`);
    formData.append('From', `whatsapp:${TWILIO_PHONE_NUMBER}`);
    formData.append('Body', message);
    
    mediaUrls.forEach(url => {
      formData.append('MediaUrl', url);
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    );

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        messageId: result.sid
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: `WhatsApp error: ${errorData.message || response.statusText}`
      };
    }

  } catch (error) {
    return {
      success: false,
      error: `WhatsApp request failed: ${error instanceof Error ? error.message : error}`
    };
  }
}

/**
 * Get SMS delivery status
 */
export async function getSMSStatus(messageId: string): Promise<TwilioMessage | null> {
  try {
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageId}.json`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

  } catch (error) {
    console.error('SMS status check failed:', error);
    return null;
  }
}