FROM node:10

WORKDIR /app

COPY package*.json ./

Copy . ./

RUN npm install

ENTRYPOINT [ "sh", "/app/run.sh" ]

EXPOSE 3000