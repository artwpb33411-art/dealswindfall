// app/admin/social-preview/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function SocialPreviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/social/preview")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading preview…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Social Post Preview</h1>

      <h2>Flyers</h2>
      <img src={`data:image/jpeg;base64,${data.flyers.portrait}`} width={300} />
      <img src={`data:image/jpeg;base64,${data.flyers.square}`} width={300} />
      <img src={`data:image/jpeg;base64,${data.flyers.story}`} width={200} />

      <h2>Facebook</h2>
      <pre>{data.captions.facebook}</pre>

      <h2>Instagram</h2>
      <pre>{data.captions.instagram}</pre>

      <h2>Telegram</h2>
      <pre>{data.captions.telegram}</pre>

      <h2>X</h2>
      <pre>{data.captions.x}</pre>
    </div>
  );
}
