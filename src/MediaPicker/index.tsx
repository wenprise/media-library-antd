import {
	CloseOutlined,
	DeleteOutlined,
	EditOutlined,
	PictureOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
	App,
	Button,
	Input,
	Modal,
	Select,
	Spin,
	Tabs,
	Upload,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MediaGrid, { getMediaName, MediaPreview } from "../MediaGrid";
import MediaInfoEditModal from "../MediaInfoEditModal";
import type {
	MediaAttachmentRecord,
	MediaKind,
	MediaLibraryClient,
	MediaRecord,
	MediaRecordResponse,
} from "../types";
import styles from "./index.module.less";

type MediaPickerMode = "single" | "multiple";

const default_page_size = 15;
const load_more_threshold = 32;

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
	allowed_kinds?: MediaKind[];
	card_layout?: boolean;
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

/** 通过宿主客户端上传单个文件并返回完整响应。 */
async function upload_single_file(
	client: MediaLibraryClient,
	file: File | Blob,
): Promise<MediaRecordResponse> {
	const form_data = new FormData();
	form_data.append("file", file);
	return client.upload(form_data);
}

/** 将 accept 字符串解析为允许的 MIME 类型与扩展名集合。 */
function parse_accept(accept?: string): {
	mime_types: Set<string>;
	extensions: Set<string>;
} {
	const mime_types = new Set<string>();
	const extensions = new Set<string>();
	for (const part of (accept ?? "").split(",")) {
		const token = part.trim().toLowerCase();
		if (!token) continue;
		if (token.startsWith(".")) extensions.add(token);
		else mime_types.add(token);
	}
	return { mime_types, extensions };
}

/** 判断文件是否满足 accept 限制，未配置 accept 时视为全部允许。 */
function is_file_allowed(file: File, accept?: string): boolean {
	if (!accept) return true;
	const { mime_types, extensions } = parse_accept(accept);
	if (mime_types.has((file.type || "").toLowerCase())) return true;
	const extension = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
	return extensions.has(extension);
}

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
		? "支持 JPG、PNG、WebP 和 GIF 图片，单文件最大 128MB"
		: "支持图片、MP4/WebM 视频、PDF 和 Word 文档，单文件最大 128MB";

	/** 上传文件并将新媒体返回调用方。 */
	const upload: NonNullable<UploadProps["customRequest"]> = async (options) => {
		pending_uploads.current += 1;
		setUploading(true);
		try {
			const response = await upload_single_file(
				client,
				options.file as Blob,
			);
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
	const { message } = App.useApp();
	const [active_tab, setActiveTab] = useState("library");
	const [records, setRecords] = useState<MediaRecord[]>([]);
	const [selected_id_set, setSelectedIdSet] = useState<Set<number>>(new Set());
	const [library_drag_active, setLibraryDragActive] = useState(false);
	const [library_uploading, setLibraryUploading] = useState(false);
	const [reload_key, setReloadKey] = useState(0);
	const [keyword_input, setKeywordInput] = useState("");
	const [keyword, setKeyword] = useState("");
	const [kind, setKind] = useState<string>();
	const [page, setPage] = useState(1);
	const [page_size] = useState(default_page_size);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const loading_ref = useRef(false);
	const record_cache = useRef<Map<number, MediaRecord>>(new Map());
	const selected_ids_key = selected_ids.join(",");
	const locked_kind =
		allowed_kinds?.length === 1 ? allowed_kinds[0] : undefined;
	const active_kind = kind ?? locked_kind;
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
		if (loading_ref.current) return;

		loading_ref.current = true;
		setLoading(true);
		try {
			const response = await client.list({
				page,
				page_size,
				keyword: keyword || undefined,
				kind: active_kind,
			});
			response.data.forEach((record) => {
				record_cache.current.set(record.id, record);
			});
			setRecords((current) =>
				page === 1
					? response.data
					: [
							...current,
							...response.data.filter(
								(record) => !current.some((item) => item.id === record.id),
							),
						],
			);
			setTotal(response.meta.total);
		} finally {
			loading_ref.current = false;
			setLoading(false);
		}
	}, [active_kind, client, keyword, page, page_size]);

	useEffect(() => {
		if (open && active_tab === "library") void loadMedia();
	}, [active_tab, loadMedia, open, reload_key]);

	/** 重置当前筛选结果，以便从第一页重新读取媒体。 */
	const reset_media_list = () => {
		setRecords([]);
		setTotal(0);
		setPage(1);
	};

	/** 滚动至媒体网格底部时读取下一页，始终保持在固定高度的滚动区域内。 */
	const load_more_on_scroll = (event: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
		const has_more = records.length < total;
		const reached_bottom =
			scrollTop + clientHeight >= scrollHeight - load_more_threshold;
		if (!loading_ref.current && has_more && reached_bottom) {
			setPage((current) => current + 1);
		}
	};

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
		reset_media_list();
		setKeyword("");
		setKeywordInput("");
		setKind(locked_kind);
		setActiveTab("library");
	};

	/** 拖动文件进入媒体库列表时提供可放置反馈。 */
	const handleLibraryDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
		if (library_uploading) return;
		const drag_types = event.dataTransfer.types;
		if (drag_types && Array.prototype.includes.call(drag_types, "Files")) {
			setLibraryDragActive(true);
		}
	};

	/** 允许在媒体库列表上放置文件。 */
	const handleLibraryDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (library_uploading) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	};

	/** 离开媒体库列表或进入内部子元素时取消放置反馈。 */
	const handleLibraryDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		if (event.currentTarget.contains(event.relatedTarget as Node)) return;
		setLibraryDragActive(false);
	};

	/** 将直接拖入媒体库列表的新文件逐个上传、自动选中并刷新列表。 */
	const handleLibraryDrop = async (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setLibraryDragActive(false);
		if (library_uploading) return;

		const files = Array.from(event.dataTransfer.files);
		if (files.length === 0) return;

		const allowed_files = files.filter((file) =>
			is_file_allowed(file, upload_accept),
		);
		const skipped_count = files.length - allowed_files.length;
		if (skipped_count > 0) {
			message.warning(`已跳过 ${skipped_count} 个不支持的文件类型`);
		}
		if (allowed_files.length === 0) return;

		setLibraryUploading(true);
		try {
			for (const file of allowed_files) {
				try {
					const response = await upload_single_file(client, file);
					message.success(`${file.name} 上传成功`);
					handleUploaded(response.data);
				} catch {
					message.error(`${file.name} 上传失败`);
				}
			}
		} finally {
			setLibraryUploading(false);
			reset_media_list();
			setKeyword("");
			setKeywordInput("");
			setKind(locked_kind);
			setReloadKey((current) => current + 1);
		}
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
								reset_media_list();
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
									reset_media_list();
									setKind(value);
							}}
						/>
					</div>
					<p className={styles["media-picker__drop-hint"]}>
						也可将新文件直接拖入下方列表上传
					</p>
					<div
						className={styles["media-picker__drop-zone"]}
						onDragEnter={handleLibraryDragEnter}
						onDragOver={handleLibraryDragOver}
						onDragLeave={handleLibraryDragLeave}
						onDrop={handleLibraryDrop}
					>
						<div
							className={styles["media-picker__library"]}
							data-testid="media-picker-library"
							onScroll={load_more_on_scroll}
						>
							<Spin spinning={loading}>
								<MediaGrid
									records={records}
									selectable
									selected_ids={[...selected_id_set]}
									onToggle={toggleMedia}
								/>
							</Spin>
						</div>
						{library_drag_active && !library_uploading && (
							<div className={styles["media-picker__drop-overlay"]}>
								<UploadOutlined />
								<span>松开即可上传新媒体</span>
							</div>
						)}
						{library_uploading && (
							<div className={styles["media-picker__drop-overlay"]}>
								<Spin />
								<span>正在上传…</span>
							</div>
						)}
					</div>
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
	allowed_kinds,
	card_layout = false,
}: MediaPickerFieldProps) {
	const [picker_open, setPickerOpen] = useState(false);
	const [edit_open, setEditOpen] = useState(false);
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

	const media_name = value
		? getMediaName(selected_record, value)
		: "尚未选择媒体";

	return (
		<div className={styles["media-picker-field"]}>
			{card_layout ? (
				<div className={styles["media-picker-field__card"]}>
					<div className={styles["media-picker-field__card-preview"]}>
						{value ? (
							<MediaPreview record={selected_record} />
						) : (
							<span className={styles["media-picker-field__card-empty"]}>
								尚未选择媒体
							</span>
						)}
						{value && (
							<Button
								aria-label="编辑"
								className={styles["media-picker-field__card-edit"]}
								disabled={!can_manage}
								icon={<EditOutlined />}
								shape="circle"
								size="small"
								title="编辑"
								type="text"
								onClick={() => setEditOpen(true)}
							/>
						)}
						{value && preview_failed && (
							<span className={styles["media-picker-field__card-failed"]}>
								预览加载失败
							</span>
						)}
					</div>
					<div className={styles["media-picker-field__card-body"]}>
						<span
							className={styles["media-picker-field__card-name"]}
							title={value ? media_name : undefined}
						>
							{value ? media_name : ""}
						</span>
						<div className={styles["media-picker-field__card-actions"]}>
							<Button
								icon={<PictureOutlined />}
								disabled={!can_manage}
								title={
									!can_manage ? "当前账号没有媒体库权限" : undefined
								}
								onClick={() => setPickerOpen(true)}
							>
								{value ? "更换" : "选择"}
							</Button>
							{value && (
								<Button
									aria-label="清除"
									danger
									icon={<CloseOutlined />}
									title="清除"
									onClick={() => onChange?.(undefined)}
								/>
							)}
						</div>
					</div>
				</div>
			) : (
				<>
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
							title={
								!can_manage ? "当前账号没有媒体库权限" : undefined
							}
							onClick={() => setPickerOpen(true)}
						>
							{value ? "更换媒体" : "选择"}
						</Button>
						{value && (
							<Button
								icon={<EditOutlined />}
								disabled={!can_manage}
								onClick={() => setEditOpen(true)}
							>
								编辑
							</Button>
						)}
						{value && (
							<Button
								aria-label="清除"
								danger
								icon={<CloseOutlined />}
								title="清除"
								onClick={() => onChange?.(undefined)}
							/>
						)}
					</div>
				</>
			)}
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
			{value && (
				<MediaInfoEditModal
					client={client}
					open={edit_open}
					media_id={value}
					onCancel={() => setEditOpen(false)}
					onSaved={(record) => setSelectedRecord(record)}
				/>
			)}
		</div>
	);
}

