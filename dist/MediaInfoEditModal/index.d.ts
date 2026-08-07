import { MediaLibraryClient, MediaRecord } from '../types';
/** 媒体信息编辑表单的提交值。 */
export interface MediaInfoEditValues {
    title?: string;
    alt_text?: Record<string, string>;
    description?: string;
}
/** 编辑媒体信息弹窗的对外契约。 */
export interface MediaInfoEditModalProps {
    client: MediaLibraryClient;
    open: boolean;
    media_id: number;
    onCancel: () => void;
    onSaved?: (record: MediaRecord) => void;
}
/**
 * 提供与媒体库一致的用户可读元数据编辑（标题、替代文本、说明）。
 * 组件通过 client 读取并保存媒体记录，宿主项目只需注入媒体客户端。
 */
export default function MediaInfoEditModal({ client, open, media_id, onCancel, onSaved, }: MediaInfoEditModalProps): import("react").JSX.Element;
//# sourceMappingURL=index.d.ts.map