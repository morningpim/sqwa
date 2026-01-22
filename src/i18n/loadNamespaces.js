// โหลดทุกไฟล์ json ทั้ง th / en ตั้งแต่แรก
const modules = import.meta.glob("./**/*.json", {
  eager: true,
  import: "default"
});

export function loadLanguage(lang) {
  const result = {};

  Object.entries(modules).forEach(([path, content]) => {
    // path example: ./th/common.json
    const [, lng, file] = path.match(/\.\/(.*?)\/(.*?).json$/) || [];
    if (lng === lang) {
      result[file] = content;
    }
  });

  return result;
}
