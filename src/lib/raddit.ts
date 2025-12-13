import axios from "axios";

const REDDIT_BASE = "https://www.reddit.com";

export async function searchReddit(keyword: string) {
  const url = `${REDDIT_BASE}/search.json?q=${encodeURIComponent(
    keyword
  )}&sort=new&limit=50`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "polartrend-bot/1.0"
    }
  });

  return response.data.data.children.map((item: any) => ({
    subreddit: item.data.subreddit,
    title: item.data.title,
    url: `${REDDIT_BASE}${item.data.permalink}`,
    createdUtc: item.data.created_utc
  }));
}
