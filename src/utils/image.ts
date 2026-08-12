/**
 * 이미지를 미리 받아둡니다.
 * 테마를 바꿀 때 배경이 흰 화면으로 깜빡였다가 뜨는 걸 막으려고 씁니다.
 * background-image 로만 쓰기 때문에 S3 버킷에 CORS 설정은 필요 없어요.
 * (canvas나 fetch로 읽을 때만 CORS가 필요합니다.)
 */
export const preloadImage = (src?: string) =>
  new Promise<boolean>((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

export const preloadImages = (srcs: (string | undefined)[]) =>
  Promise.all(srcs.map(preloadImage));

/** 빈 문자열, 'string'(Swagger 예시값) 같은 가짜 URL을 걸러냅니다. */
export const safeImageUrl = (url?: string | null) =>
  url && /^https?:\/\//.test(url) ? url : undefined;