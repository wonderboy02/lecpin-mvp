/**
 * YouTube 재생목록/비디오 타입 정의
 */

export interface YtDlpVideoInfo {
  id: string;
  title: string;
  description: string;
  uploader: string;
  upload_date: string;
  duration: number;
  thumbnail: string;
  webpage_url: string;
}

export interface PlaylistVideoInfo {
  videoId: string;
  title: string;
  url: string;
  position: number;
}

export interface DownloadResult {
  videoId: string;
  title: string;
  success: boolean;
  subtitlePath?: string;
  metadataPath?: string;
  error?: string;
}
