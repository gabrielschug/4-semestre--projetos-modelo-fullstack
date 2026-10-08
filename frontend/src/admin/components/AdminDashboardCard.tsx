import { Card } from "flowbite-react";

type AdminDashboardCardProps = {
  label: string;
  value: number;
  tone: "amber" | "red" | "orange" | "violet" | "blue" | "green";
};

const toneClasses = {
  amber: {
    card: "border-amber-200 bg-amber-50",
    value: "text-amber-900",
    label: "text-amber-800",
  },
  red: {
    card: "border-red-200 bg-red-50",
    value: "text-red-900",
    label: "text-red-800",
  },
  orange: {
    card: "border-orange-200 bg-orange-50",
    value: "text-orange-900",
    label: "text-orange-800",
  },
  violet: {
    card: "border-violet-200 bg-violet-50",
    value: "text-violet-900",
    label: "text-violet-800",
  },
  blue: {
    card: "border-blue-200 bg-blue-50",
    value: "text-blue-900",
    label: "text-blue-800",
  },
  green: {
    card: "border-green-200 bg-green-50",
    value: "text-green-900",
    label: "text-green-800",
  },
} as const;

export default function AdminDashboardCard({
  label,
  value,
  tone,
}: AdminDashboardCardProps) {
  const colors = toneClasses[tone];

  return (
    <Card className={`min-w-0 flex-1 basis-40 ${colors.card}`}>
      <h3 className={`text-2xl font-bold tracking-tight ${colors.value}`}>
        {value}
      </h3>
      <p className={`font-normal ${colors.label}`}>{label}</p>
    </Card>
  );
}
