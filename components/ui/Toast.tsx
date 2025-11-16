"use client";
import { useEffect } from "react";

export default function Toast({ message, type, onClose }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto hide after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-700";

  return (
    <div
      className={`${bg} text-white px-4 py-2 rounded shadow-lg fixed top-5 right-5 z-50 animate-fadeIn`}
    >
      {message}
    </div>
  );
}
