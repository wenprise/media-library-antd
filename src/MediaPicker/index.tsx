import {
	DeleteOutlined,
	PictureOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
	App,
	Button,
	Input,
	Modal,
	Pagination,
	Select,
	Spin,
	Tabs,
	Upload,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaGrid, { getMediaName, MediaPreview } from "../MediaGrid";
import type {
	MediaAttachmentRecord,
	MediaKind,
	MediaLibraryClient,
	MediaRecord,
} from "../types";
import styles from "./index.module.less";

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

const media_kind_options = [
	{ value: "image", label: "图片" },
	{ value: "video", label: "视频" },
	{ value: "document", label: "文档" },
];

/** 提供可复用的单文件拖拽上传交互。 */
export function MediaUploadDragger({
	client,
	onUploaded,
	onBatchComplete,
	accept = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf,.doc,.docx",
	multiple = false,
}: MediaUploadDraggerProps) {
	const { message } = App.useApp();
	const [uploading, setUploading] = useState(false);
	const pending_uploads = useRef(0);
	const upload_hint = accept.startsWith("image/")
		? "支持 JPG、PNG、WebP 和 GIF 图片，单文件最大 20MB"
		: "支持图片、MP4/WebM 视频、PDF 和 Word 文档，单文件最大 20MB";

	/** 上传文件并将新媒体返回调用方。 */
	const upload: NonNullable<UploadProps["customRequest"]> = async (options) => {
		pending_uploads.current += 1;
		setUploading(true);
		const form_data = new FormData();
		form_data.append("file", options.file as Blob);
		try {
			const response = await client.upload(form_data);
			options.onSuccess?.(response);
			message.success(`${(options.file as File).name} 上传成功`);
			onUploaded(response.data);
		} catch (error) {
			options.onError?.(error as Error);
		} finally {
			pending_uploads.current -= 1;
			if (pending_uploads.current === 0) {
				setUploading(false);
				onBatchComplete?.();
			}
		}
	};

	return (
		<Upload.Dragger
			accept={accept}
			customRequest={upload}
			disabled={uploading}
			multiple={multiple}
			maxCount={multiple ? undefined : 1}
			showUploadList
		>
			<p className={styles["media-picker__upload-icon"]}>
				<UploadOutlined />
			</p>
			<p>点击或拖拽文件到这里上传</p>
			<p className={styles["media-picker__upload-hint"]}>
				{upload_hint}
				{multiple ? "，可一次选择多个文件" : ""}
			</p>
		</Upload.Dragger>
	);
}

/** 提供媒体库筛选、分页、选择和新文件上传。 */
export default function MediaPicker({
	client,
	open,
	mode = "single",
	selected_ids,
	allowed_kinds,
	title = "选择媒体",
	onCancel,
	onConfirm,
}: MediaPickerProps) {
	const [active_tab, setActiveTab] = useState("library");
	const [records, setRecords] = useState<MediaRecord[]>([]);
	const [selected_id_set, setSelectedIdSet] = useState<Set<number>>(new Set());
	const [keyword_input, setKeywordInput] = useState("");
	const [keyword, setKeyword] = useState("");
	const [kind, setKind] = useState<string>();
	const [page, setPage] = useState(1);
	const [page_size, setPageSize] = useState(24);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const record_cache = useRef<Map<number, MediaRecord>>(new Map());
	const selected_ids_key = selected_ids.join(",");
	const locked_kind =
		allowed_kinds?.length === 1 ? allowed_kinds[0] : undefined;
	const upload_accept =
		allowed_kinds?.length === 1
			? {
					image: "image/jpeg,image/png,image/webp,image/gif",
					video: "video/mp4,video/webm",
					document: "application/pdf,.doc,.docx",
				}[allowed_kinds[0]]
			: undefined;

	useEffect(() => {
		if (!open) return;
		const next_selected_ids = selected_ids_key
			? selected_ids_key.split(",").map(Number)
			: [];
		setSelectedIdSet(new Set(next_selected_ids));
		setActiveTab("library");
		setKind(locked_kind);
	}, [locked_kind, open, selected_ids_key]);

	/** 读取当前筛选条件的媒体分页。 */
	const loadMedia = useCallback(async () => {
		setLoading(true);
		try {
			const response = await client.list({
				page,
				page_size,
				keyword: keyword || undefined,
				kind,
			});
			response.data.forEach((record) => {
				record_cache.current.set(record.id, record);
			});
			setRecords(response.data);
			setTotal(response.meta.total);
			setPageSize(response.meta.per_page);
		} finally {
			setLoading(false);
		}
	}, [client, kind, keyword, page, page_size]);

	useEffect(() => {
		if (open && active_tab === "library") void loadMedia();
	}, [active_tab, loadMedia, open]);

	/** 根据单选或多选模式更新当前选中集合。 */
	const toggleMedia = (record: MediaRecord) => {
		record_cache.current.set(record.id, record);
		setSelectedIdSet((current) => {
			if (mode === "single") return new Set([record.id]);
			const next_ids = new Set(current);
			if (next_ids.has(record.id)) next_ids.delete(record.id);
			else next_ids.add(record.id);
			return next_ids;
		});
	};

	/** 选中刚上传的媒体并返回媒体库。 */
	const handleUploaded = (record: MediaRecord) => {
		record_cache.current.set(record.id, record);
		setSelectedIdSet((current) =>
			mode === "single"
				? new Set([record.id])
				: new Set([...current, record.id]),
		);
	};

	/** 全部文件上传完成后重置筛选并展示新媒体。 */
	const handleUploadBatchComplete = () => {
		setPage(1);
		setKeyword("");
		setKeywordInput("");
		setKind(locked_kind);
		setActiveTab("library");
	};

	const selected_count = selected_id_set.size;
	const tab_items = [
		{
			key: "library",
			label: "媒体库",
			children: (
				<div className={styles["media-picker"]}>
					<div className={styles["media-picker__toolbar"]}>
						<Input.Search
							value={keyword_input}
							allowClear
							placeholder="搜索文件名"
							aria-label="搜索媒体文件"
							onChange={(event) => setKeywordInput(event.target.value)}
							onSearch={(value) => {
								setPage(1);
								setKeyword(value.trim());
							}}
						/>
						<Select
							value={kind}
							allowClear={!locked_kind}
							placeholder="全部类型"
							aria-label="媒体类型"
							disabled={Boolean(locked_kind)}
							options={media_kind_options.filter(
								(option) =>
									!allowed_kinds ||
									allowed_kinds.includes(option.value as MediaKind),
							)}
							onChange={(value) => {
								setPage(1);
								setKind(value);
							}}
						/>
					</div>
					<Spin spinning={loading}>
						<MediaGrid
							records={records}
							selectable
							selected_ids={[...selected_id_set]}
							onToggle={toggleMedia}
						/>
					</Spin>
					{total > page_size && (
						<Pagination
							current={page}
							pageSize={page_size}
							total={total}
							showSizeChanger={false}
							onChange={setPage}
						/>
					)}
				</div>
			),
		},
		{
			key: "upload",
			label: "上传新媒体",
			children: (
				<MediaUploadDragger
					client={client}
					accept={upload_accept}
					multiple={mode === "multiple"}
					onUploaded={handleUploaded}
					onBatchComplete={handleUploadBatchComplete}
				/>
			),
		},
	];

	return (
		<Modal
			title={title}
			open={open}
			width={960}
			destroyOnHidden
			mask={{ closable: false }}
			onCancel={onCancel}
			footer={[
				<span className={styles["media-picker__selection-count"]} key="count">
					已选 {selected_count} 项
				</span>,
				<Button key="cancel" onClick={onCancel}>
					取消
				</Button>,
				<Button
					type="primary"
					key="confirm"
					onClick={() => {
						const next_ids = [...selected_id_set];
						const selected_records = next_ids
							.map((id) => record_cache.current.get(id))
							.filter((record): record is MediaRecord => Boolean(record));
						onConfirm(next_ids, selected_records);
					}}
				>
					使用所选媒体
				</Button>,
			]}
		>
			<Tabs activeKey={active_tab} items={tab_items} onChange={setActiveTab} />
		</Modal>
	);
}

/** 渲染适用于 Hero 和站点设置的单媒体选择字段。 */
export function MediaPickerField({
	client,
	can_manage = true,
	value,
	onChange,
	button_label = "选择媒体",
	allowed_kinds,
}: MediaPickerFieldProps) {
	const [picker_open, setPickerOpen] = useState(false);
	const [selected_record, setSelectedRecord] = useState<MediaRecord>();
	const [preview_failed, setPreviewFailed] = useState(false);

	useEffect(() => {
		if (!value || !can_manage) {
			setSelectedRecord(undefined);
			setPreviewFailed(false);
			return;
		}
		let active = true;
		setPreviewFailed(false);
		void client
			.get(value)
			.then((response) => {
				if (active) setSelectedRecord(response.data);
			})
			.catch(() => {
				if (active) setPreviewFailed(true);
			});
		return () => {
			active = false;
		};
	}, [can_manage, client, value]);

	return (
		<div className={styles["media-picker-field"]}>
			{value ? (
				<div className={styles["media-picker-field__selection"]}>
					<div className={styles["media-picker-field__thumbnail"]}>
						<MediaPreview record={selected_record} />
					</div>
					<span>
						{getMediaName(selected_record, value)}
						{preview_failed ? " （预览加载失败）" : ""}
					</span>
				</div>
			) : (
				<span className={styles["media-picker-field__empty"]}>
					尚未选择媒体
				</span>
			)}
			<div className={styles["media-picker-field__actions"]}>
				<Button
					icon={<PictureOutlined />}
					disabled={!can_manage}
					title={!can_manage ? "当前账号没有媒体库权限" : undefined}
					onClick={() => setPickerOpen(true)}
				>
					{value ? "更换媒体" : button_label}
				</Button>
				{value && (
					<Button danger onClick={() => onChange?.(undefined)}>
						清除
					</Button>
				)}
			</div>
			<MediaPicker
				client={client}
				open={picker_open}
				mode="single"
				selected_ids={value ? [value] : []}
				allowed_kinds={allowed_kinds}
				onCancel={() => setPickerOpen(false)}
				onConfirm={(selected_ids, records) => {
					const next_id = selected_ids[0];
					setSelectedRecord(records.find((record) => record.id === next_id));
					onChange?.(next_id);
					setPickerOpen(false);
				}}
			/>
		</div>
	);
}

/** 将相册顺序转换成后端现有的媒体附件保存结构。 */
function normalizeGalleryAttachments(
	attachments: MediaAttachmentRecord[],
): MediaAttachmentRecord[] {
	return attachments.map((attachment, index) => ({
		...attachment,
		collection: "gallery",
		is_primary: index === 0,
		sort_order: index,
	}));
}

/** 渲染支持多图选择和拖动排序的单一相册字段。 */
export function MediaAttachmentField({
	client,
	can_manage = true,
	value = [],
	onChange,
}: MediaAttachmentFieldProps) {
	const [picker_open, setPickerOpen] = useState(false);
	const [dragged_index, setDraggedIndex] = useState<number>();

	const ordered_attachments = useMemo(
		() =>
			[...value].sort((first, second) => first.sort_order - second.sort_order),
		[value],
	);

	/** 将指定图片移动到目标位置并重新生成封面和顺序。 */
	const moveAttachment = (from_index: number, to_index: number) => {
		if (from_index === to_index) return;
		const next_attachments = [...ordered_attachments];
		const [moved_attachment] = next_attachments.splice(from_index, 1);
		next_attachments.splice(to_index, 0, moved_attachment);
		onChange?.(normalizeGalleryAttachments(next_attachments));
	};

	/** 移除指定图片并让新的第一张图自动成为封面。 */
	const removeAttachment = (index: number) => {
		onChange?.(
			normalizeGalleryAttachments(
				ordered_attachments.filter(
					(_, current_index) => current_index !== index,
				),
			),
		);
	};

	const selected_ids = useMemo(
		() => ordered_attachments.map((attachment) => attachment.media_asset_id),
		[ordered_attachments],
	);

	return (
		<div className={styles["media-attachment-field"]}>
			{value.length > 0 ? (
				<ul className={styles["media-attachment-field__grid"]}>
					{ordered_attachments.map((attachment, index) => {
						const media_name = getMediaName(
							attachment.media_asset,
							attachment.media_asset_id,
						);
						return (
							<li
								className={styles["media-attachment-field__item"]}
								key={attachment.id ?? attachment.media_asset_id}
								aria-label={media_name}
								draggable
								onDragStart={() => setDraggedIndex(index)}
								onDragOver={(event) => event.preventDefault()}
								onDrop={() => {
									if (dragged_index !== undefined) {
										moveAttachment(dragged_index, index);
									}
									setDraggedIndex(undefined);
								}}
								onDragEnd={() => setDraggedIndex(undefined)}
							>
								<div className={styles["media-attachment-field__preview"]}>
									<MediaPreview record={attachment.media_asset} />
									{index === 0 && (
										<span className={styles["media-attachment-field__cover"]}>
											封面
										</span>
									)}
								</div>
								<span
									className={styles["media-attachment-field__name"]}
									title={media_name}
								>
									{media_name}
								</span>
								<div className={styles["media-attachment-field__item-actions"]}>
									<small>拖动调整顺序</small>
									<div>
										<Button
											type="text"
											size="small"
											danger
											icon={<DeleteOutlined />}
											aria-label={`移除 ${media_name}`}
											onClick={() => removeAttachment(index)}
										/>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			) : (
				<span className={styles["media-attachment-field__empty"]}>
					尚未添加相册图片
				</span>
			)}
			<div className={styles["media-attachment-field__actions"]}>
				<Button
					type="primary"
					icon={<PictureOutlined />}
					disabled={!can_manage}
					title={!can_manage ? "当前账号没有媒体库权限" : undefined}
					onClick={() => setPickerOpen(true)}
				>
					{ordered_attachments.length > 0 ? "选择更多图片" : "选择图片"}
				</Button>
				{ordered_attachments.length > 0 && (
					<Button danger onClick={() => onChange?.([])}>
						清空所有
					</Button>
				)}
				<span className={styles["media-attachment-field__hint"]}>
					可选择多张图片并拖动排序，第一张图片将作为封面。
				</span>
			</div>
			<MediaPicker
				client={client}
				open={picker_open}
				mode="multiple"
				selected_ids={selected_ids}
				allowed_kinds={["image"]}
				title="选择相册图片"
				onCancel={() => setPickerOpen(false)}
				onConfirm={(next_ids, records) => {
					const current_attachments = new Map(
						ordered_attachments.map((attachment) => [
							attachment.media_asset_id,
							attachment,
						]),
					);
					const selected_records = new Map(
						records.map((record) => [record.id, record]),
					);
					onChange?.(
						normalizeGalleryAttachments(
							next_ids.map(
								(media_asset_id, index) =>
									current_attachments.get(media_asset_id) ?? {
										media_asset_id,
										collection: "gallery",
										is_primary: index === 0,
										sort_order: index,
										media_asset: selected_records.get(media_asset_id),
									},
							),
						),
					);
					setPickerOpen(false);
				}}
			/>
		</div>
	);
}
