# Ant Design Media Library

Reusable React and Ant Design components for browsing existing media, uploading files, selecting one or many assets, and sorting image galleries.

## Installation

```bash
pnpm add @wenprise/media-library-antd
```

Import the package styles once in the host application:

```tsx
import '@wenprise/media-library-antd/style.css';
```

## Client adapter

The package does not depend on Axios, Umi, React Query, route helpers, or an application permission system. Connect it to the host API through `MediaLibraryClient`:

```tsx
import type { MediaLibraryClient } from '@wenprise/media-library-antd';

export const media_library_client: MediaLibraryClient = {
  list: (params) => listMedia(params),
  get: (media_id) => getMedia(media_id),
  upload: (form_data) => uploadMedia(form_data),
};
```

## Components

- `MediaGrid`: responsive media previews and management actions.
- `MediaPicker`: existing-media library and upload tabs with single or multiple selection.
- `MediaUploadDragger`: reusable multipart upload area.
- `MediaPickerField`: controlled single-media form field.
- `MediaAttachmentField`: controlled sortable image gallery; the first item is the cover.

```tsx
<MediaPicker
  client={media_library_client}
  open={picker_open}
  mode="multiple"
  selected_ids={selected_ids}
  allowed_kinds={['image']}
  onCancel={() => setPickerOpen(false)}
  onConfirm={(next_ids, records) => saveSelection(next_ids, records)}
/>
```

Authorization remains the host application's responsibility. Pass `can_manage={false}` to disable managed form fields.

## Peer dependencies

- React 18 or 19
- Ant Design 6
- Ant Design Icons 6

## License

MIT
