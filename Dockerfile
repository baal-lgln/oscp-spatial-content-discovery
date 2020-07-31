FROM node:12
WORKDIR /app
COPY package*.json /app
RUN npm ci --only=production
COPY . /app
EXPOSE 3000
CMD npm start