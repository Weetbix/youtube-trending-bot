FROM node:11.8.0-alpine

WORKDIR /usr/web
# Before copying the entire workspace, copy only the package.json
# and install it. This allows us to take advantage of cached docker layers.
# see: http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
COPY ./src/web/package*.json ./
RUN npm install --only=production

# copy web app source
COPY ./src/web .

# we use the interface from the brain source
# so copy that over to the parent directory.
# in the future this should be done with lerna
WORKDIR /usr/brain
COPY ./src/brain ./

# Build the dist
WORKDIR /usr/web
RUN npm run build