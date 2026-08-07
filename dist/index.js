import { CloseOutlined as e, DeleteOutlined as t, DownloadOutlined as n, EditOutlined as r, EyeOutlined as i, FileOutlined as a, PictureOutlined as o, UploadOutlined as s } from "@ant-design/icons";
import { App as c, Button as l, Empty as u, Form as d, Image as f, Input as p, Modal as m, Select as h, Spin as g, Tabs as _, Tooltip as v, Upload as y } from "antd";
import { Fragment as b, jsx as x, jsxs as S } from "react/jsx-runtime";
import { useCallback as ee, useEffect as C, useMemo as w, useRef as T, useState as E } from "react";
//#region src/MediaGrid/index.module.less
var D = {
	"media-grid": "_media-grid_1i83x_1",
	"media-grid__item": "_media-grid__item_1i83x_6",
	"media-grid__item--selected": "_media-grid__item--selected_1i83x_7",
	"media-grid__select-button": "_media-grid__select-button_1i83x_22",
	"media-grid__preview-image": "_media-grid__preview-image_1i83x_42",
	"media-grid__file-preview": "_media-grid__file-preview_1i83x_43",
	"media-grid__content": "_media-grid__content_1i83x_60",
	"media-grid__actions": "_media-grid__actions_1i83x_79"
}, O = {
	image: "图片",
	video: "视频",
	document: "文档"
};
function k(e, t) {
	return e?.title || e?.original_name || `媒体 #${t ?? "-"}`;
}
function A({ record: e }) {
	return e?.kind === "image" && e.url ? /* @__PURE__ */ x(f, {
		src: e.url,
		alt: k(e),
		preview: !1,
		className: D["media-grid__preview-image"]
	}) : /* @__PURE__ */ S("span", {
		className: D["media-grid__file-preview"],
		"aria-hidden": "true",
		children: [/* @__PURE__ */ x(a, {}), /* @__PURE__ */ x("small", { children: O[e?.kind ?? ""] ?? "文件" })]
	});
}
function te({ records: e, selectable: a = !1, selected_ids: o = [], empty_text: s = "没有找到符合条件的媒体", onToggle: c, onPreview: d, onEdit: f, onDownload: p, onDelete: m }) {
	let h = new Set(o);
	return e.length === 0 ? /* @__PURE__ */ x(u, { description: s }) : /* @__PURE__ */ x("div", {
		className: D["media-grid"],
		children: e.map((e) => {
			let o = h.has(e.id), s = k(e), u = e.width && e.height ? `${e.width} × ${e.height}` : O[e.kind ?? ""] ?? "文件";
			return /* @__PURE__ */ S("div", {
				className: D[o ? "media-grid__item--selected" : "media-grid__item"],
				children: [
					a ? /* @__PURE__ */ x("button", {
						type: "button",
						className: D["media-grid__select-button"],
						"aria-label": `${o ? "取消选择" : "选择"} ${s}`,
						"aria-pressed": o,
						onClick: () => c?.(e),
						children: /* @__PURE__ */ x(A, { record: e })
					}) : /* @__PURE__ */ x("button", {
						type: "button",
						className: D["media-grid__select-button"],
						"aria-label": `预览 ${s}`,
						onClick: () => d?.(e),
						children: /* @__PURE__ */ x(A, { record: e })
					}),
					/* @__PURE__ */ S("div", {
						className: D["media-grid__content"],
						children: [
							/* @__PURE__ */ x("strong", {
								title: s,
								children: s
							}),
							e.title && e.original_name && /* @__PURE__ */ x("small", {
								title: e.original_name,
								children: e.original_name
							}),
							/* @__PURE__ */ x("small", { children: u })
						]
					}),
					(d || f || p || m) && /* @__PURE__ */ S("div", {
						className: D["media-grid__actions"],
						children: [
							a && d && /* @__PURE__ */ x(v, {
								title: "预览",
								children: /* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ x(i, {}),
									"aria-label": `预览 ${s}`,
									onClick: () => d(e)
								})
							}),
							f && /* @__PURE__ */ x(v, {
								title: "编辑信息",
								children: /* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ x(r, {}),
									"aria-label": `编辑 ${s}`,
									onClick: () => f(e)
								})
							}),
							p && /* @__PURE__ */ x(v, {
								title: "下载",
								children: /* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ x(n, {}),
									"aria-label": `下载 ${s}`,
									onClick: () => p(e)
								})
							}),
							m && /* @__PURE__ */ x(v, {
								title: "删除",
								children: /* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									danger: !0,
									icon: /* @__PURE__ */ x(t, {}),
									"aria-label": `删除 ${s}`,
									onClick: () => m(e)
								})
							})
						]
					})
				]
			}, e.id);
		})
	});
}
//#endregion
//#region src/MediaInfoEditModal/index.tsx
function j({ client: e, open: t, media_id: n, onCancel: r, onSaved: i }) {
	let { message: a } = c.useApp(), [o] = d.useForm(), [s, l] = E(!1), [u, f] = E(!1);
	C(() => {
		if (!t || !n) return;
		let r = !0;
		return l(!0), o.resetFields(), e.get(n).then((e) => {
			if (!r) return;
			let t = e.data;
			o.setFieldsValue({
				title: t.title ?? void 0,
				alt_text: t.alt_text ?? void 0,
				description: t.description ?? void 0
			});
		}).catch(() => {
			r && a.error("读取媒体信息失败");
		}).finally(() => {
			r && l(!1);
		}), () => {
			r = !1;
		};
	}, [
		e,
		o,
		n,
		a,
		t
	]);
	let h = async () => {
		let t = await o.validateFields();
		f(!0);
		try {
			let o = await e.update(n, t);
			a.success("媒体信息已保存"), i?.(o.data), r();
		} finally {
			f(!1);
		}
	};
	return /* @__PURE__ */ x(m, {
		title: "编辑媒体信息",
		open: t,
		confirmLoading: u,
		okText: "保存",
		cancelText: "取消",
		destroyOnHidden: !0,
		onOk: () => void h(),
		onCancel: r,
		children: /* @__PURE__ */ S(d, {
			form: o,
			layout: "vertical",
			preserve: !1,
			children: [
				/* @__PURE__ */ x(d.Item, {
					name: "title",
					label: "标题",
					rules: [{ max: 255 }],
					children: /* @__PURE__ */ x(p, { placeholder: "用于后台识别媒体的名称" })
				}),
				/* @__PURE__ */ x(d.Item, {
					name: ["alt_text", "zh-cn"],
					label: "中文替代文本",
					children: /* @__PURE__ */ x(p, {
						placeholder: "简要描述图片内容",
						maxLength: 255
					})
				}),
				/* @__PURE__ */ x(d.Item, {
					name: ["alt_text", "ru"],
					label: "俄语替代文本",
					children: /* @__PURE__ */ x(p, {
						placeholder: "Краткое описание изображения",
						maxLength: 255
					})
				}),
				/* @__PURE__ */ x(d.Item, {
					name: "description",
					label: "说明",
					children: /* @__PURE__ */ x(p.TextArea, {
						rows: 4,
						maxLength: 5e3,
						showCount: !0
					})
				})
			]
		})
	});
}
//#endregion
//#region src/MediaPicker/index.module.less
var M = {
	"media-picker": "_media-picker_vtjdr_1",
	"media-picker__toolbar": "_media-picker__toolbar_vtjdr_6",
	"media-picker__drop-hint": "_media-picker__drop-hint_vtjdr_11",
	"media-picker__drop-zone": "_media-picker__drop-zone_vtjdr_16",
	"media-picker__drop-overlay": "_media-picker__drop-overlay_vtjdr_20",
	"media-picker__library": "_media-picker__library_vtjdr_36",
	"media-picker__upload-hint": "_media-picker__upload-hint_vtjdr_43",
	"media-picker-field__empty": "_media-picker-field__empty_vtjdr_44",
	"media-attachment-field__empty": "_media-attachment-field__empty_vtjdr_45",
	"media-picker__upload-icon": "_media-picker__upload-icon_vtjdr_48",
	"media-picker__selection-count": "_media-picker__selection-count_vtjdr_53",
	"media-picker-field": "_media-picker-field_vtjdr_44",
	"media-attachment-field": "_media-attachment-field_vtjdr_45",
	"media-picker-field__selection": "_media-picker-field__selection_vtjdr_62",
	"media-picker-field__thumbnail": "_media-picker-field__thumbnail_vtjdr_68",
	"media-picker-field__actions": "_media-picker-field__actions_vtjdr_74",
	"media-picker-field__card": "_media-picker-field__card_vtjdr_79",
	"media-picker-field__card-preview": "_media-picker-field__card-preview_vtjdr_92",
	"media-picker-field__card-edit": "_media-picker-field__card-edit_vtjdr_115",
	"media-picker-field__card-empty": "_media-picker-field__card-empty_vtjdr_130",
	"media-picker-field__card-failed": "_media-picker-field__card-failed_vtjdr_137",
	"media-picker-field__card-body": "_media-picker-field__card-body_vtjdr_147",
	"media-picker-field__card-name": "_media-picker-field__card-name_vtjdr_152",
	"media-picker-field__card-actions": "_media-picker-field__card-actions_vtjdr_160",
	"media-attachment-field__grid": "_media-attachment-field__grid_vtjdr_165",
	"media-attachment-field__item": "_media-attachment-field__item_vtjdr_173",
	"media-attachment-field__preview": "_media-attachment-field__preview_vtjdr_192",
	"media-attachment-field__cover": "_media-attachment-field__cover_vtjdr_198",
	"media-attachment-field__name": "_media-attachment-field__name_vtjdr_208",
	"media-attachment-field__item-actions": "_media-attachment-field__item-actions_vtjdr_215",
	"media-attachment-field__actions": "_media-attachment-field__actions_vtjdr_222",
	"media-attachment-field__hint": "_media-attachment-field__hint_vtjdr_228"
}, ne = 15, re = 32, ie = [
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
async function N(e, t) {
	let n = new FormData();
	return n.append("file", t), e.upload(n);
}
function P(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
	for (let r of (e ?? "").split(",")) {
		let e = r.trim().toLowerCase();
		e && (e.startsWith(".") ? n.add(e) : t.add(e));
	}
	return {
		mime_types: t,
		extensions: n
	};
}
function ae(e, t) {
	if (!t) return !0;
	let { mime_types: n, extensions: r } = P(t);
	if (n.has((e.type || "").toLowerCase())) return !0;
	let i = `.${(e.name.split(".").pop() ?? "").toLowerCase()}`;
	return r.has(i);
}
function F({ client: e, onUploaded: t, onBatchComplete: n, accept: r = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,application/pdf,.doc,.docx", multiple: i = !1 }) {
	let { message: a } = c.useApp(), [o, l] = E(!1), u = T(0), d = r.startsWith("image/") ? "支持 JPG、PNG、WebP 和 GIF 图片，单文件最大 128MB" : "支持图片、MP4/WebM 视频、PDF 和 Word 文档，单文件最大 128MB";
	return /* @__PURE__ */ S(y.Dragger, {
		accept: r,
		customRequest: async (r) => {
			u.current += 1, l(!0);
			try {
				let n = await N(e, r.file);
				r.onSuccess?.(n), a.success(`${r.file.name} 上传成功`), t(n.data);
			} catch (e) {
				r.onError?.(e);
			} finally {
				--u.current, u.current === 0 && (l(!1), n?.());
			}
		},
		disabled: o,
		multiple: i,
		maxCount: i ? void 0 : 1,
		showUploadList: !0,
		children: [
			/* @__PURE__ */ x("p", {
				className: M["media-picker__upload-icon"],
				children: /* @__PURE__ */ x(s, {})
			}),
			/* @__PURE__ */ x("p", { children: "点击或拖拽文件到这里上传" }),
			/* @__PURE__ */ S("p", {
				className: M["media-picker__upload-hint"],
				children: [d, i ? "，可一次选择多个文件" : ""]
			})
		]
	});
}
function I({ client: e, open: t, mode: n = "single", selected_ids: r, allowed_kinds: i, title: a = "选择媒体", onCancel: o, onConfirm: u }) {
	let { message: d } = c.useApp(), [f, v] = E("library"), [y, b] = E([]), [w, D] = E(/* @__PURE__ */ new Set()), [O, k] = E(!1), [A, j] = E(!1), [P, I] = E(0), [L, R] = E(""), [z, B] = E(""), [V, H] = E(), [U, W] = E(1), [G] = E(ne), [oe, K] = E(0), [se, q] = E(!1), J = T(!1), Y = T(/* @__PURE__ */ new Map()), X = r.join(","), Z = i?.length === 1 ? i[0] : void 0, Q = V ?? Z, ce = i?.length === 1 ? {
		image: "image/jpeg,image/png,image/webp,image/gif",
		video: "video/mp4,video/webm",
		document: "application/pdf,.doc,.docx"
	}[i[0]] : void 0;
	C(() => {
		if (!t) return;
		let e = X ? X.split(",").map(Number) : [];
		D(new Set(e)), v("library"), H(Z);
	}, [
		Z,
		t,
		X
	]);
	let le = ee(async () => {
		if (!J.current) {
			J.current = !0, q(!0);
			try {
				let t = await e.list({
					page: U,
					page_size: G,
					keyword: z || void 0,
					kind: Q
				});
				t.data.forEach((e) => {
					Y.current.set(e.id, e);
				}), b((e) => U === 1 ? t.data : [...e, ...t.data.filter((t) => !e.some((e) => e.id === t.id))]), K(t.meta.total);
			} finally {
				J.current = !1, q(!1);
			}
		}
	}, [
		Q,
		e,
		z,
		U,
		G
	]);
	C(() => {
		t && f === "library" && le();
	}, [
		f,
		le,
		t,
		P
	]);
	let $ = () => {
		b([]), K(0), W(1);
	}, ue = (e) => {
		let { scrollTop: t, clientHeight: n, scrollHeight: r } = e.currentTarget, i = y.length < oe, a = t + n >= r - re;
		!J.current && i && a && W((e) => e + 1);
	}, de = (e) => {
		Y.current.set(e.id, e), D((t) => {
			if (n === "single") return /* @__PURE__ */ new Set([e.id]);
			let r = new Set(t);
			return r.has(e.id) ? r.delete(e.id) : r.add(e.id), r;
		});
	}, fe = (e) => {
		Y.current.set(e.id, e), D((t) => n === "single" ? /* @__PURE__ */ new Set([e.id]) : /* @__PURE__ */ new Set([...t, e.id]));
	}, pe = () => {
		$(), B(""), R(""), H(Z), v("library");
	}, me = (e) => {
		if (A) return;
		let t = e.dataTransfer.types;
		t && Array.prototype.includes.call(t, "Files") && k(!0);
	}, he = (e) => {
		A || (e.preventDefault(), e.dataTransfer.dropEffect = "copy");
	}, ge = (e) => {
		e.currentTarget.contains(e.relatedTarget) || k(!1);
	}, _e = async (t) => {
		if (t.preventDefault(), k(!1), A) return;
		let n = Array.from(t.dataTransfer.files);
		if (n.length === 0) return;
		let r = n.filter((e) => ae(e, ce)), i = n.length - r.length;
		if (i > 0 && d.warning(`已跳过 ${i} 个不支持的文件类型`), r.length !== 0) {
			j(!0);
			try {
				for (let t of r) try {
					let n = await N(e, t);
					d.success(`${t.name} 上传成功`), fe(n.data);
				} catch {
					d.error(`${t.name} 上传失败`);
				}
			} finally {
				j(!1), $(), B(""), R(""), H(Z), I((e) => e + 1);
			}
		}
	}, ve = w.size, ye = [{
		key: "library",
		label: "媒体库",
		children: /* @__PURE__ */ S("div", {
			className: M["media-picker"],
			children: [
				/* @__PURE__ */ S("div", {
					className: M["media-picker__toolbar"],
					children: [/* @__PURE__ */ x(p.Search, {
						value: L,
						allowClear: !0,
						placeholder: "搜索文件名",
						"aria-label": "搜索媒体文件",
						onChange: (e) => R(e.target.value),
						onSearch: (e) => {
							$(), B(e.trim());
						}
					}), /* @__PURE__ */ x(h, {
						value: V,
						allowClear: !Z,
						placeholder: "全部类型",
						"aria-label": "媒体类型",
						disabled: !!Z,
						options: ie.filter((e) => !i || i.includes(e.value)),
						onChange: (e) => {
							$(), H(e);
						}
					})]
				}),
				/* @__PURE__ */ x("p", {
					className: M["media-picker__drop-hint"],
					children: "也可将新文件直接拖入下方列表上传"
				}),
				/* @__PURE__ */ S("div", {
					className: M["media-picker__drop-zone"],
					onDragEnter: me,
					onDragOver: he,
					onDragLeave: ge,
					onDrop: _e,
					children: [
						/* @__PURE__ */ x("div", {
							className: M["media-picker__library"],
							"data-testid": "media-picker-library",
							onScroll: ue,
							children: /* @__PURE__ */ x(g, {
								spinning: se,
								children: /* @__PURE__ */ x(te, {
									records: y,
									selectable: !0,
									selected_ids: [...w],
									onToggle: de
								})
							})
						}),
						O && !A && /* @__PURE__ */ S("div", {
							className: M["media-picker__drop-overlay"],
							children: [/* @__PURE__ */ x(s, {}), /* @__PURE__ */ x("span", { children: "松开即可上传新媒体" })]
						}),
						A && /* @__PURE__ */ S("div", {
							className: M["media-picker__drop-overlay"],
							children: [/* @__PURE__ */ x(g, {}), /* @__PURE__ */ x("span", { children: "正在上传…" })]
						})
					]
				})
			]
		})
	}, {
		key: "upload",
		label: "上传新媒体",
		children: /* @__PURE__ */ x(F, {
			client: e,
			accept: ce,
			multiple: n === "multiple",
			onUploaded: fe,
			onBatchComplete: pe
		})
	}];
	return /* @__PURE__ */ x(m, {
		title: a,
		open: t,
		width: 960,
		destroyOnHidden: !0,
		mask: { closable: !1 },
		onCancel: o,
		footer: [
			/* @__PURE__ */ S("span", {
				className: M["media-picker__selection-count"],
				children: [
					"已选 ",
					ve,
					" 项"
				]
			}, "count"),
			/* @__PURE__ */ x(l, {
				onClick: o,
				children: "取消"
			}, "cancel"),
			/* @__PURE__ */ x(l, {
				type: "primary",
				onClick: () => {
					let e = [...w];
					u(e, e.map((e) => Y.current.get(e)).filter((e) => !!e));
				},
				children: "使用所选媒体"
			}, "confirm")
		],
		children: /* @__PURE__ */ x(_, {
			activeKey: f,
			items: ye,
			onChange: v
		})
	});
}
function L({ client: t, can_manage: n = !0, value: i, onChange: a, allowed_kinds: s, card_layout: c = !1 }) {
	let [u, d] = E(!1), [f, p] = E(!1), [m, h] = E(), [g, _] = E(!1);
	C(() => {
		if (!i || !n) {
			h(void 0), _(!1);
			return;
		}
		let e = !0;
		return _(!1), t.get(i).then((t) => {
			e && h(t.data);
		}).catch(() => {
			e && _(!0);
		}), () => {
			e = !1;
		};
	}, [
		n,
		t,
		i
	]);
	let v = i ? k(m, i) : "尚未选择媒体";
	return /* @__PURE__ */ S("div", {
		className: M["media-picker-field"],
		children: [
			c ? /* @__PURE__ */ S("div", {
				className: M["media-picker-field__card"],
				children: [/* @__PURE__ */ S("div", {
					className: M["media-picker-field__card-preview"],
					children: [
						i ? /* @__PURE__ */ x(A, { record: m }) : /* @__PURE__ */ x("span", {
							className: M["media-picker-field__card-empty"],
							children: "尚未选择媒体"
						}),
						i && /* @__PURE__ */ x(l, {
							"aria-label": "编辑",
							className: M["media-picker-field__card-edit"],
							disabled: !n,
							icon: /* @__PURE__ */ x(r, {}),
							shape: "circle",
							size: "small",
							title: "编辑",
							type: "text",
							onClick: () => p(!0)
						}),
						i && g && /* @__PURE__ */ x("span", {
							className: M["media-picker-field__card-failed"],
							children: "预览加载失败"
						})
					]
				}), /* @__PURE__ */ S("div", {
					className: M["media-picker-field__card-body"],
					children: [/* @__PURE__ */ x("span", {
						className: M["media-picker-field__card-name"],
						title: i ? v : void 0,
						children: i ? v : ""
					}), /* @__PURE__ */ S("div", {
						className: M["media-picker-field__card-actions"],
						children: [/* @__PURE__ */ x(l, {
							icon: /* @__PURE__ */ x(o, {}),
							disabled: !n,
							title: n ? void 0 : "当前账号没有媒体库权限",
							onClick: () => d(!0),
							children: i ? "更换" : "选择"
						}), i && /* @__PURE__ */ x(l, {
							"aria-label": "清除",
							danger: !0,
							icon: /* @__PURE__ */ x(e, {}),
							title: "清除",
							onClick: () => a?.(void 0)
						})]
					})]
				})]
			}) : /* @__PURE__ */ S(b, { children: [i ? /* @__PURE__ */ S("div", {
				className: M["media-picker-field__selection"],
				children: [/* @__PURE__ */ x("div", {
					className: M["media-picker-field__thumbnail"],
					children: /* @__PURE__ */ x(A, { record: m })
				}), /* @__PURE__ */ S("span", { children: [k(m, i), g ? " （预览加载失败）" : ""] })]
			}) : /* @__PURE__ */ x("span", {
				className: M["media-picker-field__empty"],
				children: "尚未选择媒体"
			}), /* @__PURE__ */ S("div", {
				className: M["media-picker-field__actions"],
				children: [
					/* @__PURE__ */ x(l, {
						icon: /* @__PURE__ */ x(o, {}),
						disabled: !n,
						title: n ? void 0 : "当前账号没有媒体库权限",
						onClick: () => d(!0),
						children: i ? "更换媒体" : "选择"
					}),
					i && /* @__PURE__ */ x(l, {
						icon: /* @__PURE__ */ x(r, {}),
						disabled: !n,
						onClick: () => p(!0),
						children: "编辑"
					}),
					i && /* @__PURE__ */ x(l, {
						"aria-label": "清除",
						danger: !0,
						icon: /* @__PURE__ */ x(e, {}),
						title: "清除",
						onClick: () => a?.(void 0)
					})
				]
			})] }),
			/* @__PURE__ */ x(I, {
				client: t,
				open: u,
				mode: "single",
				selected_ids: i ? [i] : [],
				allowed_kinds: s,
				onCancel: () => d(!1),
				onConfirm: (e, t) => {
					let n = e[0];
					h(t.find((e) => e.id === n)), a?.(n), d(!1);
				}
			}),
			i && /* @__PURE__ */ x(j, {
				client: t,
				open: f,
				media_id: i,
				onCancel: () => p(!1),
				onSaved: (e) => h(e)
			})
		]
	});
}
function R(e) {
	let t = /* @__PURE__ */ new Set();
	return e.filter((e) => e.collection === "gallery").filter((e) => {
		let n = `${e.media_asset_id}:${e.collection}`;
		return !t.has(n) && (t.add(n), !0);
	}).map((e, t) => ({
		...e,
		is_primary: t === 0,
		sort_order: t
	}));
}
function z({ client: e, can_manage: n = !0, value: i = [], onChange: a }) {
	let [s, c] = E(!1), [u, d] = E(), [f, p] = E(), m = w(() => R([...i].sort((e, t) => e.sort_order - t.sort_order)), [i]), h = (e, t) => {
		if (e === t) return;
		let n = [...m], [r] = n.splice(e, 1);
		n.splice(t, 0, r), a?.(R(n));
	}, g = (e) => {
		a?.(R(m.filter((t, n) => n !== e)));
	}, _ = (e) => {
		a?.(m.map((t) => t.media_asset_id === e.id ? {
			...t,
			media_asset: e
		} : t)), d(void 0);
	}, v = w(() => m.map((e) => e.media_asset_id), [m]);
	return /* @__PURE__ */ S("div", {
		className: M["media-attachment-field"],
		children: [
			m.length > 0 ? /* @__PURE__ */ x("ul", {
				className: M["media-attachment-field__grid"],
				children: m.map((e, n) => {
					let i = k(e.media_asset, e.media_asset_id);
					return /* @__PURE__ */ S("li", {
						className: M["media-attachment-field__item"],
						"aria-label": i,
						draggable: !0,
						onDragStart: () => p(n),
						onDragOver: (e) => e.preventDefault(),
						onDrop: () => {
							f !== void 0 && h(f, n), p(void 0);
						},
						onDragEnd: () => p(void 0),
						children: [
							/* @__PURE__ */ S("div", {
								className: M["media-attachment-field__preview"],
								children: [/* @__PURE__ */ x(A, { record: e.media_asset }), n === 0 && /* @__PURE__ */ x("span", {
									className: M["media-attachment-field__cover"],
									children: "封面"
								})]
							}),
							/* @__PURE__ */ x("span", {
								className: M["media-attachment-field__name"],
								title: i,
								children: i
							}),
							/* @__PURE__ */ S("div", {
								className: M["media-attachment-field__item-actions"],
								children: [/* @__PURE__ */ x("small", { children: "拖动调整顺序" }), /* @__PURE__ */ S("div", { children: [/* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ x(r, {}),
									"aria-label": `编辑 ${i}`,
									onClick: () => d(e.media_asset_id)
								}), /* @__PURE__ */ x(l, {
									type: "text",
									size: "small",
									danger: !0,
									icon: /* @__PURE__ */ x(t, {}),
									"aria-label": `移除 ${i}`,
									onClick: () => g(n)
								})] })]
							})
						]
					}, `${e.media_asset_id}:${e.collection}`);
				})
			}) : /* @__PURE__ */ x("span", {
				className: M["media-attachment-field__empty"],
				children: "尚未添加相册图片"
			}),
			/* @__PURE__ */ S("div", {
				className: M["media-attachment-field__actions"],
				children: [
					/* @__PURE__ */ x(l, {
						type: "primary",
						icon: /* @__PURE__ */ x(o, {}),
						disabled: !n,
						title: n ? void 0 : "当前账号没有媒体库权限",
						onClick: () => c(!0),
						children: m.length > 0 ? "选择更多图片" : "选择图片"
					}),
					m.length > 0 && /* @__PURE__ */ x(l, {
						danger: !0,
						onClick: () => a?.([]),
						children: "清空所有"
					}),
					/* @__PURE__ */ x("span", {
						className: M["media-attachment-field__hint"],
						children: "可选择多张图片并拖动排序，第一张图片将作为封面。"
					})
				]
			}),
			/* @__PURE__ */ x(I, {
				client: e,
				open: s,
				mode: "multiple",
				selected_ids: v,
				allowed_kinds: ["image"],
				title: "选择相册图片",
				onCancel: () => c(!1),
				onConfirm: (e, t) => {
					let n = new Map(m.map((e) => [e.media_asset_id, e])), r = new Map(t.map((e) => [e.id, e]));
					a?.(R(e.map((e, t) => n.get(e) ?? {
						media_asset_id: e,
						collection: "gallery",
						is_primary: t === 0,
						sort_order: t,
						media_asset: r.get(e)
					}))), c(!1);
				}
			}),
			u !== void 0 && /* @__PURE__ */ x(j, {
				client: e,
				open: !0,
				media_id: u,
				onCancel: () => d(void 0),
				onSaved: _
			})
		]
	});
}
//#endregion
export { z as MediaAttachmentField, te as MediaGrid, j as MediaInfoEditModal, I as MediaPicker, L as MediaPickerField, A as MediaPreview, F as MediaUploadDragger, k as getMediaName };
