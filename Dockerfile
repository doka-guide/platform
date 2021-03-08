FROM node:lts-alpine

WORKDIR /platform
COPY . .

RUN npm install
RUN ln -sf ../content/css src/css
RUN ln -sf ../content/js src/js
RUN ln -sf ../content/html src/html

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
