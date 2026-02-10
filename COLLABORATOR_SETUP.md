# Collaborator Setup Guide: ShadowLight AI Assistant

If you've pulled the code but can't see the extension UI, follow these steps to build and load it correctly.

## 1. Prerequisites
Ensure you have **Node.js** installed on your machine.

## 2. Install Dependencies
Open your terminal in the project root and run:
```bash
npm install
```

## 3. Configuration
The extension requires a Gemini API Key.
1. Create a file named `.env` in the root directory.
2. Add your key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

## 4. Build the Extension
The project uses Vite to bundle the code. You **must** build it locally:
```bash
npm run build
```
This will create a `dist` folder.

## 5. Load into Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked**.
4. **IMPORTANT**: Select the `dist` folder (not the project root) from your file explorer.

## Troubleshooting
- **UI not showing**: Ensure you selected the `dist` folder in step 5.
- **AI not working**: Ensure your `.env` file has a valid API key and you've rebuilt the project after adding it.
