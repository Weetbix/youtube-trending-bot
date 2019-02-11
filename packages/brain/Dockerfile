FROM node:11.8.0-alpine

WORKDIR /usr/brain

# Before copying the entire workspace, copy only the package.json
# and install it. This allows us to take advantage of cached docker layers.
# see: http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
COPY package*.json ./
RUN npm install --only=production

# copy app source
COPY . .

# Build the dist
RUN npm run build