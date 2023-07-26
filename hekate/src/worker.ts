/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

async function getLatestPackageVersion(projectName: string): Promise<string | null> {
  try {
    const npmRegistryURL = `https://registry.npmjs.org/${projectName}`
    const response = await fetch(npmRegistryURL)

    if (response.ok) {
    // https://github.com/node-fetch/node-fetch/issues/1262
      const data = (await response.json()) as any;
      return data['dist-tags']?.latest || null
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

async function getNpmMetadata(packageName: string, version: string): Promise<string | null> {
  try {
    const npmRegistryURL = `https://registry.npmjs.org/${packageName}/${version}`
    const response = await fetch(npmRegistryURL)

    if (response.ok) {
    // https://github.com/node-fetch/node-fetch/issues/1262
      return await response.json();
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

async function getNpmAttestations(packageName: string, version: string): Promise<string | null> {
  try {
    const npmRegistryURL = `https://registry.npmjs.org/-/npm/v1/attestations/${packageName}@${version}`
    const response = await fetch(npmRegistryURL)

    if (response.ok) {
    // https://github.com/node-fetch/node-fetch/issues/1262
      return await response.json();
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

async function handleRequest(request: Request): Promise<Response> {
  try {
    const { pathname } = new URL(request.url)

    // Check if the request is for the route that handles package names
    if (pathname.startsWith('/package/')) {
      // FIXME: Consider a more robust method.
      const packageName = pathname.replace('/package/', '')
      console.log("packageName: ", packageName)
      const latestVersion = await getLatestPackageVersion(packageName)
      console.log("latestVersion: ", latestVersion)

      if (latestVersion) {
        const npmMetadata = await getNpmMetadata(packageName, latestVersion)

        if (npmMetadata) {
          const npmAttestations = await getNpmAttestations(packageName, latestVersion)

          if (npmAttestations) {
            return Response.json(npmAttestations)
          } else {
            return new Response(`Attestations not found for ${packageName}@${latestVersion}`, { status: 404 })
          }
        } else {
          return new Response(`Latest version not found for package: ${packageName}`, { status: 404 })
        }
      } else {
        return new Response(`Package ${packageName} not found`, { status: 404 })
      }
    } else {
      // Return a 404 response for other routes
      return new Response('Not found', { status: 404 })
    }
  } catch (error) {
    console.error(`Error: ${error}`)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request)
  },
};
