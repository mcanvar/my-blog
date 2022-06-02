export const postsByDate = /* GraphQL */ `
  query PostsByDate(
    $language: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByDate(
      language: $language
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        language
        title
        slug
        content
        description
        createdAt
      }
      nextToken
    }
  }
`
