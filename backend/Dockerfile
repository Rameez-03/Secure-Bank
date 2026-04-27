FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

COPY src/ ./src/

EXPOSE 5000

CMD ["node", "src/server.js"]
