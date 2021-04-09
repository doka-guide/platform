FROM node:lts-alpine

WORKDIR /platform
COPY . .

RUN npm install \
&& for dir in `ls ./content/ | grep -v "docs" | grep -v "\.."`\
 ; do `ln -sf "content/$dir" "src/$fir"` ; done

VOLUME /platform/content
EXPOSE 8080

ENTRYPOINT ["npm", "start"]
