"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { AuthDebug } from "@/components/auth-debug";
import { ForceLogoutButton } from "@/components/force-logout-button";
import { OrderNotificationsProvider } from "@/contexts/order-notifications-context";
import { NotificationsSidebar } from "@/components/notifications/notifications-sidebar";
import { POSHeaderProvider } from "@/contexts/pos-header-context";
import { PlanLimitNotification } from "@/components/plan-limit-notification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false);
  const [notificationsSidebarOpen, setNotificationsSidebarOpen] = React.useState(false);
  const { config } = useSidebarConfig();
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/pdv");
  
  // Sincronizar autenticação entre AuthContext e ApiClient
  useAuthSync();

  return (
    <OrderNotificationsProvider>
      <POSHeaderProvider>
      <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
        "--header-height": "calc(var(--spacing) * 14)",
      } as React.CSSProperties}
      className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
    >
      {config.side === "left" ? (
        <>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
          <SidebarInset>
            <SiteHeader onNotificationsClick={() => setNotificationsSidebarOpen(true)} />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <PlanLimitNotification />
                  </div>
                  {children}
                </div>
              </div>
            </div>
            {!hideFooter && <SiteFooter />}
          </SidebarInset>
        </>
      ) : (
        <>
          <SidebarInset>
            <SiteHeader onNotificationsClick={() => setNotificationsSidebarOpen(true)} />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <PlanLimitNotification />
                  </div>
                  {children}
                </div>
              </div>
            </div>
            {!hideFooter && <SiteFooter />}
          </SidebarInset>
          <AppSidebar
            variant={config.variant}
            collapsible={config.collapsible}
            side={config.side}
          />
        </>
      )}

      {/* Notifications Sidebar */}
      <NotificationsSidebar
        open={notificationsSidebarOpen}
        onClose={() => setNotificationsSidebarOpen(false)}
      />

      {/* Theme Customizer */}
      {/* <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} /> */}
      {/* <ThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      /> */}
      
      {/* Debug de autenticação (apenas em desenvolvimento) */}
      {/* <AuthDebug /> */}
      
      {/* Botão para forçar logout em caso de token inválido */}
    {/* <ForceLogoutButton /> */}
      </SidebarProvider>
      </POSHeaderProvider>
    </OrderNotificationsProvider>
  );
}
