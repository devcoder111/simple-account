FROM node:12.20.0-stretch as builder

# install and cache app dependencies
COPY package*.json ./
RUN npm install --only=prod --legacy-peer-deps && mkdir /react-frontend && mv ./node_modules ./react-frontend

WORKDIR /react-frontend

COPY . .

RUN npm run build


# ------------------------------------------------------
# Production Build
# ------------------------------------------------------
FROM nginx:stable-alpine-perl
COPY --from=builder /react-frontend/build /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d
COPY nginx /etc/nginx
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
