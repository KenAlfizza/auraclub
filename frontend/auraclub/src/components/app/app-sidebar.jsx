import { Home, Users, BadgeDollarSign, SquarePercent, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "#",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "#",
    icon: BadgeDollarSign,
  },
  {
    title: "Promotions",
    url: "#",
    icon: SquarePercent,
  },
  {
    title: "Events",
    url: "#",
    icon: Calendar,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
        <div className="mr-auto w-48 m-4">
          <Link to="/dashboard">
              <img src="/src/assets/auraclub_logo.svg" className="max-w-xs w-full h-auto"/>
          </Link>
        </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}