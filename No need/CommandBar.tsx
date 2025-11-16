import { Trash2, Archive, Flag, FolderUp, Reply, Zap, Plus } from "lucide-react";

export default function CommandBar() {
  const actions = [
    { name: "New Deal", icon: <Plus size={16} />, color: "bg-red-500 text-white" },
    { name: "Delete", icon: <Trash2 size={16} />, color: "text-gray-700" },
    { name: "Archive", icon: <Archive size={16} />, color: "text-gray-700" },
    { name: "Flag", icon: <Flag size={16} />, color: "text-gray-700" },
    { name: "Move", icon: <FolderUp size={16} />, color: "text-gray-700" },
    { name: "Reply", icon: <Reply size={16} />, color: "text-gray-700" },
    { name: "Quick", icon: <Zap size={16} />, color: "text-yellow-500" },
  ];

  return (
    <div className="flex items-center gap-3 bg-white border-b border-gray-200 p-2 shadow-sm">
      {actions.map((a, i) => (
        <button
          key={i}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 transition ${a.color}`}
        >
          {a.icon}
          <span>{a.name}</span>
        </button>
      ))}
    </div>
  );
}
