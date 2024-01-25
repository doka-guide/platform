FROM node:alpine3.16

ENV PATH_TO_CONTENT=./content

WORKDIR /platform
COPY . .

RUN npm ci \
&& node make-links.js

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
