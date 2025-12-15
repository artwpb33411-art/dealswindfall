export function getDeviceInfo() {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  const isTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // -------- Device Type --------
  let device_type: "mobile" | "tablet" | "desktop" = "desktop";
  if (/iPad|Tablet/i.test(ua)) device_type = "tablet";
  else if (/Mobi|Android/i.test(ua)) device_type = "mobile";

  // -------- OS --------
  let os = "Unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  // -------- Browser --------
  let browser = "Other";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";

  return {
    browser,
    metadata: {
      os,
      device_type,
      screen: `${screenWidth}x${screenHeight}`,
      dpr,
      touch: isTouch,
    },
  };
}
