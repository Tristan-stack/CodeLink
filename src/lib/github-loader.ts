import {GithubRepoLoader} from '@langchain/community/document_loaders/web/github'

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) =>{
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package.json','yarne.lock','pnpm-lock.yaml','package-lock.json','node_modules','bun.lockb'],
        recursive: true,
        unknown:'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs
}

console.log(await loadGithubRepo('https://github.com/Tristan-stack/CodeLink'))

// Document {
//     pageContent: "\"use client\";\n\nimport { QueryClientProvider, type QueryClient } from \"@tanstack/react-query\";\nimport { loggerLink, unstable_httpBatchStreamLink } from \"@trpc/client\";\nimport { createTRPCReact } from \"@trpc/react-query\";\nimport { type inferRouterInputs, type inferRouterOutputs } from \"@trpc/server\";\nimport { useState } from \"react\";\nimport SuperJSON from \"superjson\";\n\nimport { type AppRouter } from \"@/server/api/root\";\nimport { createQueryClient } from \"./query-client\";\n\nlet clientQueryClientSingleton: QueryClient | undefined = undefined;\nconst getQueryClient = () => {\n  if (typeof window === \"undefined\") {\n    // Server: always make a new query client\n    return createQueryClient();\n  }\n  // Browser: use singleton pattern to keep the same query client\n  return (clientQueryClientSingleton ??= createQueryClient());\n};\n\nexport const api = createTRPCReact<AppRouter>();\n\n/**\n * Inference helper for inputs.\n *\n * @example type HelloInput = RouterInputs['example']['hello']\n */\nexport type RouterInputs = inferRouterInputs<AppRouter>;\n\n/**\n * Inference helper for outputs.\n *\n * @example type HelloOutput = RouterOutputs['example']['hello']\n */\nexport type RouterOutputs = inferRouterOutputs<AppRouter>;\n\nexport function TRPCReactProvider(props: { children: React.ReactNode }) {\n  const queryClient = getQueryClient();\n\n  const [trpcClient] = useState(() =>\n    api.createClient({\n      links: [\n        loggerLink({\n          enabled: (op) =>\n            process.env.NODE_ENV === \"development\" ||\n            (op.direction === \"down\" && op.result instanceof Error),\n        }),\n        unstable_httpBatchStreamLink({\n          transformer: SuperJSON,\n          url: getBaseUrl() + \"/api/trpc\",\n          headers: () => {\n            const headers = new Headers();\n            headers.set(\"x-trpc-source\", \"nextjs-react\");\n            return headers;\n          },\n        }),\n      ],\n    })\n  );\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <api.Provider client={trpcClient} queryClient={queryClient}>\n        {props.children}\n      </api.Provider>\n    </QueryClientProvider>\n  );\n}\n\nfunction getBaseUrl() {\n  if (typeof window !== \"undefined\") return window.location.origin;\n  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;\n  return `http://localhost:${process.env.PORT ?? 3000}`;\n}\n",
//         metadata: {
//         source: "src/trpc/react.tsx",
//             repository: "https://github.com/Tristan-stack/CodeLink",
//                 branch: "main",
//     },
//     id: undefined,
