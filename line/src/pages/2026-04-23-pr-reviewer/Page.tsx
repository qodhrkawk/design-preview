import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Settings,
  GitPullRequest,
  FileCode,
  FilePlus,
  FileText,
  FolderOpen,
  Check,
  CheckCircle,
  ChevronRight,
  MessageSquare,
  Send,
  Bot,
  User,
  Plus,
  AlertTriangle,
  Shield,
  Clock,
  GitBranch,
  Star,
  Eye,
  Search,
  RefreshCw,
  XCircle,
  CircleDot,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'list' | 'review' | 'settings'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPRs = [
  {
    id: 1,
    repo: 'line-server/auth-service',
    title: 'feat: JWT refresh token rotation 구현',
    author: 'Kim Minjun',
    authorInitials: 'KM',
    filesChanged: 8,
    additions: 245,
    deletions: 32,
    timeAgo: '23분 전',
    labels: ['feature', 'auth'],
    branch: 'feat/token-rotation',
    draft: false,
  },
  {
    id: 2,
    repo: 'line-server/api-gateway',
    title: 'fix: rate limiter Redis connection pool leak',
    author: 'Park Soyeon',
    authorInitials: 'PS',
    filesChanged: 3,
    additions: 47,
    deletions: 12,
    timeAgo: '1시간 전',
    labels: ['bugfix', 'critical'],
    branch: 'fix/redis-pool-leak',
    draft: false,
  },
  {
    id: 3,
    repo: 'line-server/user-service',
    title: 'refactor: UserRepository를 interface 기반으로 전환',
    author: 'Lee Jihoon',
    authorInitials: 'LJ',
    filesChanged: 14,
    additions: 389,
    deletions: 201,
    timeAgo: '2시간 전',
    labels: ['refactor'],
    branch: 'refactor/user-repo-interface',
    draft: false,
  },
  {
    id: 4,
    repo: 'line-client/web-app',
    title: 'feat: 다크모드 토글 및 시스템 설정 연동',
    author: 'Choi Yuna',
    authorInitials: 'CY',
    filesChanged: 6,
    additions: 128,
    deletions: 15,
    timeAgo: '3시간 전',
    labels: ['feature', 'frontend'],
    branch: 'feat/dark-mode',
    draft: false,
  },
  {
    id: 5,
    repo: 'line-server/notification-service',
    title: 'chore: Kafka consumer group rebalance 설정 최적화',
    author: 'Jang Hyunwoo',
    authorInitials: 'JH',
    filesChanged: 2,
    additions: 18,
    deletions: 7,
    timeAgo: '5시간 전',
    labels: ['chore', 'infra'],
    branch: 'chore/kafka-rebalance',
    draft: true,
  },
]

const changedFiles = [
  { name: 'src/auth/middleware.ts', adds: 82, dels: 14, reviewed: true, type: 'modified' as const },
  { name: 'src/auth/token.service.ts', adds: 64, dels: 8, reviewed: true, type: 'modified' as const },
  { name: 'src/auth/refresh.guard.ts', adds: 45, dels: 0, reviewed: false, type: 'added' as const },
  { name: 'src/auth/types.ts', adds: 18, dels: 2, reviewed: false, type: 'modified' as const },
  { name: 'src/config/jwt.config.ts', adds: 12, dels: 3, reviewed: false, type: 'modified' as const },
  { name: 'test/auth/middleware.spec.ts', adds: 16, dels: 3, reviewed: false, type: 'modified' as const },
  { name: 'test/auth/token.service.spec.ts', adds: 5, dels: 0, reviewed: false, type: 'added' as const },
  { name: 'package.json', adds: 3, dels: 2, reviewed: false, type: 'modified' as const },
]

