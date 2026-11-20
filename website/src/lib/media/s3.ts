import 'server-only'
import { S3Client } from '@aws-sdk/client-s3'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { cookies } from 'next/headers'
import { amplifyOutputs } from '../amplify/outputs'
import { runWithAmplifyServerContext } from '../amplify/runner'

/**
 * S3 client signed with the signed-in admin's own identity-pool credentials (the ADMINS group
 * role, limited to media/*). The hosting compute role has no S3 access of its own.
 */
export async function adminMediaBucket(): Promise<{ client: S3Client; bucket: string }> {
  const bucket = amplifyOutputs.storage?.bucket_name
  const region = amplifyOutputs.storage?.aws_region
  if (!bucket || !region) throw new Error('Media storage is not configured.')

  const credentials = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => (await fetchAuthSession(contextSpec)).credentials,
  })
  if (!credentials) throw new Error('Your session has no AWS credentials. Sign in again.')
  return { client: new S3Client({ region, credentials }), bucket }
}
