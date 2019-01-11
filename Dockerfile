FROM node:8

WORKDIR /app

COPY package*.json ./

RUN npm install

Copy . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "server" ]