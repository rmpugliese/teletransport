FROM node:16.17.0
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
RUN npm install
CMD ["npm", "start"]
