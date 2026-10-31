import rawOutputs from '@/amplify_outputs.json'

interface AmplifyOutputsShape {
  version: string
  auth?: Record<string, unknown>
  data?: { url?: string; aws_region?: string } & Record<string, unknown>
  storage?: { bucket_name?: string; aws_region?: string } & Record<string, unknown>
  custom?: { mediaBaseUrl?: string } & Record<string, unknown>
}

/** Generated per environment by Amplify; a placeholder `{ version }` before the first deploy. */
export const amplifyOutputs = rawOutputs as AmplifyOutputsShape

export const hasBackend = Boolean(amplifyOutputs.data?.url && amplifyOutputs.auth)

export const mediaBaseUrl: string | undefined = amplifyOutputs.custom?.mediaBaseUrl
