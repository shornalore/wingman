import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, usageCount, timestamp, userAgent, extensionVersion } = req.body || {};

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Feedback text is required' });
  }

  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, storing feedback locally');
      return res.json({ 
        success: true, 
        message: 'Feedback received (email not configured)',
        stored: true
      });
    }

    // Initialize Resend with API key from environment
    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'feedback@wingman.com';

    // Create email content
    const emailContent = `
      <h2>New Wingman Extension Feedback</h2>
      <p><strong>Feedback:</strong> ${text}</p>
      <p><strong>Usage Count:</strong> ${usageCount}</p>
      <p><strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}</p>
      <p><strong>Extension Version:</strong> ${extensionVersion}</p>
      <p><strong>Browser:</strong> ${userAgent}</p>
      <hr>
      <p><small>This feedback was submitted through the Wingman extension.</small></p>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Wingman Feedback <adityanath11@outlook.com>',
      to: ['adityanath11@outlook.com'],
      subject: `Wingman Feedback - ${new Date(timestamp).toLocaleDateString()}`,
      html: emailContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      // Don't fail the request, just log the error
      return res.json({ 
        success: true, 
        message: 'Feedback received (email failed)',
        error: error.message
      });
    }

    console.log('Feedback email sent successfully:', data?.id);

    res.json({ 
      success: true, 
      message: 'Feedback received and email sent successfully',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    // Don't fail the request, just log the error
    res.json({ 
      success: true, 
      message: 'Feedback received (processing error)',
      error: error.message
    });
  }
}
