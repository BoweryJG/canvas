FROM ghcr.io/puppeteer/puppeteer:21.0.0

USER pptruser

WORKDIR /home/pptruser/app

COPY --chown=pptruser:pptruser package*.json ./
RUN npm ci --only=production

COPY --chown=pptruser:pptruser . .

EXPOSE 3000

CMD ["node", "server-puppeteer.js"]