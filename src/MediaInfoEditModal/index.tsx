import { App, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import type { MediaLibraryClient, MediaRecord } from "../types";

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
export default function MediaInfoEditModal({
	client,
	open,
	media_id,
	onCancel,
	onSaved,
}: MediaInfoEditModalProps) {
	const { message } = App.useApp();
	const [form] = Form.useForm<MediaInfoEditValues>();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open || !media_id) return;
		let active = true;
		setLoading(true);
		form.resetFields();
		client
			.get(media_id)
			.then((response) => {
				if (!active) return;
				const record = response.data;
				form.setFieldsValue({
					title: record.title ?? undefined,
					alt_text: record.alt_text ?? undefined,
					description: record.description ?? undefined,
				});
			})
			.catch(() => {
				if (active) message.error("读取媒体信息失败");
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [client, form, media_id, message, open]);

	/** 校验并保存当前媒体的用户可读元数据。 */
	const save = async (): Promise<void> => {
		const values = await form.validateFields();
		setSaving(true);
		try {
			const response = await client.update(
				media_id,
				values as Record<string, unknown>,
			);
			message.success("媒体信息已保存");
			onSaved?.(response.data);
			onCancel();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal
			title="编辑媒体信息"
			open={open}
			confirmLoading={saving}
			okText="保存"
			cancelText="取消"
			destroyOnHidden
			onOk={() => void save()}
			onCancel={onCancel}
		>
			<Form form={form} layout="vertical" preserve={false}>
				<Form.Item name="title" label="标题" rules={[{ max: 255 }]}>
					<Input placeholder="用于后台识别媒体的名称" />
				</Form.Item>
				<Form.Item name={["alt_text", "zh-cn"]} label="中文替代文本">
					<Input placeholder="简要描述图片内容" maxLength={255} />
				</Form.Item>
				<Form.Item name={["alt_text", "ru"]} label="俄语替代文本">
					<Input placeholder="Краткое описание изображения" maxLength={255} />
				</Form.Item>
				<Form.Item name="description" label="说明">
					<Input.TextArea rows={4} maxLength={5000} showCount />
				</Form.Item>
			</Form>
		</Modal>
	);
}
