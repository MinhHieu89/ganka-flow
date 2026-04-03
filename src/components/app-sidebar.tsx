import * as React from "react"
import { NavLink } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
  Stethoscope02Icon,
  UserGroupIcon,
  MedicineBottle02Icon,
} from "@hugeicons/core-free-icons"

const navItems = [
  {
    title: "Bệnh nhân",
    url: "/patients",
    icon: UserGroupIcon,
  },
  {
    title: "Tiếp nhận",
    url: "/intake",
    icon: UserAdd01Icon,
  },
  {
    title: "Lịch hẹn",
    url: "/schedule",
    icon: Calendar01Icon,
  },
  {
    title: "Sàng lọc",
    url: "/screening",
    icon: Search01Icon,
  },
  { title: "Khám bệnh", url: "/doctor", icon: Stethoscope02Icon },
  { title: "Nhà thuốc", url: "/pharmacy", icon: MedicineBottle02Icon },
]

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HugeiconsIcon
                    icon={CommandIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ganka28</span>
                  <span className="truncate text-xs">Phòng khám mắt</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-1 p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink to={item.url}>
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
