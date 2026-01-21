import fetch, { Response } from "node-fetch";
import FormData from "form-data";

export async function publishFacebookPost({
  pageId,
  pageAccessToken,
  message,
  imageBuffer,
}: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageBuffer?: Buffer;
}): Promise<{ postId: string }> {
  let res: Response;
  let json: any;

  if (imageBuffer) {
    const formData = new FormData();

    formData.append("access_token", pageAccessToken);
    formData.append("caption", message); // ✅ Facebook expects caption for photos
    formData.append("source", imageBuffer, {
      filename: "flyer.jpg",
      contentType: "image/jpeg",
    });

    res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/photos`,
      {
        method: "POST",
        body: formData,
      }
    );
  } else {
    // TEXT-ONLY FALLBACK
    res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/feed`,
      {
        method: "POST",
        body: new URLSearchParams({
          access_token: pageAccessToken,
          message,
        }),
      }
    );
  }

  json = await res.json();

  if (!json.id) {
    console.error("❌ Facebook post failed:", json);
    throw new Error("Facebook post creation failed");
  }

  return { postId: json.id };
}

export async function publishFacebookComment(
  postId: string,
  comment: string,
  pageAccessToken: string
) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${postId}/comments`,
    {
      method: "POST",
      body: new URLSearchParams({
        access_token: pageAccessToken,
        message: comment,
      }),
    }
  );

  const json = await res.json();

  if (!json.id) {
    console.error("❌ Facebook comment failed:", json);
    throw new Error("Facebook comment failed");
  }

  return json;
}
