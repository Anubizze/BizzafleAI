import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Scale,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

export const mainNav = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/dashboard/ai", label: "Айдана", icon: Sparkles },
  { href: "/dashboard/accounting", label: "Бухгалтерия", icon: Wallet },
  { href: "/dashboard/legal", label: "Право", icon: Scale },
  { href: "/dashboard/consulting", label: "Консалтинг", icon: Briefcase },
  { href: "/dashboard/documents", label: "Документы", icon: FileText },
  { href: "/dashboard/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/dashboard/finance", label: "Финансы", icon: Wallet },
  { href: "/dashboard/company", label: "Компания", icon: Building2 },
  { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
];

export const bottomNav = [
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
  { href: "/dashboard/support", label: "Поддержка", icon: CircleHelp },
  { href: "/dashboard/profile", label: "Профиль", icon: UserRound },
];
