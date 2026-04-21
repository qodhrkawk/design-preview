import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
// Note: when adding lazy-loaded pages, import { lazy, Suspense } from 'react'

// -- PAGE REGISTRY (에이전트가 여기에 추가) --
interface PageEntry {
  slug: string
  title: string
  description: string
  date: string
  viewport: 'desktop' | 'mobile'
}

const pages: PageEntry[] = [
  // 에이전트가 새 페이지 추가 시 이 배열에 엔트리를 추가한다
]

// -- LAZY IMPORTS (에이전트가 여기에 추가) --

// -- ROUTES (에이전트가 여기에 추가) --
const pageRoutes: { path: string; element: React.ReactNode }[] = [
  // 에이전트가 새 라우트 추가 시 이 배열에 엔트리를 추가한다
]

function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LINE Design Preview</h1>
        <p className="text-gray-500 mb-8">UI/UX 프로토타입 갤러리</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.length === 0 && (
            <p className="text-gray-400 col-span-2">아직 등록된 디자인이 없습니다.</p>
          )}
          {pages.map((page) => (
            <Link key={page.slug} to={`/${page.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={page.viewport === 'mobile' ? 'secondary' : 'outline'}>
                        {page.viewport}
                      </Badge>
                      <span className="text-xs text-gray-400">{page.date}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        {pageRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </HashRouter>
  )
}
