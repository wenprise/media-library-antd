/** 媒体库支持的用户可理解文件类型。 */
export type MediaKind = "image" | "video" | "document";
/** 媒体库组件需要的最小媒体记录契约。 */
export interface MediaRecord {
    id: number;
    title?: string | null;
    original_name?: string | null;
    mime_type?: string | null;
    kind?: MediaKind | null;
    url?: string | null;
    size?: number | null;
    width?: number | null;
    height?: number | null;
    alt_text?: Record<string, string> | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}
/** 相册字段保存的媒体附件契约。 */
export interface MediaAttachmentRecord {
    id?: number;
    media_asset_id: number;
    collection: string;
    collection_label?: string;
    is_primary: boolean;
    sort_order: number;
    media_asset?: MediaRecord;
}
/** 媒体分页查询参数。 */
export interface MediaListParams {
    [key: string]: unknown;
    page: number;
    page_size: number;
    keyword?: string;
    kind?: string;
}
/** 媒体分页响应契约。 */
export interface MediaListResponse {
    data: MediaRecord[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
    };
}
/** 单条媒体响应契约。 */
export interface MediaRecordResponse {
    data: MediaRecord;
}
/** 将宿主项目 API 接入公共媒体组件的客户端接口。 */
export interface MediaLibraryClient {
    list: (params: MediaListParams) => Promise<MediaListResponse>;
    get: (media_id: number) => Promise<MediaRecordResponse>;
    upload: (form_data: FormData) => Promise<MediaRecordResponse>;
    update: (media_id: number, values: Record<string, unknown>) => Promise<MediaRecordResponse>;
}
//# sourceMappingURL=types.d.ts.map