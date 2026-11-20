import { defineStorage } from '@aws-amplify/backend'

/**
 * Blog media. Only admins upload (presigned POST created by a Server Action); visitors read
 * through the CloudFront distribution defined in backend.ts (origin access control, no public
 * bucket). Versioned and kept if the stack is deleted, so a mistaken delete can be undone.
 */
export const storage = defineStorage({
  name: 'blogMedia',
  versioned: true,
  keepOnDelete: true,
  access: (allow) => ({
    'media/*': [allow.groups(['ADMINS']).to(['read', 'write', 'delete'])],
  }),
})
