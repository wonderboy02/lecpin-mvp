FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Railway 환경변수를 빌드 타임에 전달받기
ARG OPENAI_API_KEY
ARG NEO4J_URI
ARG NEO4J_USERNAME
ARG NEO4J_PASSWORD
ARG LANGCHAIN_TRACING_V2
ARG LANGCHAIN_API_KEY
ARG LANGCHAIN_PROJECT

# ARG를 ENV로 변환하여 npm run build에서 사용 가능하게
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEO4J_URI=${NEO4J_URI}
ENV NEO4J_USERNAME=${NEO4J_USERNAME}
ENV NEO4J_PASSWORD=${NEO4J_PASSWORD}
ENV LANGCHAIN_TRACING_V2=${LANGCHAIN_TRACING_V2}
ENV LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY}
ENV LANGCHAIN_PROJECT=${LANGCHAIN_PROJECT}

# Build Next.js
RUN npm run build

# public 폴더가 없으면 생성 (COPY 에러 방지)
RUN mkdir -p public

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
