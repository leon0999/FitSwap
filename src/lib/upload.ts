/**
 * 이미지 업로드 서비스
 *
 * 옵션 1: Cloudflare Images (추천)
 * - 비용: $5/100K images
 * - 자동 최적화 (WebP/AVIF)
 * - 글로벌 CDN
 *
 * 옵션 2: Vercel Blob (간단)
 * - 비용: $0.15/GB
 * - 1-click 설정
 */

/**
 * Cloudflare Images 업로드
 */
export async function uploadToCloudflare(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudflare');
  }

  const data = await response.json();

  // 업로드된 이미지 URL
  const imageUrl = data.result.variants[0]; // 최적화된 URL

  return imageUrl;
}

/**
 * Base64 → File 변환
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * 이미지 리사이징 (클라이언트 사이드)
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 1024,
  maxHeight: number = 1024
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // 비율 유지하면서 리사이즈
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'));
            return;
          }
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        'image/jpeg',
        0.9 // 품질 90%
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 이미지 검증
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // 파일 타입 체크
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use JPG, PNG, or WebP.' };
  }

  // 파일 크기 체크 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum 10MB.' };
  }

  return { valid: true };
}

/**
 * 임시 방편: Base64로 직접 전송 (프로토타입용)
 *
 * 장점: 설정 불필요
 * 단점: 33% 더 큰 데이터, 캐싱 어려움
 *
 * 프로덕션에서는 Cloudflare Images 사용 권장
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
