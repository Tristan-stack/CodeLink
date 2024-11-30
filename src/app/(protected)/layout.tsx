"use client"
import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import { AppSidebar } from './dashboard/app-sidebar'
import { ThemeProvider } from "next-themes";

import React from 'react'

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
    return (
        <ThemeProvider attribute="class" defaultTheme="light">
            <SidebarProvider>
                <AppSidebar />
                <main className='w-full m-2'>
                    <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>
                        {/* <SearchBar /> */}
                        <div className='ml-auto'></div>
                        <UserButton />
                    </div>
                    <div className='h-4'></div>

                    <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-auto h-[calc(100vh-6rem)] p-4'>
                        {children}
                    </div>

                </main>
            </SidebarProvider>
        </ThemeProvider>
    )
}

export default SidebarLayout