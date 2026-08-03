import { DeleteOutlined as e, DownloadOutlined as t, EditOutlined as n, EyeOutlined as r, FileOutlined as i, PictureOutlined as a, UploadOutlined as o } from "@ant-design/icons";
import { App as s, Button as c, Empty as l, Image as u, Input as d, Modal as f, Pagination as p, Select as m, Spin as h, Tabs as g, Tooltip as _, Upload as v } from "antd";
import { jsx as y, jsxs as b } from "react/jsx-runtime";
import { useCallback as x, useEffect as S, useMemo as C, useRef as w, useState as T } from "react";
//#region src/MediaGrid/index.module.less
var E = {
	"media-grid": "_media-grid_gsa9o_1",
	"media-grid__item": "_media-grid__item_gsa9o_6",
	"media-grid__item--selected": "_media-grid__item--selected_gsa9o_7",
	"media-grid__select-button": "_media-grid__select-button_gsa9o_22",
	"media-grid__preview-image": "_media-grid__preview-image_gsa9o_34",
	"media-grid__file-preview": "_media-grid__file-preview_gsa9o_35",
	"media-grid__content": "_media-grid__content_gsa9o_51",
	"media-grid__actions": "_media-grid__actions_gsa9o_70"
}, D = {
	image: "图片",
	video: "视频",
	document: "文档"
};
function O(e, t) {
	return e?.title || e?.original_name || `媒体 #${t ?? "-"}`;
}
function k({ record: e }) {
	return e?.kind === "image" && e.url ? /* @__PURE__ */ y(u, {
		src: e.url,
		alt: O(e),
		preview: !1,
		className: E["media-grid__preview-image"]
	}) : /* @__PURE__ */ b("span", {
		className: E["media-grid__file-preview"],
		"aria-hidden": "true",
		children: [/* @__PURE__ */ y(i, {}), /* @__PURE__ */ y("small", { children: D[e?.kind ?? ""] ?? "文件" })]
	});
}
function A({ records: i, selectable: a = !1, selected_ids: o = [], empty_text: s = "没有找到符合条件的媒体", onToggle: u, onPreview: d, onEdit: f, onDownload: p, onDelete: m }) {
	let h = new Set(o);
	return i.length === 0 ? /* @__PURE__ */ y(l, { description: s }) : /* @__PURE__ */ y("div", {
		className: E["media-grid"],
		children: i.map((i) => {
			let o = h.has(i.id), s = O(i), l = i.width && i.height ? `${i.width} × ${i.height}` : D[i.kind ?? ""] ?? "文件";
			return /* @__PURE__ */ b("div", {
				className: E[o ? "media-grid__item--selected" : "media-grid__item"],
				children: [
					a ? /* @__PURE__ */ y("button", {
						type: "button",
						className: E["media-grid__select-button"],
						"aria-label": `${o ? "取消选择" : "选择"} ${s}`,
						"aria-pressed": o,
						onClick: () => u?.(i),
						children: /* @__PURE__ */ y(k, { record: i })
					}) : /* @__PURE__ */ y("button", {
						type: "button",
						className: E["media-grid__select-button"],
						"aria-label": `预览 ${s}`,
						onClick: () => d?.(i),
						children: /* @__PURE__ */ y(k, { record: i })
					}),
					/* @__PURE__ */ b("div", {
						className: E["media-grid__content"],
						children: [
							/* @__PURE__ */ y("strong", {
								title: s,
								children: s
							}),
							i.title && i.original_name && /* @__PURE__ */ y("small", {
								title: i.original_name,
								children: i.original_name
							}),
							/* @__PURE__ */ y("small", { children: l })
						]
					}),
					(d || f || p || m) && /* @__PURE__ */ b("div", {
						className: E["media-grid__actions"],
						children: [
							a && d && /* @__PURE__ */ y(_, {
								title: "预览",
								children: /* @__PURE__ */ y(c, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ y(r, {}),
									"aria-label": `预览 ${s}`,
									onClick: () => d(i)
								})
							}),
							f && /* @__PURE__ */ y(_, {
								title: "编辑信息",
								children: /* @__PURE__ */ y(c, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ y(n, {}),
									"aria-label": `编辑 ${s}`,
									onClick: () => f(i)
								})
							}),
							p && /* @__PURE__ */ y(_, {
								title: "下载",
								children: /* @__PURE__ */ y(c, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ y(t, {}),
									"aria-label": `下载 ${s}`,
									onClick: () => p(i)
								})
							}),
							m && /* @__PURE__ */ y(_, {
								title: "删除",
								children: /* @__PURE__ */ y(c, {
									type: "text",
									size: "small",
									danger: !0,
									icon: /* @__PURE__ */ y(e, {}),
									"aria-label": `删除 ${s}`,
									onClick: () => m(i)
								})
							})
						]
					})
				]
			}, i.id);
		})
	});
}
//#endregion
//#region src/MediaPicker/index.module.less
var j = {
	"media-picker": "_media-picker_1yuwp_1",
	"media-picker__toolbar": "_media-picker__toolbar_1yuwp_6",
	"media-picker__upload-hint": "_media-picker__upload-hint_1yuwp_11",
	"media-picker-field__empty": "_media-picker-field__empty_1yuwp_12",
	"media-attachment-field__empty": "_media-attachment-field__empty_1yuwp_13",
	"media-picker__upload-icon": "_media-picker__upload-icon_1yuwp_16",
	"media-picker__selection-count": "_media-picker__selection-count_1yuwp_21",
	"media-picker-field": "_media-picker-field_1yuwp_12",
	"media-attachment-field": "_media-attachment-field_1yuwp_13",
	"media-picker-field__selection": "_media-picker-field__selection_1yuwp_30",
	"media-picker-field__thumbnail": "_media-picker-field__thumbnail_1yuwp_36",
	"media-picker-field__actions": "_media-picker-field__actions_1yuwp_42",
	"media-attachment-field__grid": "_media-attachment-field__grid_1yuwp_47",
	"media-attachment-field__item": "_media-attachment-field__item_1yuwp_55",
	"media-attachment-field__preview": "_media-attachment-field__preview_1yuwp_74",
	"media-attachment-field__cover": "_media-attachment-field__cover_1yuwp_80",
	"media-attachment-field__name": "_media-attachment-field__name_1yuwp_90",
	"media-attachment-field__item-actions": "_media-attachment-field__item-actions_1yuwp_97",
	"media-attachment-field__actions": "_media-attachment-field__actions_1yuwp_104",
	"media-attachment-field__hint": "_media-attachment-field__hint_1yuwp_110"
}, M = [
	{
		value: "image",
		label: "图片"
	},
	{
		value: "video",
		label: "视频"
	},
	{
		value: "document",
		label: "文档"
	}
];
function N({ client: e, onUploaded: t, onBatchComplete: n, accept: r = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf,.doc,.docx", multiple: i = !1 }) {
	let { message: a } = s.useApp(), [c, l] = T(!1), u = w(0), d = r.startsWith("image/") ? "支持 JPG、PNG、WebP 和 GIF 图片，单文件最大 20MB" : "支持图片、MP4/WebM 视频、PDF 和 Word 文档，单文件最大 20MB";
	return /* @__PURE__ */ b(v.Dragger, {
		accept: r,
		customRequest: async (r) => {
			u.current += 1, l(!0);
			let i = new FormData();
			i.append("file", r.file);
			try {
				let n = await e.upload(i);
				r.onSuccess?.(n), a.success(`${r.file.name} 上传成功`), t(n.data);
			} catch (e) {
				r.onError?.(e);
			} finally {
				--u.current, u.current === 0 && (l(!1), n?.());
			}
		},
		disabled: c,
		multiple: i,
		maxCount: i ? void 0 : 1,
		showUploadList: !0,
		children: [
			/* @__PURE__ */ y("p", {
				className: j["media-picker__upload-icon"],
				children: /* @__PURE__ */ y(o, {})
			}),
			/* @__PURE__ */ y("p", { children: "点击或拖拽文件到这里上传" }),
			/* @__PURE__ */ b("p", {
				className: j["media-picker__upload-hint"],
				children: [d, i ? "，可一次选择多个文件" : ""]
			})
		]
	});
}
function P({ client: e, open: t, mode: n = "single", selected_ids: r, allowed_kinds: i, title: a = "选择媒体", onCancel: o, onConfirm: s }) {
	let [l, u] = T("library"), [_, v] = T([]), [C, E] = T(/* @__PURE__ */ new Set()), [D, O] = T(""), [k, P] = T(""), [F, I] = T(), [L, R] = T(1), [z, B] = T(24), [V, H] = T(0), [U, W] = T(!1), G = w(/* @__PURE__ */ new Map()), K = r.join(","), q = i?.length === 1 ? i[0] : void 0, J = i?.length === 1 ? {
		image: "image/jpeg,image/png,image/webp,image/gif",
		video: "video/mp4,video/webm",
		document: "application/pdf,.doc,.docx"
	}[i[0]] : void 0;
	S(() => {
		if (!t) return;
		let e = K ? K.split(",").map(Number) : [];
		E(new Set(e)), u("library"), I(q);
	}, [
		q,
		t,
		K
	]);
	let Y = x(async () => {
		W(!0);
		try {
			let t = await e.list({
				page: L,
				page_size: z,
				keyword: k || void 0,
				kind: F
			});
			t.data.forEach((e) => {
				G.current.set(e.id, e);
			}), v(t.data), H(t.meta.total), B(t.meta.per_page);
		} finally {
			W(!1);
		}
	}, [
		e,
		F,
		k,
		L,
		z
	]);
	S(() => {
		t && l === "library" && Y();
	}, [
		l,
		Y,
		t
	]);
	let X = (e) => {
		G.current.set(e.id, e), E((t) => {
			if (n === "single") return /* @__PURE__ */ new Set([e.id]);
			let r = new Set(t);
			return r.has(e.id) ? r.delete(e.id) : r.add(e.id), r;
		});
	}, Z = (e) => {
		G.current.set(e.id, e), E((t) => n === "single" ? /* @__PURE__ */ new Set([e.id]) : /* @__PURE__ */ new Set([...t, e.id]));
	}, Q = () => {
		R(1), P(""), O(""), I(q), u("library");
	}, $ = C.size, ee = [{
		key: "library",
		label: "媒体库",
		children: /* @__PURE__ */ b("div", {
			className: j["media-picker"],
			children: [
				/* @__PURE__ */ b("div", {
					className: j["media-picker__toolbar"],
					children: [/* @__PURE__ */ y(d.Search, {
						value: D,
						allowClear: !0,
						placeholder: "搜索文件名",
						"aria-label": "搜索媒体文件",
						onChange: (e) => O(e.target.value),
						onSearch: (e) => {
							R(1), P(e.trim());
						}
					}), /* @__PURE__ */ y(m, {
						value: F,
						allowClear: !q,
						placeholder: "全部类型",
						"aria-label": "媒体类型",
						disabled: !!q,
						options: M.filter((e) => !i || i.includes(e.value)),
						onChange: (e) => {
							R(1), I(e);
						}
					})]
				}),
				/* @__PURE__ */ y(h, {
					spinning: U,
					children: /* @__PURE__ */ y(A, {
						records: _,
						selectable: !0,
						selected_ids: [...C],
						onToggle: X
					})
				}),
				V > z && /* @__PURE__ */ y(p, {
					current: L,
					pageSize: z,
					total: V,
					showSizeChanger: !1,
					onChange: R
				})
			]
		})
	}, {
		key: "upload",
		label: "上传新媒体",
		children: /* @__PURE__ */ y(N, {
			client: e,
			accept: J,
			multiple: n === "multiple",
			onUploaded: Z,
			onBatchComplete: Q
		})
	}];
	return /* @__PURE__ */ y(f, {
		title: a,
		open: t,
		width: 960,
		destroyOnHidden: !0,
		mask: { closable: !1 },
		onCancel: o,
		footer: [
			/* @__PURE__ */ b("span", {
				className: j["media-picker__selection-count"],
				children: [
					"已选 ",
					$,
					" 项"
				]
			}, "count"),
			/* @__PURE__ */ y(c, {
				onClick: o,
				children: "取消"
			}, "cancel"),
			/* @__PURE__ */ y(c, {
				type: "primary",
				onClick: () => {
					let e = [...C];
					s(e, e.map((e) => G.current.get(e)).filter((e) => !!e));
				},
				children: "使用所选媒体"
			}, "confirm")
		],
		children: /* @__PURE__ */ y(g, {
			activeKey: l,
			items: ee,
			onChange: u
		})
	});
}
function F({ client: e, can_manage: t = !0, value: n, onChange: r, button_label: i = "选择媒体", allowed_kinds: o }) {
	let [s, l] = T(!1), [u, d] = T(), [f, p] = T(!1);
	return S(() => {
		if (!n || !t) {
			d(void 0), p(!1);
			return;
		}
		let r = !0;
		return p(!1), e.get(n).then((e) => {
			r && d(e.data);
		}).catch(() => {
			r && p(!0);
		}), () => {
			r = !1;
		};
	}, [
		t,
		e,
		n
	]), /* @__PURE__ */ b("div", {
		className: j["media-picker-field"],
		children: [
			n ? /* @__PURE__ */ b("div", {
				className: j["media-picker-field__selection"],
				children: [/* @__PURE__ */ y("div", {
					className: j["media-picker-field__thumbnail"],
					children: /* @__PURE__ */ y(k, { record: u })
				}), /* @__PURE__ */ b("span", { children: [O(u, n), f ? " （预览加载失败）" : ""] })]
			}) : /* @__PURE__ */ y("span", {
				className: j["media-picker-field__empty"],
				children: "尚未选择媒体"
			}),
			/* @__PURE__ */ b("div", {
				className: j["media-picker-field__actions"],
				children: [/* @__PURE__ */ y(c, {
					icon: /* @__PURE__ */ y(a, {}),
					disabled: !t,
					title: t ? void 0 : "当前账号没有媒体库权限",
					onClick: () => l(!0),
					children: n ? "更换媒体" : i
				}), n && /* @__PURE__ */ y(c, {
					danger: !0,
					onClick: () => r?.(void 0),
					children: "清除"
				})]
			}),
			/* @__PURE__ */ y(P, {
				client: e,
				open: s,
				mode: "single",
				selected_ids: n ? [n] : [],
				allowed_kinds: o,
				onCancel: () => l(!1),
				onConfirm: (e, t) => {
					let n = e[0];
					d(t.find((e) => e.id === n)), r?.(n), l(!1);
				}
			})
		]
	});
}
function I(e) {
	return e.map((e, t) => ({
		...e,
		collection: "gallery",
		is_primary: t === 0,
		sort_order: t
	}));
}
function L({ client: t, can_manage: n = !0, value: r = [], onChange: i }) {
	let [o, s] = T(!1), [l, u] = T(), d = C(() => [...r].sort((e, t) => e.sort_order - t.sort_order), [r]), f = (e, t) => {
		if (e === t) return;
		let n = [...d], [r] = n.splice(e, 1);
		n.splice(t, 0, r), i?.(I(n));
	}, p = (e) => {
		i?.(I(d.filter((t, n) => n !== e)));
	}, m = C(() => d.map((e) => e.media_asset_id), [d]);
	return /* @__PURE__ */ b("div", {
		className: j["media-attachment-field"],
		children: [
			r.length > 0 ? /* @__PURE__ */ y("ul", {
				className: j["media-attachment-field__grid"],
				children: d.map((t, n) => {
					let r = O(t.media_asset, t.media_asset_id);
					return /* @__PURE__ */ b("li", {
						className: j["media-attachment-field__item"],
						"aria-label": r,
						draggable: !0,
						onDragStart: () => u(n),
						onDragOver: (e) => e.preventDefault(),
						onDrop: () => {
							l !== void 0 && f(l, n), u(void 0);
						},
						onDragEnd: () => u(void 0),
						children: [
							/* @__PURE__ */ b("div", {
								className: j["media-attachment-field__preview"],
								children: [/* @__PURE__ */ y(k, { record: t.media_asset }), n === 0 && /* @__PURE__ */ y("span", {
									className: j["media-attachment-field__cover"],
									children: "封面"
								})]
							}),
							/* @__PURE__ */ y("span", {
								className: j["media-attachment-field__name"],
								title: r,
								children: r
							}),
							/* @__PURE__ */ b("div", {
								className: j["media-attachment-field__item-actions"],
								children: [/* @__PURE__ */ y("small", { children: "拖动调整顺序" }), /* @__PURE__ */ y("div", { children: /* @__PURE__ */ y(c, {
									type: "text",
									size: "small",
									danger: !0,
									icon: /* @__PURE__ */ y(e, {}),
									"aria-label": `移除 ${r}`,
									onClick: () => p(n)
								}) })]
							})
						]
					}, t.id ?? t.media_asset_id);
				})
			}) : /* @__PURE__ */ y("span", {
				className: j["media-attachment-field__empty"],
				children: "尚未添加相册图片"
			}),
			/* @__PURE__ */ b("div", {
				className: j["media-attachment-field__actions"],
				children: [
					/* @__PURE__ */ y(c, {
						type: "primary",
						icon: /* @__PURE__ */ y(a, {}),
						disabled: !n,
						title: n ? void 0 : "当前账号没有媒体库权限",
						onClick: () => s(!0),
						children: d.length > 0 ? "选择更多图片" : "选择图片"
					}),
					d.length > 0 && /* @__PURE__ */ y(c, {
						danger: !0,
						onClick: () => i?.([]),
						children: "清空所有"
					}),
					/* @__PURE__ */ y("span", {
						className: j["media-attachment-field__hint"],
						children: "可选择多张图片并拖动排序，第一张图片将作为封面。"
					})
				]
			}),
			/* @__PURE__ */ y(P, {
				client: t,
				open: o,
				mode: "multiple",
				selected_ids: m,
				allowed_kinds: ["image"],
				title: "选择相册图片",
				onCancel: () => s(!1),
				onConfirm: (e, t) => {
					let n = new Map(d.map((e) => [e.media_asset_id, e])), r = new Map(t.map((e) => [e.id, e]));
					i?.(I(e.map((e, t) => n.get(e) ?? {
						media_asset_id: e,
						collection: "gallery",
						is_primary: t === 0,
						sort_order: t,
						media_asset: r.get(e)
					}))), s(!1);
				}
			})
		]
	});
}
//#endregion
export { L as MediaAttachmentField, A as MediaGrid, P as MediaPicker, F as MediaPickerField, k as MediaPreview, N as MediaUploadDragger, O as getMediaName };
