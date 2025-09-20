FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Build for production
# Allow overriding the BFF base URL at build time
ARG REACT_APP_BFF_BASE_URL=http://localhost:4000
ENV REACT_APP_BFF_BASE_URL=$REACT_APP_BFF_BASE_URL

COPY . .
RUN npm run build

# ---- Nginx runtime ----
FROM nginx:1.27-alpine

# Copy build artifacts
COPY --from=builder /app/build /usr/share/nginx/html

# SPA-friendly Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
