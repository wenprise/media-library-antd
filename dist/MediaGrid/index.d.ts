import { MediaRecord } from '../types';
/** 媒体网格的记录、选择状态和管理操作。 */
export interface MediaGridProps {
    records: MediaRecord[];
    selectable?: boolean;
    selected_ids?: number[];
    empty_text?: string;
    onToggle?: (record: MediaRecord) => void;
    onPreview?: (record: MediaRecord) => void;
    onEdit?: (record: MediaRecord) => void;
    onDownload?: (record: MediaRecord) => void;
    onDelete?: (record: MediaRecord) => void;
}
/** 返回媒体在管理界面中的用户可读名称。 */
export declare function getMediaName(record?: MediaRecord, fallback_id?: number): string;
/** 渲染图片缩略图或非图片文件占位。 */
export declare function MediaPreview({ record }: {
    record?: MediaRecord;
}): import("react").JSX.Element;
/** 提供媒体选择器和管理页共用的响应式媒体网格。 */
export default function MediaGrid({ records, selectable, selected_ids, empty_text, onToggle, onPreview, onEdit, onDownload, onDelete, }: MediaGridProps): import("react").JSX.Element;
//# sourceMappingURL=index.d.ts.map