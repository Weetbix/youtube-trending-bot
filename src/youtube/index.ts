const API_ROOT = `https://www.googleapis.com/youtube/v3`;

interface IPageInfo {
    resultsPerPage: number;
    totalResults: number;
}

interface IAPIResponse {
    etag: string;
    kind: string;
    nextPageToken: string | undefined;
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

/**
 * Fetches the CommentThreadResponse resource
 *
 * @param id        Youtube video ID to fetch for
 * @param apiKey    Youtube API key to use
 * @param pageToken The page token to start at. If no page
 *                  token is provided, the results will start
 *                  from the beginning.
 */
async function fetchThreadForVideo(
    id: string,
    apiKey: string,
    pageToken: string | undefined,
) {
    const requestPath =
        `${API_ROOT}/commentThreads?` +
        `&videoId=${id}` +
        `&part=snippet` +
        `&maxResults=100` +
        `&key=${apiKey}` +
        `${pageToken ? '&pageToken=' + pageToken : ''}`;

    const response = await fetch(requestPath);
    const json = await response.json();
    return json as ICommentThreadAPIResponse;
}

/**
 * Iterates through and collects all the comments for the
 * given video.
 */
export async function fetchAllCommentsForVideo(id: string, apiKey: string) {
    let pageToken;
    let comments: string[] = [];

    do {
        // fetch the current comment list
        const apiResponse: ICommentThreadAPIResponse = await fetchThreadForVideo(
            id,
            apiKey,
            pageToken,
        );
        // Add them all to our list
        comments = [
            ...comments,
            ...apiResponse.items.map(
                item => item.snippet.topLevelComment.snippet.textDisplay,
            ),
        ];

        // Take the page token and use it (if it exists) to fetch more comments.
        pageToken = apiResponse.nextPageToken;
    } while (pageToken);

    return comments;
}
