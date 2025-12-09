import { Home, User, Coins, PlusCircle, CheckCircle } from "lucide-react"
import { Users, CreditCard, Tag, Calendar } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useUser } from "@/context/UserContext"

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
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Promotions", url: "/promotions", icon: Tag },
  { title: "Events", url: "/events", icon: Calendar },
]

const cashier_items = [
  { title: "Home", url: "/cashier", icon: Home },
  { title: "Transactions", url: "/cashier/transactions", icon: CreditCard },
]

const manage_items = [
  { title: "Users", url: "/manage/users", icon: Users },
  { title: "Transactions", url: "/manage/transactions", icon: CreditCard },
  { title: "Promotions", url: "/manage/promotions", icon: Tag },
  { title: "Events", url: "/manage/events", icon: Calendar },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useUser()

  const isActive = (url) => location.pathname === url

  const canSeeCashier = ["cashier", "manager", "superuser"].includes(user.role)
  const canSeeManage  = ["manager", "superuser"].includes(user.role)

  return (
    <Sidebar>
      {/* LOGO */}
      <div className="mr-auto w-48 m-4">
        <Link to="/dashboard">
          <img src="/src/assets/auraclub_logo.svg" className="max-w-xs w-full h-auto" />
        </Link>
      </div>

      {/* --- PROFILE SECTION AT TOP --- */}
      <div className="p-4">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition"
        >
          <User className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-semibold leading-tight">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.role}
            </span>
          </div>
        </Link>
      </div>

      {/* --- SIDEBAR CONTENT --- */}
      <SidebarContent>

        {/* REGULAR PAGES */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigate_items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={isActive(item.url) ? "bg-gray-100 rounded-md" : ""}
                  >
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

        {/* CASHIER SECTION */}
        {canSeeCashier && (
          <SidebarGroup>
            <SidebarGroupLabel>Cashier</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {cashier_items.map((item) => (
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
        )}

        {/* MANAGE SECTION */}
        {canSeeManage && (
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
        )}

      </SidebarContent>
    </Sidebar>
  )
}
