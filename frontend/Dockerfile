FROM node:18

ENV PORT 3000

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Build next.js dependencies
RUN npm run build

ENV NODE_ENV production

EXPOSE 3000
CMD [ "npm", "start" ]