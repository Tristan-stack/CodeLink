import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { url } from "inspector"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation, Sparkle } from "lucide-react"
import { projectShutdown } from "next/dist/build/swc/generated-native"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { title } from "process"

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import useProjects from "@/hooks/use-projects";

const items = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Q&A',
        url: '/qa',
        icon: Bot
    },
    {
        title: 'Meetings',
        url: '/meetings',
        icon: Presentation
    },
    {
        title: 'Billing',
        url: '/billing',
        icon: CreditCard
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const {open} = useSidebar()
    const { theme, setTheme } = useTheme();
    const {projects, projectId, setProjectId } = useProjects()
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Image src="/logo.png" width={25} height={25} alt="CodeLink Logo" />
                {open && (
                  <h1 className="text-xl font-bold text-primary">
                    CodeLink
                  </h1>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
              </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return(
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname === item.url,
                                            }, '')}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>

                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map(project => {
                                return(
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={()=>{
                                                setProjectId(project.id)
                                            }} >
                                                <div className={cn(
                                                    'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                                    {
                                                        'bg-primary text-white': project.id === projectId
                                                    }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                <span>{project.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>

                            {open && (
                                <SidebarMenuItem>
                                    <Link href='/create'>
                                        <Button variant="outline" className="w-fit" size='sm'>
                                            <Plus />
                                            Create Project
                                            
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>

                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>

    )

}