type TrackFile = {
    title: string,
    url: string,
    duration: number,
}
type Track = {
    name: string,
    id: number,
    csvUrl?: string,
    csvName?: string,
    hash: string
};

type Work = {
    trackIds: Array<string>,
    thumbnailPath: string
}

type CSV = {

}