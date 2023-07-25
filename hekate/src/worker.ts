/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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

interface NpmPackage {
  name: string;
  version: string;
  repository: {
    type: string;
    url: string;
  };
  gitHead: string;
  signatures: {
    keyid: string;
  }[];
}

async function handleRequest(request: Request): Promise<Response> {
  try {
    const { pathname } = new URL(request.url)

    // Check if the request is for the route that handles project names
    if (pathname.startsWith('/getLatestVersion/')) {
      const projectName = pathname.replace('/getLatestVersion/', '')
	    console.log("projectName: ", projectName)
      const latestVersion = await getLatestPackageVersion(projectName)
	    console.log("latestVersion: ", latestVersion)
      
      
      if (latestVersion) {
        //return new Response(latestVersion, { status: 200 })
        const metadata = await getPackageMetadata(projectName, latestVersion)

        if (metadata) {
          //const npmPackage: NpmPackage = JSON.parse(JSON.stringify(metadata));
          const url = metadata.repository.url;
          const name = metadata.name;
          const version = metadata.version;
          const keyid = metadata.dist.signatures[0].keyid;
          const gitHead = metadata.gitHead;

          console.log("URL:", url);
          console.log("Name:", name);
          console.log("Version:", version);
          console.log("KeyID:", keyid);
          console.log("Git Head:", gitHead);

          return new Response(JSON.stringify(metadata), { status: 200 })
        } else {
          return new Response('Version not found', { status: 404 })
        }
      } else {
        return new Response('Package not found', { status: 404 })
      }
    } else {
      // Return a 404 response for other routes
      return new Response('Not found', { status: 404 })
    }
  } catch (error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function getPackageMetadata(packageName: string, version: string): Promise<string | null> {
  try {
    //https://registry.npmjs.org/@trishankatdatadog/supreme-goggles/1.0.5
    const npmRegistryURL = `https://registry.npmjs.org/${packageName}/${version}`
    const response = await fetch(npmRegistryURL)

    if (response.ok) {
	  // https://github.com/node-fetch/node-fetch/issues/1262
      return await response.json();
      return data
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// https://registry.npmjs.org/@trishankatdatadog/supreme-goggles/1.0.5
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
    return null
  }
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request);
	},
};


