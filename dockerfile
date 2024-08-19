FROM node:20-alpine

RUN mkdir -p /home/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 4477

CMD ["npm", "run", "start"]
