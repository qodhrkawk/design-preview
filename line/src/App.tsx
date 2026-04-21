import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { lazy, Suspense } from 'react'

// -- PAGE REGISTRY (에이전트가 여기에 추가) --
interface PageEntry {
  slug: string
  title: string
  description: string
  date: string
  viewport: 'desktop' | 'mobile'
}

const pages: PageEntry[] = [
  {
    slug: '2026-04-21-prompt-lab',
    title: 'Gemma Prompt Lab',
    description: 'Prompt 관리 + LLM 분석 결과 라벨링 도구 (다크 테마)',
    date: '2026-04-21',
    viewport: 'desktop',
  },
  {
    slug: '2026-04-21-login',
    title: '로그인',
    description: '이메일/비밀번호 + 소셜 로그인 (Google, Apple, Kakao)',
    date: '2026-04-21',
    viewport: 'desktop',
  },
]

// -- LAZY IMPORTS (에이전트가 여기에 추가) --
const PromptLabPage = lazy(() => import('./pages/2026-04-21-prompt-lab/Page'))
const LoginPage = lazy(() => import('./pages/2026-04-21-login/Page'))

// -- ROUTES (에이전트가 여기에 추가) --
const pageRoutes: { path: string; element: React.ReactNode }[] = [
  { path: '/2026-04-21-prompt-lab', element: <Suspense fallback={null}><PromptLabPage /></Suspense> },
  { path: '/2026-04-21-login', element: <Suspense fallback={null}><LoginPage /></Suspense> },
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
