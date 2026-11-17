Cook-Right
==========

Cook-Right is an AI-driven recipe generation web app. Users can input ingredients, descriptions, or ideas, and the app generates complete recipes and names using Genkit flows powered by NVIDIA NIM.

Features
--------

- 🍲 Generate recipes from a list of ingredients
- 🧠 Generate recipe names from descriptions
- 🖼️ Generate food images using AI
- ⚡ Built with Next.js, Tailwind CSS, and Genkit flows
- 🧾 Modern, responsive, and extensible design

Project Structure
-----------------

Cook-Right/<br>
├── src/<br>
│   ├── ai/                              
│   │   └── flows/                       
│   └── app/                            
├── docs/                               
├── public/                             
├── .vscode/                            
├── package.json                         
├── tailwind.config.ts                  
├── next.config.ts                      

Getting Started
---------------

Prerequisites:
- Node.js ≥ 18
- npm or yarn

Installation:
1. Clone the repository
   git clone- [https://github.com/your-username/Cook-Right.git](https://github.com/Prithvi-Pawar/Cook-Right.git)
2. Navigate to the project directory
   cd Cook-Right
3. Install dependencies
   npm install

NVIDIA NIM setup:
1. Get an API key from NVIDIA Build.
2. Set `NVIDIA_API_KEY=your_nvidia_api_key` in the root `.env` file.
3. Restart the development server after changing the key.

The app uses NVIDIA NIM's OpenAI-compatible API with the `meta/llama-3.3-70b-instruct` model. Recipe-video searches open Bing Videos and do not require a YouTube API key.

Running the Development Server:
   npm run dev

Building for Production:
   npm run build

AI Flows
--------

The app uses Genkit flows to handle all the smart features:

- generate-recipe.ts
- generate-recipe-from-ingredients.ts
- generate-named-recipe-from-description-flow.ts
- suggest-recipe-names-flow.ts
- generate-recipe-image.ts

All of these are located in `src/ai/flows/`.

Testing
-------

The project is open for enhancement. Add testing using frameworks like Vitest, Playwright, or Jest as needed.

License
-------

MIT License

Contributing
------------

1. Fork the repository
2. Create a feature branch (git checkout -b new-feature)
3. Commit and push your changes
4. Open a pull request

Contact
-------

Created with ❤️ by [Prithvi Pawar]
