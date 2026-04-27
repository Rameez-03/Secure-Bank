# Stage 1 — build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# VITE_API_URL is relative so nginx can proxy /api/ to the backend container
ENV VITE_API_URL=/api

RUN npm run build

# Stage 2 — serve the compiled static files with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
