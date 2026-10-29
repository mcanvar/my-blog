import { defineStorage } from '@aws-amplify/backend'

/**
 * Blog media. Only admins upload; visitors read through the CloudFront
 * distribution defined in backend.ts (origin access control, no public bucket).
 */
export const storage = defineStorage({
  name: 'blogMedia',
  access: (allow) => ({
    'media/*': [allow.groups(['ADMINS']).to(['read', 'write', 'delete'])],
  }),
})
