import { Home, Coins } from "lucide-react"

import { Users, CreditCard, Tag, Calendar} from "lucide-react"
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
const navigate_items = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },

    {
      title: "Points",
      url: "/dashboard",
      icon: Coins,
    },

      {
      title: "Transactions",
      url: "#",
      icon: CreditCard,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon:   Tag,
    },
    {
      title: "Events",
      url: "#",
      icon: Calendar,
    },
]

const manage_items = [
  {
    title: "Users",
    url: "/manage/users",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "/manage/transactions",
    icon: CreditCard,
  },
  {
    title: "Promotions",
    url: "/manage/promotions",
    icon: Tag,
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
              {navigate_items.map((item) => (
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
        
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manage_items.map((item) => (
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