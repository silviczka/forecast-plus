# Forecast Plus

**Forecast Plus** is an application that uses the OpenAI API, GIPHY API, and Open-Meteo API, with Redis for local development (via Docker) and Upstash for production storage.

At its current state, the application shows weather for the current hour and day, accompanied by a Fun Fact sourced from the OpenAI API and a GIF.

### Features

- **Search bar with suggestions:** Dropdown menu with selection via mouse click or arrow keys + Enter.  
- **Fun Fact & GIF search:** Keywords are based on weather description and time of day (morning/day/evening/night).  
- **OpenAI API limits:**  
  - Each user is limited to 7 OpenAI fetches per hour.  
  - Successful Fun Fact fetches are stored in the Upstash database to build a reusable collection and save OpenAI tokens.  
  - If a search uses the same keyword as a previous search within the last hour, the same Fun Fact is returned.  
  - If no stored Fun Fact exists for a keyword and 7 fetches per hour were crossed, a static fallback Fun Fact from a file is shown.  
- **Visual effects:** shadcn UI particle effects show rain, snow, or lightning where relevant.  

### Future Upgrades

- Display weather for the next 4–5 days.  
- Optional light sound effects for rain, with toggle to turn them off.  

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [pnpm](https://pnpm.io/) (installed globally)  
- [Docker](https://www.docker.com/) (for Redis database)  
- An [OpenAI API key](https://platform.openai.com/)  

---

## Get Started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Run below command to copy .env.example to .env.local and fill in required values:

   ```bash
   cp .env.example .env.local
   ```

3. Run Redis in Docker (only needed the first time):

   ```bash

   docker run -d --name redis -p 6379:6379 -v redis_data:/data redis

   ```

4. Start the app:

   ```bash
   pnpm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

**Forecast Plus** is built with the following technologies:

- **Next.js** for server-side rendering and routing  
- **React** for building UI components  
- **Tailwind CSS** for styling  
- **shadcn/ui** for particle effects  
- **Redis (Docker)** for local database caching and Upstash for production storage  
- **OpenAI API** for generating Fun Facts  
- **GIPHY API** for fetching GIFs  
- **Open-Meteo API** for fetching weather data (no API key required)

> ⚠️ **Development Warning:**  
> When running the app in development mode (`pnpm run dev`), React Strict Mode is enabled.  
> This intentionally mounts components twice to detect side effects, which can cause API requests (e.g., OpenAI, GIPHY, Open-Meteo) to fire twice.  
> As a result, the 7 OpenAI fetches per hour limit may be used up faster in development.  
> This behavior is normal and does **not** occur in production.  
>
> 💡 **Optional:** To conserve OpenAI fetches during development, you can temporarily disable Strict Mode by setting `reactStrictMode: false` in `next.config.ts`. Remember to re-enable it afterwards to benefit from development-time checks.
