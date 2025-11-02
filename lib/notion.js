function slugify(text) {
  if (!text) {
    return "";
  }

  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPostSlug(post) {
  const propertySegments =
    post?.properties?.Slug?.rich_text?.map((segment) => segment?.plain_text) ??
    [];
  const providedSlug = slugify(propertySegments.join("").trim());
  if (providedSlug) {
    return providedSlug;
  }

  const titleSegments =
    post?.properties?.Name?.title?.map((segment) => segment?.plain_text) ?? [];
  const titleSlug = slugify(titleSegments.join("").trim());
  if (titleSlug) {
    return titleSlug;
  }

  return slugify(post?.id) || post?.id;
}

export async function getPublishedPosts() {
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;
  
    console.log('Fetching from Notion...');
    console.log('Database ID:', databaseId);
  
    if (!token || !databaseId) {
      throw new Error('Missing environment variables');
    }
  
    try {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${databaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sorts: [
              { timestamp: 'created_time', direction: 'descending' }
            ]
          }),
          cache: 'no-store'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Notion Error:', errorData);
        throw new Error(`Notion API: ${errorData.message || response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for published posts in code instead
      const publishedPosts = data.results.filter(post => {
        const published = post.properties.Published?.checkbox;
        return published === true;
      });
      
      console.log('Total posts:', data.results.length);
      console.log('Published posts:', publishedPosts.length);
      
      return publishedPosts;
    } catch (error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
  }
