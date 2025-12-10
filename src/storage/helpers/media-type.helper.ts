//check all file media type
export function detectMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('svg/')) return 'svg';
    if (mimeType === 'application/pdf') return 'pdf';
    if (
        mimeType.startsWith('application/') ||
        mimeType.startsWith('text/')
    ) {
        return 'document';
    }
    return 'file';
}
