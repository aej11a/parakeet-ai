const subscriptionKey = process.env.AZURE_KEY as string;
const endpoint = "https://api.bing.microsoft.com/v7.0/images/search";

const options = {
  method: "GET",
  headers: {
    "Ocp-Apim-Subscription-Key": subscriptionKey,
  },
};

export async function searchImages(searchTerm: string) {
  try {
    const uri = endpoint + "?q=" + encodeURIComponent(searchTerm);

    const response = await fetch(uri, options);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const json = await response.json();

    // // Print the URL of each image
    // json.value.forEach((image) => console.log(image.contentUrl));
    return json as Root;
  } catch (err) {
    console.error("An error has occurred: ", err);
  }
}

export interface Root {
  _type: string;
  instrumentation: Instrumentation;
  readLink: string;
  webSearchUrl: string;
  queryContext: QueryContext;
  totalEstimatedMatches: number;
  nextOffset: number;
  currentOffset: number;
  value: Image[];
  queryExpansions: QueryExpansion[];
  pivotSuggestions: PivotSuggestion[];
  relatedSearches: RelatedSearch[];
}

export interface Instrumentation {
  _type: string;
}

export interface QueryContext {
  originalQuery: string;
  alterationDisplayQuery: string;
  alterationOverrideQuery: string;
  alterationMethod: string;
  alterationType: string;
}

export interface Image {
  webSearchUrl: string;
  name: string;
  thumbnailUrl: string;
  datePublished: string;
  isFamilyFriendly: boolean;
  contentUrl: string;
  hostPageUrl: string;
  contentSize: string;
  encodingFormat: string;
  hostPageDisplayUrl: string;
  width: number;
  height: number;
  hostPageDiscoveredDate: string;
  thumbnail: Thumbnail;
  imageInsightsToken: string;
  insightsMetadata: InsightsMetadata;
  imageId: string;
  accentColor: string;
  hostPageFavIconUrl?: string;
  hostPageDomainFriendlyName?: string;
}

export interface Thumbnail {
  width: number;
  height: number;
}

export interface InsightsMetadata {
  recipeSourcesCount?: number;
  pagesIncludingCount: number;
  availableSizesCount: number;
}

export interface QueryExpansion {
  text: string;
  displayText: string;
  webSearchUrl: string;
  searchLink: string;
  thumbnail: Thumbnail2;
}

export interface Thumbnail2 {
  thumbnailUrl: string;
}

export interface PivotSuggestion {
  pivot: string;
  suggestions: Suggestion[];
}

export interface Suggestion {
  text: string;
  displayText: string;
  webSearchUrl: string;
  searchLink: string;
  thumbnail: Thumbnail3;
}

export interface Thumbnail3 {
  thumbnailUrl: string;
}

export interface RelatedSearch {
  text: string;
  displayText: string;
  webSearchUrl: string;
  searchLink: string;
  thumbnail: Thumbnail4;
}

export interface Thumbnail4 {
  thumbnailUrl: string;
}
