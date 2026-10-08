import { loadEnvConfig } from "@next/env"

import { defineConfig } from "prisma/config"

loadEnvConfig(process.cwd())

const directUrl = process.env.DIRECT_URL

export default defineConfig({
  schema: "prisma/schema.prisma",

  ...(directUrl ? { datasource: { url: directUrl } } : {}),
})
