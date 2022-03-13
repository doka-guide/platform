FROM node:16-alpine

ENV PATH_TO_CONTENT=./content

WORKDIR /platform
COPY . .

RUN npm ci \
&& node make-links.js

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