const chatMessages = [
  {
    role: 'ai' as const,
    content: null,
    structured: {
      summary:
        'JWT refresh token에 rotation 정책을 적용하는 변경입니다. 기존 단순 갱신 방식에서 매 refresh마다 새로운 token pair를 발급하고, 이전 refresh token을 무효화합니다.',
      risk: 'Medium',
      findings: [
        {
          type: 'warning',
          title: 'Race Condition 가능성',
          desc: 'concurrent refresh 요청 시 token family 무효화 로직에서 race condition이 발생할 수 있습니다. Redis lock 또는 atomic operation 적용을 권장합니다.',
          file: 'src/auth/token.service.ts',
          line: '47-52',
        },
        {
          type: 'info',
          title: 'Token family tracking',
          desc: 'refreshTokenFamily 필드를 통한 token lineage 추적은 적절한 설계입니다. replay attack 방어에 효과적입니다.',
          file: 'src/auth/middleware.ts',
          line: '23',
        },
        {
          type: 'warning',
          title: 'Error handling 누락',
          desc: 'revokeTokenFamily()에서 Redis 장애 시 fallback 처리가 없습니다. 토큰 무효화 실패 시 보안 이슈로 이어질 수 있습니다.',
          file: 'src/auth/token.service.ts',
          line: '78',
        },
      ],
    },
  },
  {
    role: 'user' as const,
    content: 'validateRefreshToken 함수 caller 다 괜찮아?',
    structured: null,
  },
  {
    role: 'ai' as const,
    content: `프로젝트 전체를 검색한 결과, validateRefreshToken()의 caller는 3곳입니다:

1. **src/auth/middleware.ts:34** - AuthMiddleware.refreshTokens()
   - 정상. rotation 로직과 함께 호출됩니다.

2. **src/auth/refresh.guard.ts:18** - RefreshGuard.canActivate()
   - 정상. NestJS guard에서 토큰 유효성 검증용으로 사용합니다.

3. **test/auth/middleware.spec.ts:56** - 테스트 코드
   - 정상. mock 처리되어 있습니다.

기존 caller 모두 새로운 시그니처(tokenFamily 파라미터 추가)에 맞게 업데이트되었습니다. 누락된 곳은 없습니다.`,
    structured: null,
  },
]

// ─── Diff Lines ──────────────────────────────────────────────────────────────

