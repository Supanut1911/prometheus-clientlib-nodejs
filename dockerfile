FROM node:20-alpine

RUN mkdir -p /home/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
