FROM node:lts-alpine

WORKDIR /platform
COPY . .

RUN npm install \
&& node make-links.js --default

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
