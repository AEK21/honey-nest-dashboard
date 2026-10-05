FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm ci --include=dev

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]