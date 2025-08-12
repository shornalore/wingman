# Wingman - AI Text Assistant Extension

A Firefox extension that provides instant AI-powered explanations and definitions for selected text on any webpage.

## Features

- **Instant AI Assistance**: Double-click any text to get definitions or explanations
- **Contextual Understanding**: AI responses are tailored to the surrounding content
- **Follow-up Questions**: Ask up to 3 follow-up questions per interaction
- **Beautiful UI**: Glassmorphism design with dark/light mode support
- **Rate Limiting**: 100 requests per hour per user
- **Privacy First**: No data collection or tracking

## Installation

### From Firefox Add-ons
1. Visit [Firefox Add-ons](https://addons.mozilla.org)
2. Search for "Wingman AI Assistant"
3. Click "Add to Firefox"

### Manual Installation
1. Clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## Development

### Extension Structure
```
wingman/
├── manifest.json              # Extension manifest
├── src/
│   ├── background.js          # Background service worker
│   ├── content/
│   │   ├── selector.js        # Text selection handler
│   │   ├── chatbox.js         # Chat UI component
│   │   └── popover.css        # Glassmorphism styles
│   └── popup/
│       └── settings.html      # Settings popup
└── server/
    ├── api/ask.js             # Vercel serverless function
    ├── package.json           # Server dependencies
    └── vercel.json           # Vercel configuration
```

### Local Development

1. **Clone and setup**:
   ```bash
   git clone https://github.com/shornalore/wingman.git
   cd wingman
   ```

2. **Install dependencies**:
   ```bash
   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Start development servers**:
   ```bash
   # Terminal 1: Start Vercel dev server
   cd server
   npx vercel dev

   # Terminal 2: Load extension in Firefox
   # Go to about:debugging → This Firefox → Load Temporary Add-on
   # Select manifest.json
   ```

4. **Test the extension**:
   - Open any webpage
   - Double-click on any text
   - Use "Define" or "Explain" buttons
   - Ask follow-up questions

### Environment Variables

Create a `.env` file in the server directory:
```bash
cd server
cp .env.example .env
# Edit .env and add your API keys
```

Required environment variables:
- `GROQ_API_KEY`: Your Groq API key
- `OPENAI_API_KEY`: Your OpenAI API key (optional)

### Building for Production

1. **Update API endpoint**:
   - Change `API_BASE` in `src/background.js` to your production URL

2. **Build and package**:
   ```bash
   # Build extension
   zip -r wingman-extension.zip manifest.json src/

   # Deploy server
   cd server && npx vercel deploy
   ```

3. **Submit to Firefox Add-ons**:
   - Go to [Firefox Developer Hub](https://addons.mozilla.org/developers/)
   - Upload the built extension

## API Usage

The extension communicates with a Vercel serverless function at `/api/ask` which:
- Handles rate limiting (100 requests/hour)
- Provides cached responses for common queries
- Returns AI-generated definitions and explanations

## Privacy

- No user data is collected or stored
- All requests are processed anonymously
- No tracking or analytics

## License

MIT License - see LICENSE file for details
