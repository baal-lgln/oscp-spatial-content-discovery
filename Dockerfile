################### BUILD IMAGE #################
FROM public.ecr.aws/bitnami/node:18.20.4-debian-12-r12 AS build-env

WORKDIR /app

COPY . /app

# RUN npm install
RUN npm ci

COPY .env /app/.env

################### RUN IMAGE ###################
FROM node:18.20.4-slim AS app

COPY --from=build-env /app /app

WORKDIR /app

EXPOSE 3000

CMD ["/bin/bash", "-c", "npm run start -- --host 0.0.0.0"]
