const API_ROOT = `https://www.googleapis.com/youtube/v3`;

interface IPageInfo {
    resultsPerPage: number;
    totalResults: number;
}

interface IAPIResponse {
    etag: string;
    kind: string;
    nextPageToken: string;
    pageInfo: IPageInfo;
}

interface IVideoResource {
    id: string;
}

interface IVideosAPIResponse extends IAPIResponse {
    items: IVideoResource[];
}

interface ICommentsSnippet {
    textDisplay: string;
}

interface ICommentsResource {
    snippet: ICommentsSnippet;
}

interface ICommentThreadSnippet {
    topLevelComment: ICommentsResource;
}
interface ICommentThreadResource {
    id: string;
    snippet: ICommentThreadSnippet;
}

interface ICommentThreadAPIResponse extends IAPIResponse {
    items: ICommentThreadResource[];
}

export async function fetchTrendingVideos(
    apiKey: string,
    regionCode: string = 'AU',
) {
    const requestPath =
        `${API_ROOT}/videos?chart=mostPopular` +
        `&part=id` +
        `&maxResults=50` +
        `&regionCode=${regionCode}` +
        `&key=${apiKey}`;

    const response = await fetch(requestPath);
    const json = await response.json();
    const apiResponse = json as IVideosAPIResponse;

    return apiResponse.items.map(item => item.id);
}

export async function fetchCommentsForVideo(id: string, apiKey: string) {
    const requestPath =
        `${API_ROOT}/commentThreads?` +
        `&videoId=${id}` +
        `&part=snippet` +
        `&maxResults=100` +
        `&key=${apiKey}`;

    const response = await fetch(requestPath);
    const json = await response.json();
    const apiResponse = json as ICommentThreadAPIResponse;

    return apiResponse.items.map(
        item => item.snippet.topLevelComment.snippet.textDisplay,
    );
}
