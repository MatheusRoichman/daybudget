"use client";

import { BarChart3, LayoutDashboard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/", icon: LayoutDashboard, label: "Dashboard" },
	{ href: "/campaigns", icon: BarChart3, label: "Campanhas" },
	{ href: "/campaigns/new", icon: PlusCircle, label: "Adicionar" },
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 w-full z-50 bg-[#111318]/90 backdrop-blur-2xl border-t border-outline-variant/15 flex justify-around items-center px-4 pb-6 pt-2 shadow-[0_-10px_40px_rgba(173,198,255,0.08)]">
			{navItems.map(({ href, icon: Icon, label }) => {
				const isActive =
					href === "/" ? pathname === "/" : pathname.startsWith(href);
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex flex-col items-center justify-center py-2 px-4 transition-all",
							isActive
								? "bg-ds-primary/10 text-ds-primary rounded-xl scale-95"
								: "text-on-surface-variant hover:bg-surface-container-high",
						)}
					>
						<Icon className="w-5 h-5 mb-1" />
						<span className="font-sora text-[10px] uppercase tracking-widest font-medium">
							{label}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
