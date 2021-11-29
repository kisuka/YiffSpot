FROM node:16

WORKDIR /app

COPY package*.json ./

Copy . ./

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "-c" , "npm run build && npm run server"]