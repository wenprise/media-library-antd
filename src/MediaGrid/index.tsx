import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	EyeOutlined,
	FileOutlined,
} from "@ant-design/icons";
import { Button, Empty, Image, Tooltip } from "antd";
import type { MediaRecord } from "../types";
import styles from "./index.module.less";

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

const media_kind_labels: Record<string, string> = {
	image: "图片",
	video: "视频",
	document: "文档",
};

/** 返回媒体在管理界面中的用户可读名称。 */
export function getMediaName(record?: MediaRecord, fallback_id?: number) {
	return (
		record?.title || record?.original_name || `媒体 #${fallback_id ?? "-"}`
	);
}

/** 渲染图片缩略图或非图片文件占位。 */
export function MediaPreview({ record }: { record?: MediaRecord }) {
	if (record?.kind === "image" && record.url) {
		return (
			<Image
				src={record.url}
				alt={getMediaName(record)}
				preview={false}
				className={styles["media-grid__preview-image"]}
			/>
		);
	}

	return (
		<span className={styles["media-grid__file-preview"]} aria-hidden="true">
			<FileOutlined />
			<small>{media_kind_labels[record?.kind ?? ""] ?? "文件"}</small>
		</span>
	);
}

/** 提供媒体选择器和管理页共用的响应式媒体网格。 */
export default function MediaGrid({
	records,
	selectable = false,
	selected_ids = [],
	empty_text = "没有找到符合条件的媒体",
	onToggle,
	onPreview,
	onEdit,
	onDownload,
	onDelete,
}: MediaGridProps) {
	const selected_id_set = new Set(selected_ids);

	if (records.length === 0) return <Empty description={empty_text} />;

	return (
		<div className={styles["media-grid"]}>
			{records.map((record) => {
				const selected = selected_id_set.has(record.id);
				const media_name = getMediaName(record);
				const dimensions =
					record.width && record.height
						? `${record.width} × ${record.height}`
						: (media_kind_labels[record.kind ?? ""] ?? "文件");

				return (
					<div
						key={record.id}
						className={
							styles[
								selected ? "media-grid__item--selected" : "media-grid__item"
							]
						}
					>
						{selectable ? (
							<button
								type="button"
								className={styles["media-grid__select-button"]}
								aria-label={`${selected ? "取消选择" : "选择"} ${media_name}`}
								aria-pressed={selected}
								onClick={() => onToggle?.(record)}
							>
								<MediaPreview record={record} />
							</button>
						) : (
							<button
								type="button"
								className={styles["media-grid__select-button"]}
								aria-label={`预览 ${media_name}`}
								onClick={() => onPreview?.(record)}
							>
								<MediaPreview record={record} />
							</button>
						)}
						<div className={styles["media-grid__content"]}>
							<strong title={media_name}>{media_name}</strong>
							{record.title && record.original_name && (
								<small title={record.original_name}>
									{record.original_name}
								</small>
							)}
							<small>{dimensions}</small>
						</div>
						{(onPreview || onEdit || onDownload || onDelete) && (
							<div className={styles["media-grid__actions"]}>
								{selectable && onPreview && (
									<Tooltip title="预览">
										<Button
											type="text"
											size="small"
											icon={<EyeOutlined />}
											aria-label={`预览 ${media_name}`}
											onClick={() => onPreview(record)}
										/>
									</Tooltip>
								)}
								{onEdit && (
									<Tooltip title="编辑信息">
										<Button
											type="text"
											size="small"
											icon={<EditOutlined />}
											aria-label={`编辑 ${media_name}`}
											onClick={() => onEdit(record)}
										/>
									</Tooltip>
								)}
								{onDownload && (
									<Tooltip title="下载">
										<Button
											type="text"
											size="small"
											icon={<DownloadOutlined />}
											aria-label={`下载 ${media_name}`}
											onClick={() => onDownload(record)}
										/>
									</Tooltip>
								)}
								{onDelete && (
									<Tooltip title="删除">
										<Button
											type="text"
											size="small"
											danger
											icon={<DeleteOutlined />}
											aria-label={`删除 ${media_name}`}
											onClick={() => onDelete(record)}
										/>
									</Tooltip>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
