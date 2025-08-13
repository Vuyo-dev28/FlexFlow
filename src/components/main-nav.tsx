
'use client';

import Link from "next/link";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "./ui/sidebar";
import { Home, BotMessageSquare } from "lucide-react";

export function MainNav() {
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/" passHref>
                    <SidebarMenuButton onClick={() => setOpenMobile(false)}>
                        <Home />
                        <span>Home</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/analyze" passHref>
                    <SidebarMenuButton onClick={() => setOpenMobile(false)}>
                        <BotMessageSquare />
                        <span>Chart Analyzer</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
