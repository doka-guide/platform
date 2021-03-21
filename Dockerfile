FROM node:lts-alpine

WORKDIR /platform
COPY . .

RUN npm install \
&& ln -sf ../content/css src/css \
&& ln -sf ../content/js src/js \
&& ln -sf ../content/html src/html

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
