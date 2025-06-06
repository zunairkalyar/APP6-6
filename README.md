# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create an `.env.local` file with your Gemini API key:

   ```env
   GEMINI_API_KEY=<your key>
   ```

   During development Vite maps `GEMINI_API_KEY` to `process.env.API_KEY` so it can be accessed in the code.
3. Run the app:
   `npm run dev`
