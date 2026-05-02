import { FileText, MessageSquare, CheckCircle, Zap } from "lucide-react";

interface DashboardStatsProps {
  totalDocs: number;
  readyDocs: number;
  totalChats: number;
  plan: string;
}

export function DashboardStats({ totalDocs, readyDocs, totalChats, plan }: DashboardStatsProps) {
  const stats = [
    {
      label: "Documents",
      value: totalDocs,
      icon: FileText,
      color: "bg-violet-100 text-violet-600",
    },
    {
      label: "Ready to chat",
      value: readyDocs,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Chat sessions",
      value: totalChats,
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Current plan",
      value: plan,
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
            <s.icon className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