const diffLines: {
  leftNum: number | null
  rightNum: number | null
  type: 'context' | 'add' | 'remove' | 'header'
  left: string
  right: string
}[] = [
  { leftNum: null, rightNum: null, type: 'header', left: '@@ -18,24 +18,38 @@ import { TokenService } from ./token.service', right: '' },
  { leftNum: 18, rightNum: 18, type: 'context', left: 'export class AuthMiddleware implements NestMiddleware {', right: 'export class AuthMiddleware implements NestMiddleware {' },
  { leftNum: 19, rightNum: 19, type: 'context', left: '  constructor(', right: '  constructor(' },
  { leftNum: 20, rightNum: 20, type: 'context', left: '    private readonly tokenService: TokenService,', right: '    private readonly tokenService: TokenService,' },
  { leftNum: 21, rightNum: 21, type: 'context', left: '    private readonly configService: ConfigService,', right: '    private readonly configService: ConfigService,' },
  { leftNum: 22, rightNum: 22, type: 'context', left: '  ) {}', right: '  ) {}' },
  { leftNum: 23, rightNum: 23, type: 'context', left: '', right: '' },
  { leftNum: 24, rightNum: null, type: 'remove', left: '  async use(req: Request, res: Response, next: NextFunction) {', right: '' },
  { leftNum: 25, rightNum: null, type: 'remove', left: '    const refreshToken = req.cookies[REFRESH_TOKEN_KEY];', right: '' },
  { leftNum: 26, rightNum: null, type: 'remove', left: '    if (!refreshToken) {', right: '' },
  { leftNum: 27, rightNum: null, type: 'remove', left: '      throw new UnauthorizedException(Refresh token missing);', right: '' },
  { leftNum: 28, rightNum: null, type: 'remove', left: '    }', right: '' },
  { leftNum: null, rightNum: 24, type: 'add', left: '', right: '  async use(req: Request, res: Response, next: NextFunction) {' },
  { leftNum: null, rightNum: 25, type: 'add', left: '', right: '    const refreshToken = req.cookies[REFRESH_TOKEN_KEY];' },
  { leftNum: null, rightNum: 26, type: 'add', left: '', right: '    const tokenFamily = req.cookies[TOKEN_FAMILY_KEY];' },
  { leftNum: null, rightNum: 27, type: 'add', left: '', right: '' },
  { leftNum: null, rightNum: 28, type: 'add', left: '', right: '    if (!refreshToken || !tokenFamily) {' },
  { leftNum: null, rightNum: 29, type: 'add', left: '', right: '      throw new UnauthorizedException(Refresh token or family missing);' },
  { leftNum: null, rightNum: 30, type: 'add', left: '', right: '    }' },
  { leftNum: null, rightNum: 31, type: 'add', left: '', right: '' },
  { leftNum: null, rightNum: 32, type: 'add', left: '', right: '    // Validate and rotate the refresh token' },
  { leftNum: null, rightNum: 33, type: 'add', left: '', right: '    const validation = await this.tokenService.validateRefreshToken(' },
  { leftNum: null, rightNum: 34, type: 'add', left: '', right: '      refreshToken,' },
  { leftNum: null, rightNum: 35, type: 'add', left: '', right: '      tokenFamily,' },
  { leftNum: null, rightNum: 36, type: 'add', left: '', right: '    );' },
  { leftNum: 29, rightNum: 37, type: 'context', left: '', right: '' },
  { leftNum: 30, rightNum: null, type: 'remove', left: '    const payload = await this.tokenService.verifyRefreshToken(refreshToken);', right: '' },
  { leftNum: 31, rightNum: null, type: 'remove', left: '    const newAccessToken = await this.tokenService.generateAccessToken(payload);', right: '' },
  { leftNum: null, rightNum: 38, type: 'add', left: '', right: '    if (!validation.valid) {' },
  { leftNum: null, rightNum: 39, type: 'add', left: '', right: '      // Token reuse detected - revoke entire family' },
  { leftNum: null, rightNum: 40, type: 'add', left: '', right: '      await this.tokenService.revokeTokenFamily(tokenFamily);' },
  { leftNum: null, rightNum: 41, type: 'add', left: '', right: '      throw new UnauthorizedException(Token reuse detected);' },
  { leftNum: null, rightNum: 42, type: 'add', left: '', right: '    }' },
  { leftNum: null, rightNum: 43, type: 'add', left: '', right: '' },
  { leftNum: null, rightNum: 44, type: 'add', left: '', right: '    const { accessToken, refreshToken: newRefresh } =' },
  { leftNum: null, rightNum: 45, type: 'add', left: '', right: '      await this.tokenService.rotateTokens(validation.payload, tokenFamily);' },
  { leftNum: 32, rightNum: 46, type: 'context', left: '', right: '' },
  { leftNum: 33, rightNum: null, type: 'remove', left: '    res.cookie(ACCESS_TOKEN_KEY, newAccessToken, this.cookieOptions);', right: '' },
  { leftNum: null, rightNum: 47, type: 'add', left: '', right: '    res.cookie(ACCESS_TOKEN_KEY, accessToken, this.cookieOptions);' },
  { leftNum: null, rightNum: 48, type: 'add', left: '', right: '    res.cookie(REFRESH_TOKEN_KEY, newRefresh, this.refreshCookieOptions);' },
  { leftNum: 34, rightNum: 49, type: 'context', left: '    next();', right: '    next();' },
  { leftNum: 35, rightNum: 50, type: 'context', left: '  }', right: '  }' },
  { leftNum: 36, rightNum: 51, type: 'context', left: '}', right: '}' },
]

