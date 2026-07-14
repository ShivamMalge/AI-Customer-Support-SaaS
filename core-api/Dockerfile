FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy remaining source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
