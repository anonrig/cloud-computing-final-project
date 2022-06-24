FROM node:18

ENV PORT 3001

# Create app directory
WORKDIR /usr/src/app

# Copy dependencies to container
COPY . .

# Install app dependencies
RUN npm install

# Install wait for it.
RUN git clone https://github.com/vishnubob/wait-for-it.git

ENV NODE_ENV production

EXPOSE 3001
CMD [ "npm", "run", "prod:start" ]