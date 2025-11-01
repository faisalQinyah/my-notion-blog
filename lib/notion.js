export async function getPublishedPosts() {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            property: 'Published',
            checkbox: { equals: true }
          },
          sorts: [
            { property: 'Created time', direction: 'descending' }
          ]
        }),
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Notion');
    }
    
    const data = await response.json();
    return data.results;
  }
  
  export async function getPostBySlug(slug) {
    const posts = await getPublishedPosts();
    return posts.find(post => {
      const postSlug = post.properties.Slug?.rich_text?.[0]?.plain_text;
      return postSlug === slug;
    });
  }
  
  export async function getPostBlocks(pageId) {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28'
        }
      }
    );
    
    const data = await response.json();
    return data.results;
  }