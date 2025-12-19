FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./

EXPOSE 3000

CMD ["sh", "-lc", "npm install && npm run dev"]