const repoMappings = [
  { repo: 'line-server/auth-service', localPath: '/Users/minjun/dev/auth-service' },
  { repo: 'line-server/api-gateway', localPath: '/Users/minjun/dev/api-gateway' },
  { repo: 'line-server/user-service', localPath: '/Users/minjun/dev/user-service' },
  { repo: 'line-client/web-app', localPath: '/Users/minjun/dev/web-app' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs'
  return (
    <div className={`${dim} rounded-full bg-[#2d333b] border border-[#444c56] flex items-center justify-center text-[#adbac7] font-medium shrink-0`}>
      {initials}
    </div>
  )
}

function LabelBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    feature: 'bg-[#1f6feb33] text-[#58a6ff] border-[#1f6feb55]',
    auth: 'bg-[#da3633]/20 text-[#f85149] border-[#da3633]/40',
    bugfix: 'bg-[#da3633]/20 text-[#f85149] border-[#da3633]/40',
    critical: 'bg-[#f0883e]/20 text-[#f0883e] border-[#f0883e]/40',
    refactor: 'bg-[#8b949e]/20 text-[#8b949e] border-[#8b949e]/40',
    frontend: 'bg-[#3fb950]/20 text-[#3fb950] border-[#3fb950]/40',
    chore: 'bg-[#8b949e]/20 text-[#8b949e] border-[#8b949e]/40',
    infra: 'bg-[#a371f7]/20 text-[#a371f7] border-[#a371f7]/40',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${colors[label] || 'bg-[#30363d] text-[#8b949e] border-[#444c56]'}`}>
      {label}
    </span>
  )
}

// ─── Screen: PR List ─────────────────────────────────────────────────────────

function PRListScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-[#58a6ff]" />
            <span className="text-[15px] font-semibold text-[#e6edf3]">PR Reviewer</span>
          </div>
          <Badge className="bg-[#1f6feb33] text-[#58a6ff] border-[#1f6feb55] hover:bg-[#1f6feb33]">
            {mockPRs.length} pending
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              type="text"
              placeholder="PR 검색..."
              className="h-8 w-56 pl-8 pr-3 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
            />
          </div>
          <button className="p-2 rounded-md hover:bg-[#30363d] text-[#8b949e] transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-md hover:bg-[#30363d] text-[#8b949e] transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-0 px-5 bg-[#161b22] border-b border-[#30363d]">
        <button className="px-4 py-2.5 text-sm font-medium text-[#e6edf3] border-b-2 border-[#f78166]">
          Review Requested
        </button>
        <button className="px-4 py-2.5 text-sm text-[#8b949e] hover:text-[#c9d1d9] border-b-2 border-transparent">
          Assigned
        </button>
        <button className="px-4 py-2.5 text-sm text-[#8b949e] hover:text-[#c9d1d9] border-b-2 border-transparent">
          Created
        </button>
      </div>

      {/* PR List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-4 px-5 space-y-2">
          {mockPRs.map((pr) => (
            <div
              key={pr.id}
              className="group bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#58a6ff]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-[#8b949e] font-mono">{pr.repo}</span>
                    {pr.draft && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-[#8b949e] border border-[#444c56]">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-medium text-[#e6edf3] leading-snug mb-2 group-hover:text-[#58a6ff] transition-colors">
                    {pr.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={pr.authorInitials} size="sm" />
                      <span className="text-xs text-[#8b949e]">{pr.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8b949e]">
                      <FileCode className="h-3 w-3" />
                      <span>{pr.filesChanged} files</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#3fb950]">+{pr.additions}</span>
                      <span className="text-[#f85149]">-{pr.deletions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#484f58]">
                      <Clock className="h-3 w-3" />
                      <span>{pr.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {pr.labels.map((l) => (
                        <LabelBadge key={l} label={l} />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('review')}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">AI 리뷰</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-[#161b22] border-t border-[#30363d] text-[11px] text-[#484f58]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CircleDot className="h-3 w-3 text-[#3fb950]" />
            GHE Connected
          </span>
          <span>ghe.linecorp.com</span>
        </div>
        <span>Last synced: 2분 전</span>
      </div>
    </div>
  )
}

// ─── Screen: Review (3-panel) ────────────────────────────────────────────────

function ReviewScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selectedFile, setSelectedFile] = useState(0)
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('list')}
            className="p-1.5 rounded hover:bg-[#30363d] text-[#8b949e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <GitPullRequest className="h-4 w-4 text-[#3fb950]" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e] font-mono">line-server/auth-service</span>
            <span className="text-[#30363d]">/</span>
            <span className="text-sm font-medium text-[#e6edf3]">feat: JWT refresh token rotation 구현</span>
            <span className="text-xs text-[#8b949e] font-mono">#247</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <GitBranch className="h-3 w-3" />
          <span className="font-mono">feat/token-rotation</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono">main</span>
        </div>
      </header>

      {/* 3-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: File tree */}
        <div className="w-[220px] shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
            <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">Changed Files</span>
            <Badge className="bg-[#30363d] text-[#8b949e] border-0 hover:bg-[#30363d] text-[10px] h-5">
              {changedFiles.length}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {changedFiles.map((f, i) => {
              const Icon = f.type === 'added' ? FilePlus : FileText
              const parts = f.name.split('/')
              const fileName = parts.pop()
              const dir = parts.join('/')
              return (
                <button
                  key={i}
                  onClick={() => setSelectedFile(i)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#161b22] transition-colors ${selectedFile === i ? 'bg-[#161b22] border-l-2 border-[#58a6ff]' : 'border-l-2 border-transparent'}`}
                >
                  {f.reviewed ? (
                    <Check className="h-3.5 w-3.5 text-[#3fb950] shrink-0" />
                  ) : (
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${f.type === 'added' ? 'text-[#3fb950]' : 'text-[#8b949e]'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    {dir && <div className="text-[10px] text-[#484f58] truncate">{dir}/</div>}
                    <div className={`text-xs truncate ${selectedFile === i ? 'text-[#e6edf3]' : 'text-[#adbac7]'}`}>
                      {fileName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] shrink-0">
                    <span className="text-[#3fb950]">+{f.adds}</span>
                    <span className="text-[#f85149]">-{f.dels}</span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t border-[#30363d]">
            <div className="text-[10px] text-[#484f58]">
              <span className="text-[#3fb950]">+245</span>{' '}
              <span className="text-[#f85149]">-32</span>{' '}
              across 8 files
            </div>
          </div>
        </div>

        {/* Center: Diff view */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* File header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5 text-[#8b949e]" />
              <span className="text-sm text-[#e6edf3] font-mono">{changedFiles[selectedFile].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#8b949e] hover:bg-[#30363d] transition-colors">
                <Eye className="h-3 w-3" />
                Viewed
              </button>
            </div>
          </div>

          {/* Diff content */}
          <div className="flex-1 overflow-auto font-mono text-[12px] leading-[20px]">
            <table className="w-full border-collapse">
              <tbody>
                {diffLines.map((line, i) => {
                  if (line.type === 'header') {
                    return (
                      <tr key={i} className="bg-[#1f6feb15]">
                        <td colSpan={5} className="px-3 py-1 text-[#58a6ff] text-[11px]">
                          {line.left}
                        </td>
                      </tr>
                    )
                  }

                  const bgLeft =
                    line.type === 'remove'
                      ? 'bg-[#da363322]'
                      : line.type === 'context'
                        ? ''
                        : 'bg-[#0d1117]'
                  const bgRight =
                    line.type === 'add'
                      ? 'bg-[#23863622]'
                      : line.type === 'context'
                        ? ''
                        : 'bg-[#0d1117]'
                  const textLeft =
                    line.type === 'remove' ? 'text-[#ffa198]' : 'text-[#adbac7]'
                  const textRight =
                    line.type === 'add' ? 'text-[#7ee787]' : 'text-[#adbac7]'

                  const isHovered = hoveredLine === i

                  return (
                    <tr
                      key={i}
                      className={`hover:brightness-125 ${isHovered ? 'brightness-125' : ''}`}
                      onMouseEnter={() => setHoveredLine(i)}
                      onMouseLeave={() => setHoveredLine(null)}
                    >
                      {/* Left side */}
                      <td className={`w-[1px] select-none text-right pr-2 pl-2 text-[#484f58] ${bgLeft} border-r border-[#30363d]`}>
                        {line.leftNum || ''}
                      </td>
                      <td className={`relative ${bgLeft} ${textLeft} pr-4 pl-3 whitespace-pre border-r border-[#30363d]`}>
                        {line.type === 'remove' && <span className="text-[#f85149] mr-1">-</span>}
                        {line.type === 'context' && <span className="mr-2"> </span>}
                        {line.type !== 'add' && line.left}
                        {isHovered && line.type !== 'add' && (
                          <button className="absolute right-1 top-0 p-0.5 rounded bg-[#1f6feb] text-white opacity-0 group-hover:opacity-100 hover:opacity-100" style={{ opacity: isHovered ? 1 : 0 }}>
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                      {/* Right side */}
                      <td className={`w-[1px] select-none text-right pr-2 pl-2 text-[#484f58] ${bgRight} border-r border-[#30363d]`}>
                        {line.rightNum || ''}
                      </td>
                      <td className={`relative ${bgRight} ${textRight} pr-4 pl-3 whitespace-pre`}>
                        {line.type === 'add' && <span className="text-[#3fb950] mr-1">+</span>}
                        {line.type === 'context' && <span className="mr-2"> </span>}
                        {line.type !== 'remove' && line.right}
                        {isHovered && line.type !== 'remove' && (
                          <button className="absolute right-1 top-0 p-0.5 rounded bg-[#1f6feb] text-white" style={{ opacity: isHovered ? 1 : 0 }}>
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="w-[380px] shrink-0 border-l border-[#30363d] bg-[#0d1117] flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#a371f7]" />
              <span className="text-sm font-medium text-[#e6edf3]">AI Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              <span className="text-[11px] text-[#8b949e]">GPT-4o</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {chatMessages.map((msg, i) => {
              if (msg.role === 'ai' && msg.structured) {
                const s = msg.structured
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#a371f7]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-[#a371f7]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-3">
                          {/* Summary */}
                          <div>
                            <div className="text-[11px] text-[#8b949e] uppercase tracking-wide mb-1 font-medium">Summary</div>
                            <p className="text-xs text-[#adbac7] leading-relaxed">{s.summary}</p>
                          </div>
                          {/* Risk */}
                          <div className="flex items-center gap-2">
                            <div className="text-[11px] text-[#8b949e] uppercase tracking-wide font-medium">Risk</div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/30">
                              <AlertTriangle className="h-3 w-3" />
                              {s.risk}
                            </span>
                          </div>
                          {/* Findings */}
                          <div>
                            <div className="text-[11px] text-[#8b949e] uppercase tracking-wide mb-2 font-medium">Findings</div>
                            <div className="space-y-2">
                              {s.findings.map((f, fi) => (
                                <div
                                  key={fi}
                                  className={`rounded-md p-2.5 border ${
                                    f.type === 'warning'
                                      ? 'bg-[#f0883e]/5 border-[#f0883e]/20'
                                      : 'bg-[#1f6feb]/5 border-[#1f6feb]/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {f.type === 'warning' ? (
                                      <AlertTriangle className="h-3 w-3 text-[#f0883e]" />
                                    ) : (
                                      <Shield className="h-3 w-3 text-[#58a6ff]" />
                                    )}
                                    <span className="text-xs font-medium text-[#e6edf3]">{f.title}</span>
                                  </div>
                                  <p className="text-[11px] text-[#8b949e] leading-relaxed mb-1.5">{f.desc}</p>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#484f58]">
                                    <span>{f.file}</span>
                                    <span>L{f.line}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <button className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#1f6feb15] transition-colors">
                            <Star className="h-3 w-3" />
                            유용함
                          </button>
                          <button className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#3fb950] hover:bg-[#238636]/20 transition-colors">
                            <MessageSquare className="h-3 w-3" />
                            코멘트로 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex items-start gap-2 justify-end">
                    <div className="bg-[#1f6feb] text-white rounded-lg px-3 py-2 max-w-[85%]">
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#30363d] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-[#8b949e]" />
                    </div>
                  </div>
                )
              }

              // AI text message
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#a371f7]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-[#a371f7]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2">
                      <p className="text-xs text-[#adbac7] leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#3fb950] hover:bg-[#238636]/20 transition-colors">
                        <MessageSquare className="h-3 w-3" />
                        코멘트로 추가
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat input */}
          <div className="px-3 py-3 border-t border-[#30363d]">
            <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 focus-within:border-[#58a6ff]">
              <input
                type="text"
                placeholder="AI에게 질문하기..."
                className="flex-1 bg-transparent text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none"
                defaultValue=""
              />
              <button className="p-1 rounded hover:bg-[#30363d] text-[#58a6ff] transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <CheckCircle className="h-3.5 w-3.5 text-[#3fb950]" />
          <span>2 / 8 files reviewed</span>
          <span className="text-[#30363d]">|</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            3 comments
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            Comment
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#da3633] text-sm text-white hover:bg-[#f85149] transition-colors">
            <XCircle className="h-3.5 w-3.5" />
            Request Changes
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#238636] text-sm text-white hover:bg-[#2ea043] transition-colors font-medium">
            <Check className="h-3.5 w-3.5" />
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen: Settings ────────────────────────────────────────────────────────

function SettingsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9]">
      <header className="flex items-center gap-3 px-5 py-3 bg-[#161b22] border-b border-[#30363d]">
        <button
          onClick={() => onNavigate('list')}
          className="p-1.5 rounded hover:bg-[#30363d] text-[#8b949e] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Settings className="h-4 w-4 text-[#8b949e]" />
        <span className="text-sm font-medium text-[#e6edf3]">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
          {/* GHE Auth */}
          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-[#8b949e]" />
              GitHub Enterprise
            </h2>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#e6edf3]">ghe.linecorp.com</div>
                  <div className="text-xs text-[#8b949e]">kim.minjun@linecorp.com</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[#3fb950]" />
                  <span className="text-xs text-[#3fb950] font-medium">Connected</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Personal Access Token</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 h-8 px-3 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-[#484f58] font-mono"
                  />
                  <button className="px-3 h-8 rounded-md bg-[#21262d] border border-[#30363d] text-xs text-[#c9d1d9] hover:bg-[#30363d] transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* LLM Settings */}
          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#a371f7]" />
              LLM Configuration
            </h2>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">API Endpoint</label>
                <input
                  type="text"
                  readOnly
                  value="https://api.openai.com/v1"
                  className="w-full h-8 px-3 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-[#adbac7] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">Model</label>
                <input
                  type="text"
                  readOnly
                  value="gpt-4o-2024-11-20"
                  className="w-full h-8 px-3 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-[#adbac7] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8b949e] mb-1">API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 h-8 px-3 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-[#484f58] font-mono"
                  />
                  <button className="px-3 h-8 rounded-md bg-[#21262d] border border-[#30363d] text-xs text-[#c9d1d9] hover:bg-[#30363d] transition-colors">
                    Update
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
                <span className="text-xs text-[#8b949e]">Model available - latency: 1.2s avg</span>
              </div>
            </div>
          </section>

          {/* Repo Mappings */}
          <section>
            <h2 className="text-sm font-semibold text-[#e6edf3] mb-4 flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-[#8b949e]" />
              Repository Mapping
            </h2>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#30363d]">
                    <th className="text-left px-4 py-2 text-[11px] text-[#8b949e] uppercase tracking-wide font-medium">Repository</th>
                    <th className="text-left px-4 py-2 text-[11px] text-[#8b949e] uppercase tracking-wide font-medium">Local Path</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {repoMappings.map((m, i) => (
                    <tr key={i} className="border-b border-[#30363d] last:border-0">
                      <td className="px-4 py-2.5 text-xs font-mono text-[#adbac7]">{m.repo}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-[#484f58]">{m.localPath}</td>
                      <td className="px-4 py-2.5">
                        <button className="px-2 py-1 rounded text-[11px] text-[#58a6ff] hover:bg-[#1f6feb15] transition-colors">
                          Browse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-[#30363d]">
                <button className="flex items-center gap-1 text-xs text-[#58a6ff] hover:text-[#79c0ff] transition-colors">
                  <Plus className="h-3 w-3" />
                  Add repository mapping
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  const [screen, setScreen] = useState<Screen>('review')

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Back to gallery */}
      <div className="fixed top-2 left-2 z-50">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] text-xs gap-1.5">
            <ArrowLeft className="h-3 w-3" />
            Gallery
          </Button>
        </Link>
      </div>

      {/* Screen selector tabs */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded-lg p-1">
        {(['list', 'review', 'settings'] as Screen[]).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              screen === s
                ? 'bg-[#30363d] text-[#e6edf3]'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            {s === 'list' ? 'PR List' : s === 'review' ? 'Review' : 'Settings'}
          </button>
        ))}
      </div>

      {/* Render active screen */}
      {screen === 'list' && <PRListScreen onNavigate={setScreen} />}
      {screen === 'review' && <ReviewScreen onNavigate={setScreen} />}
      {screen === 'settings' && <SettingsScreen onNavigate={setScreen} />}
    </div>
  )
}
