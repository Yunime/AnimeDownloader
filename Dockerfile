FROM node:18

ENV TZ Europe/Rome

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "node", "script.js" ]




