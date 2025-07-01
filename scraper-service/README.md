# Canvas Scraper Service

Puppeteer-based web scraping service for Canvas.

## Deployment

This service is designed to be deployed on Render.com.

1. Push to GitHub
2. Connect GitHub repo to Render
3. Deploy using the `render.yaml` configuration

## Endpoints

- `GET /` - Health check
- `POST /scrape` - Scrape a URL
- `POST /search-practice` - Search for practice websites

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)