import axios from "axios";

export interface WikiArticle {
  title: string;
  summary: string;
  fullText: string;
}

function extractTitleFromUrl(url: string): string {
  // Handle URLs like:
  // https://en.wikipedia.org/wiki/Quantum_mechanics
  // https://en.m.wikipedia.org/wiki/Quantum_mechanics
  // Quantum_mechanics (just a title)
  const wikiMatch = url.match(/wikipedia\.org\/wiki\/(.+?)(?:#.*)?$/);
  if (wikiMatch) {
    return decodeURIComponent(wikiMatch[1].replace(/_/g, " "));
  }

  // If it's not a URL, treat it as a title
  return decodeURIComponent(url.replace(/_/g, " "));
}

export async function fetchArticle(urlOrTitle: string): Promise<WikiArticle> {
  const title = extractTitleFromUrl(urlOrTitle);
  const encodedTitle = encodeURIComponent(title);

  try {
    // Fetch summary from REST API
    const summaryResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`,
      {
        headers: {
          "User-Agent": "QuizVerseAI/1.0 (educational quiz platform)",
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    const summaryData = summaryResponse.data;
    const summary: string = summaryData.extract || "";
    const articleTitle: string = summaryData.title || title;

    // Fetch full text
    let fullText = "";
    try {
      fullText = await fetchFullText(encodedTitle);
    } catch {
      // Fall back to summary-only if full text fetch fails
      fullText = summary;
    }

    return {
      title: articleTitle,
      summary,
      fullText: fullText || summary,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Wikipedia article not found: "${title}"`);
      }
      throw new Error(
        `Failed to fetch Wikipedia article: ${error.response?.statusText || error.message}`
      );
    }
    throw new Error("Failed to fetch Wikipedia article.");
  }
}

export async function fetchFullText(titleOrEncodedTitle: string): Promise<string> {
  const encodedTitle = encodeURIComponent(
    decodeURIComponent(titleOrEncodedTitle)
  );

  try {
    // Use the TextExtracts API for clean plain text
    const response = await axios.get("https://en.wikipedia.org/w/api.php", {
      params: {
        action: "query",
        titles: decodeURIComponent(encodedTitle),
        prop: "extracts",
        explaintext: true,
        exlimit: 1,
        format: "json",
        origin: "*",
      },
      headers: {
        "User-Agent": "QuizVerseAI/1.0 (educational quiz platform)",
      },
      timeout: 15000,
    });

    const pages = response.data?.query?.pages;
    if (!pages) {
      throw new Error("No pages returned from Wikipedia API.");
    }

    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === "-1") {
      throw new Error("Wikipedia article not found.");
    }

    const extract: string = pages[pageId].extract || "";
    return extract;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch full Wikipedia text: ${error.response?.statusText || error.message}`
      );
    }
    throw error;
  }
}

export async function searchWikipedia(
  query: string,
  limit: number = 5
): Promise<Array<{ title: string; description: string; url: string }>> {
  try {
    const response = await axios.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params: {
          action: "opensearch",
          search: query,
          limit,
          namespace: 0,
          format: "json",
        },
        headers: {
          "User-Agent": "QuizVerseAI/1.0 (educational quiz platform)",
        },
        timeout: 10000,
      }
    );

    const [, titles, descriptions, urls] = response.data as [
      string,
      string[],
      string[],
      string[],
    ];

    return titles.map((title: string, i: number) => ({
      title,
      description: descriptions[i] || "",
      url: urls[i] || "",
    }));
  } catch {
    return [];
  }
}