/** 将相册顺序转换成后端现有的媒体附件保存结构，并去除相册内的重复附件。 */
function normalizeGalleryAttachments(
	attachments: MediaAttachmentRecord[],
): MediaAttachmentRecord[] {
	const seen_attachment_keys = new Set<string>();
	return attachments
		.filter((attachment) => attachment.collection === "gallery")
		.filter((attachment) => {
			const attachment_key = `${attachment.media_asset_id}:${attachment.collection}`;
			if (seen_attachment_keys.has(attachment_key)) return false;
			seen_attachment_keys.add(attachment_key);
			return true;
		})
		.map((attachment, index) => ({
			...attachment,
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
	const [editing_media_id, setEditingMediaId] = useState<number>();
	const [dragged_index, setDraggedIndex] = useState<number>();

	const ordered_attachments = useMemo(
		() =>
			normalizeGalleryAttachments(
				[...value].sort(
					(first, second) => first.sort_order - second.sort_order,
				),
			),
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

	/** 将保存后的媒体记录同步回对应附件项，保持缩略图与名称即时更新。 */
	const applySavedMedia = (record: MediaRecord) => {
		onChange?.(
			ordered_attachments.map((attachment) =>
				attachment.media_asset_id === record.id
					? { ...attachment, media_asset: record }
					: attachment,
			),
		);
		setEditingMediaId(undefined);
	};

	const selected_ids = useMemo(
		() => ordered_attachments.map((attachment) => attachment.media_asset_id),
		[ordered_attachments],
	);

	return (
		<div className={styles["media-attachment-field"]}>
			{ordered_attachments.length > 0 ? (
				<ul className={styles["media-attachment-field__grid"]}>
					{ordered_attachments.map((attachment, index) => {
						const media_name = getMediaName(
							attachment.media_asset,
							attachment.media_asset_id,
						);
						return (
							<li
								className={styles["media-attachment-field__item"]}
								key={`${attachment.media_asset_id}:${attachment.collection}`}
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
											icon={<EditOutlined />}
											aria-label={`编辑 ${media_name}`}
											onClick={() =>
												setEditingMediaId(attachment.media_asset_id)
											}
										/>
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
			{editing_media_id !== undefined && (
				<MediaInfoEditModal
					client={client}
					open
					media_id={editing_media_id}
					onCancel={() => setEditingMediaId(undefined)}
					onSaved={applySavedMedia}
				/>
			)}
		</div>
	);
}
