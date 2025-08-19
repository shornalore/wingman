<div style="display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <div style="flex: 1;">
    <h1 style="margin: 0; font-size: 2.5rem; color: white; font-weight: 700;">Wingman Extension</h1>
    <p style="margin: 0.5rem 0 0 0; font-size: 1.2rem; color: rgba(255, 255, 255, 0.9); line-height: 1.4;">Turn any webpage into an interactive knowledge surface. Select text, get instant explanations, definitions, and summaries.</p>
  </div>
  <div style="margin-left: 2rem;">
    <a href="https://github.com/shornalore/wingman">
      <img src="icons/wingman-readme-logo.png" alt="Wingman Logo" width="180" style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
    </a>
  </div>
</div>

## Setup Instructions

### For Users
1. Install the extension from the Firefox Add-ons store <https://addons.mozilla.org/en-US/firefox/addon/wingman-ai-web-companion/>
2. Double-click any text on any webpage
3. Choose "Explain", "Define", or "Summarize"

### For Developers

#### Email Feedback Setup
The extension now sends feedback directly to your email via Resend.

**Steps to set up email notifications:**

1. **Sign up for Resend**:
   - Go to [resend.com](https://resend.com)
   - Create a free account (100 emails/day)

2. **Get your API key**:
   - Go to Resend dashboard → API Keys
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add environment variables to Vercel**:
   - Go to your Vercel project settings
   - Add these environment variables:
     - `RESEND_API_KEY=your_resend_api_key_here`
     - `RECIPIENT_EMAIL=your-email@domain.com`

4. **Deploy**:
   - Push changes to trigger automatic deployment
   - Feedback will now be sent to your email

#### Local Development
```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

## API Endpoints
- `POST /api/ask` - Get AI explanations
- `POST /api/feedback` - Submit feedback (now sends email)

## Features
- Instant text explanations
- Definitions and summaries
- Feedback system with email notifications
- Cross-browser compatibility
- Clean, minimal UI

## Screenshots

<div align="center">
  
  <p><strong>Extension Interface</strong></p>
  <img src="icons/screenshot1.png" alt="Extension Interface" width="90%">
  
  <br>
  
  <p><strong>Text Selection in Action</strong></p>
  <img src="icons/screenshot2.png" alt="Text Selection in Action" width="90%">
  
  <br>
  
  <p><strong>Feature Overview</strong></p>
  <img src="icons/screenshot3.png" alt="Feature Overview" width="90%">
  
</div>

## Tech Stack
- Frontend: Vanilla JavaScript, CSS
- Backend: Node.js, Vercel Functions
- Email: Resend API
- AI: Groq API (Llama 3.1)
