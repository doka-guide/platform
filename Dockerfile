FROM node:16-alpine

WORKDIR /platform
COPY . .

RUN npm ci \
&& node make-links.js --default

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
