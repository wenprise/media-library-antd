import { MediaAttachmentRecord, MediaKind, MediaLibraryClient, MediaRecord } from '../types';
type MediaPickerMode = "single" | "multiple";
/** 媒体库弹窗的选择模式、当前值和回调。 */
export interface MediaPickerProps {
    client: MediaLibraryClient;
    open: boolean;
    mode?: MediaPickerMode;
    selected_ids: number[];
    allowed_kinds?: MediaKind[];
    title?: string;
    onCancel: () => void;
    onConfirm: (selected_ids: number[], records: MediaRecord[]) => void;
}
/** 可被 Ant Design 表单控制的单媒体字段。 */
export interface MediaPickerFieldProps {
    client: MediaLibraryClient;
    can_manage?: boolean;
    value?: number | null;
    onChange?: (value?: number) => void;
    button_label?: string;
    allowed_kinds?: MediaKind[];
}
/** 可被 Ant Design 表单控制的多媒体附件字段。 */
export interface MediaAttachmentFieldProps {
    client: MediaLibraryClient;
    can_manage?: boolean;
    value?: MediaAttachmentRecord[];
    onChange?: (value: MediaAttachmentRecord[]) => void;
}
/** 共享拖拽上传区的上传完成回调。 */
export interface MediaUploadDraggerProps {
    client: MediaLibraryClient;
    onUploaded: (record: MediaRecord) => void;
    onBatchComplete?: () => void;
    accept?: string;
    multiple?: boolean;
}
/** 提供可复用的单文件拖拽上传交互。 */
export declare function MediaUploadDragger({ client, onUploaded, onBatchComplete, accept, multiple, }: MediaUploadDraggerProps): import("react").JSX.Element;
/** 提供媒体库筛选、分页、选择和新文件上传。 */
export default function MediaPicker({ client, open, mode, selected_ids, allowed_kinds, title, onCancel, onConfirm, }: MediaPickerProps): import("react").JSX.Element;
/** 渲染适用于 Hero 和站点设置的单媒体选择字段。 */
export declare function MediaPickerField({ client, can_manage, value, onChange, button_label, allowed_kinds, }: MediaPickerFieldProps): import("react").JSX.Element;
/** 渲染支持多图选择和拖动排序的单一相册字段。 */
export declare function MediaAttachmentField({ client, can_manage, value, onChange, }: MediaAttachmentFieldProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map