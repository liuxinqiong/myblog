ARG NODE_PLATFORM=linux/amd64
FROM --platform=${NODE_PLATFORM} node:7.10.0

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8899

COPY package.json ./
RUN curl -fsSL https://registry.npmjs.org/npm/-/npm-5.10.0.tgz -o /tmp/npm.tgz \
  && mkdir -p /tmp/npm \
  && tar -xzf /tmp/npm.tgz -C /tmp/npm --strip-components=1 \
  && node /tmp/npm/bin/npm-cli.js install --production --no-package-lock --registry=https://registry.npmjs.org/ \
  && rm -rf /tmp/npm /root/.npm

COPY . .

RUN mkdir -p /app/logs /app/public/img

EXPOSE 8899

CMD ["node", "blog-cluster.js"]
