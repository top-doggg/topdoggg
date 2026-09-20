// src/content/videos.js
// Verified video facts only. Fields required for VideoObject stay null until independently confirmed.
// Do not infer publication dates from file timestamps, Git history, or deployment dates.

export const videos = [
  {
    id: "4-the-town",
    workingTitle: "4 The Town",
    contentUrl: "/api/film",
    mediaType: "video/mp4",
    byteRangeSupported: true,
    sourceObject: "media/4thetown-web-complete.mp4",
    watchPath: null,
    name: null,
    description: null,
    thumbnailUrl: null,
    uploadDate: null,
    duration: null,
  },
];

export function videoById(id) {
  return videos.find((video) => video.id === id);
}

export function videoObjectReadiness(video) {
  if (!video) return { ready: false, missing: ["video"] };
  const required = ["name", "thumbnailUrl", "uploadDate", "watchPath"];
  const missing = required.filter((field) => !video[field]);
  return { ready: missing.length === 0, missing };
}
