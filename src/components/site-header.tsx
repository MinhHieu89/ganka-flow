import { Link, useLocation } from "react-router"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  "/intake": "Bệnh nhân",
  "/intake/new": "Tiếp nhận bệnh nhân",
  "/schedule/new": "Đặt lịch hẹn",
  "/screening": "Sàng lọc",
  "/doctor": "Khám bệnh",
}

export function SiteHeader() {
  const { pathname } = useLocation()

  // Match longest prefix first
  const matchedPath = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(p))

  const pageTitle = matchedPath ? pageTitles[matchedPath] : undefined

  // For edit pages, show dynamic title
  const isEdit = pathname.match(/^\/intake\/(.+)\/edit$/)
  const isScreeningVisit = pathname.match(/^\/screening\/(.+)$/)
  const isDoctorExam = pathname.match(/^\/doctor\/(.+)$/)
  const displayTitle = isEdit
    ? "Sửa thông tin bệnh nhân"
    : isScreeningVisit
      ? "Sàng lọc bệnh nhân"
      : isDoctorExam
        ? "Khám bệnh nhân"
        : pageTitle

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/">Ganka28</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {displayTitle && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
