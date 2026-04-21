import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Upload,
  Play,
  ChevronDown,
  ChevronUp,
  FileJson,
  User,
  MapPin,
  DollarSign,
  Heart,
  Tag,
  Clock,
  Plane,
  Users,
  Check,
  BarChart3,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Types ──

type TabType = 'prompts' | 'results'

interface Trait {
  id: string
  label: string
  icon: React.ReactNode
}

interface HitRecord {
  rank: number
  score: number
  label: 'TP' | 'FP' | 'FN' | 'TN' | 'ERR'
  confidence: number
  preview: string
  fmResponse: string
  transcript: { sender: string; text: string; isTarget: boolean }[]
}

// ── Data ──

const traits: Trait[] = [
  { id: 'age', label: '나이', icon: <User className="h-4 w-4" /> },
  { id: 'gender', label: '성별', icon: <Users className="h-4 w-4" /> },
  { id: 'income', label: '수입', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'residence', label: '거주지역', icon: <MapPin className="h-4 w-4" /> },
  { id: 'interest', label: '관심사', icon: <Heart className="h-4 w-4" /> },
  { id: 'priceSensitivity', label: '가격민감도', icon: <Tag className="h-4 w-4" /> },
  { id: 'activityTime', label: '활동시간', icon: <Clock className="h-4 w-4" /> },
  { id: 'travel', label: '여행', icon: <Plane className="h-4 w-4" /> },
]

const perHitInstructions: Record<string, string> = {
  age: `임무: 아래 대화에서 "{targetUser}"의 나이를 파악하세요.

단서 O:
- 직접 언급: "나 99년생인데", "올해 서른인데"
- 간접 추론: 학번, 동기 언급 ("13학번이라"), 세대 언급

단서 X:
- 다른 사람의 나이를 targetUser에 귀속하지 마세요
- "형", "누나" 호칭만으로는 나이 판단 불가

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄:
  파악된 성향: 20대 후반 (99년생)
  근거 발화: "나 99년생인데 벌써 서른 가까워"`,

  gender: `임무: 아래 대화에서 "{targetUser}"의 성별을 파악하세요.

단서 O:
- 직접 언급: "남자로서", "여자인 내가"
- 간접 추론: 군대 경험 ("전역하고"), 연인 관계어 ("여자친구가")

단서 X:
- 이름만으로 성별 추정 금지
- 다른 사람의 성별 정보를 targetUser에 귀속 금지

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄:
  파악된 성향: 남성
  근거 발화: "군대 있을 때 진짜 힘들었어"`,

  income: `임무: 아래 대화에서 "{targetUser}"의 수입 수준을 파악하세요.

단서 O:
- 금액 직접 언급: "연봉 5천인데", "월급 받으면"
- 생활 수준 암시: "대출 갚느라", "저축을 좀 해야"

단서 X:
- 다른 사람의 수입/재산을 targetUser에 귀속 금지
- 단순 물건 가격 언급은 수입 단서가 아님

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,

  residence: `임무: 아래 대화에서 "{targetUser}"의 거주지역을 파악하세요.

단서 O:
- 직접 언급: "우리 동네가", "출퇴근이 1시간"
- 간접 추론: "역 근처", "이사 준비 중", 특정 지역 생활권 언급

단서 X:
- 여행/출장 방문지를 거주지로 판단 금지
- 다른 사람의 거주지를 targetUser에 귀속 금지

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,

  interest: `임무: 아래 대화에서 "{targetUser}"의 관심사/취미를 파악하세요.

단서 O:
- 반복 언급되는 활동: "요즘 등산 다니는데", "게임 한판 하자"
- 열정적 표현: "진짜 좋더라", "빠져있어"

단서 X:
- 일회성 언급은 관심사로 보기 어려움
- 다른 사람의 취미를 targetUser에 귀속 금지

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,

  priceSensitivity: `임무: 아래 대화에서 "{targetUser}"의 가격민감도를 파악하세요.

단서 O:
- 가격 반응: "좀 비싸다", "가성비 좋은 거 없나"
- 할인/중고: "세일 때 사야지", "중고나라에서"

단서 X:
- 단순 가격 정보 공유는 민감도가 아님
- 다른 사람의 소비 패턴을 targetUser에 귀속 금지

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,

  activityTime: `임무: 아래 대화에서 "{targetUser}"의 활동시간 패턴을 파악하세요.

단서 O:
- 직접 언급: "어제 새벽 3시에 잤어", "아침 6시에 일어남"
- 습관 패턴: "항상 늦게 자", "아침형 인간이라"

단서 X:
- 업무상 야근은 개인 활동 패턴과 다름
- 일회성 늦잠/이른 기상은 패턴이 아님

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,

  travel: `임무: 아래 대화에서 "{targetUser}"의 여행 선호를 파악하세요.

단서 O:
- 여행 경험: "지난달 오사카 갔는데", "제주도 좋더라"
- 여행 계획: "다음 달 방콕 갈까", "비행기 끊었어"

단서 X:
- 출장/업무 이동은 여행 선호가 아님
- 다른 사람의 여행을 targetUser에 귀속 금지

출력 규칙:
- 없으면 "없음" 한 단어
- 있으면 두 줄`,
}

const sessionAInstructions: Record<string, string> = {
  age: `당신은 유저 성향 분석 전문가입니다.

아래에 여러 대화 분석 결과가 전달됩니다. 각 결과는:
  파악된 성향 / 근거 발화
형식입니다.

이미 필터된 signal만 전달되므로, 이 결과들을 종합하여
"{targetUser}"의 나이에 대한 최종 결론을 내려주세요.

종합 방법:
- 직접 언급(년생, 나이)이 있으면 최우선
- 간접 단서(학번, 세대)는 보조
- 모순되는 정보가 있으면 다수결 + 직접 언급 우선

출력:
trait: 종합 결론 한 문장
reason: 근거 요약 한두 문장`,

  gender: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 성별을 판단하세요.

종합 방법:
- 직접 언급 > 간접 추론 > 관계어 추론
- 군대 경험은 남성의 강한 근거
- 모순 시 직접 언급 우선

출력:
trait: 종합 결론
reason: 근거 요약`,

  income: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 수입 수준을 판단하세요.

종합 방법:
- 구체적 금액 언급 > 생활 수준 암시
- 모순 시 최신 발화 우선

출력:
trait: 종합 결론
reason: 근거 요약`,

  residence: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 거주지역을 판단하세요.

종합 방법:
- "우리 동네", "집 근처" 표현 > 단순 지역 언급
- 출퇴근 경로에서 거주지 추론 가능

출력:
trait: 종합 결론
reason: 근거 요약`,

  interest: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 관심사를 판단하세요.

종합 방법:
- 반복 언급 > 일회성 언급
- 열정적 표현("빠져있어", "요즘 계속")은 가중치

출력:
trait: 종합 결론
reason: 근거 요약`,

  priceSensitivity: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 가격민감도를 판단하세요.

종합 방법:
- 할인/중고/가성비 언급 빈도
- 기준 금액이 있으면 추출

출력:
trait: 종합 결론
reason: 근거 요약`,

  activityTime: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 활동시간 패턴을 판단하세요.

종합 방법:
- 반복 패턴 > 일회성 언급
- 업무 vs 개인 구분

출력:
trait: 종합 결론
reason: 근거 요약`,

  travel: `당신은 유저 성향 분석 전문가입니다.

전달된 분석 결과를 종합하여 "{targetUser}"의 여행 선호를 판단하세요.

종합 방법:
- 여행 빈도, 선호 지역, 여행 스타일 종합
- 출장 제외

출력:
trait: 종합 결론
reason: 근거 요약`,
}

const sampleHits: HitRecord[] = [
  {
    rank: 1,
    score: 0.891,
    label: 'TP',
    confidence: 85,
    preview: '나 99년생인데 벌써 서른 가까워',
    fmResponse: '파악된 성향: 20대 후반 (99년생)\n근거 발화: "나 99년생인데 벌써 서른 가까워"',
    transcript: [
      { sender: '코니', text: '요즘 체력이 예전 같지 않아', isTarget: false },
      { sender: '브라운', text: '나 99년생인데 벌써 서른 가까워', isTarget: true },
      { sender: '코니', text: '진짜? 동갑인 줄 알았어', isTarget: false },
      { sender: '브라운', text: '아니 나 한 살 어려 ㅋㅋ', isTarget: true },
      { sender: '코니', text: '아 그렇구나 난 98이라', isTarget: false },
    ],
  },
  {
    rank: 2,
    score: 0.873,
    label: 'TP',
    confidence: 72,
    preview: '13학번이라 이제 졸업한 지 오래됐어',
    fmResponse: '파악된 성향: 30대 초반 (13학번)\n근거 발화: "13학번이라 이제 졸업한 지 오래됐어"',
    transcript: [
      { sender: '제임스', text: '대학 때가 그립다', isTarget: false },
      { sender: '브라운', text: '13학번이라 이제 졸업한 지 오래됐어', isTarget: true },
      { sender: '제임스', text: '벌써 10년 넘었네', isTarget: false },
      { sender: '브라운', text: '시간 진짜 빠르다', isTarget: true },
    ],
  },
  {
    rank: 3,
    score: 0.856,
    label: 'FP',
    confidence: 41,
    preview: '점심 다녀옵니다',
    fmResponse: '없음',
    transcript: [
      { sender: '브라운', text: '점심 다녀옵니다', isTarget: true },
      { sender: '샐리', text: '맛있는 거 먹어!', isTarget: false },
      { sender: '브라운', text: 'ㅋㅋ 회사 근처 김밥이야', isTarget: true },
    ],
  },
  {
    rank: 4,
    score: 0.842,
    label: 'TN',
    confidence: 12,
    preview: '회의 끝나면 연락할게',
    fmResponse: '없음',
    transcript: [
      { sender: '레너드', text: '오후에 시간 돼?', isTarget: false },
      { sender: '브라운', text: '회의 끝나면 연락할게', isTarget: true },
      { sender: '레너드', text: '오키', isTarget: false },
    ],
  },
  {
    rank: 5,
    score: 0.831,
    label: 'TP',
    confidence: 68,
    preview: '우리 또래는 다 비슷하지 않나',
    fmResponse: '파악된 성향: 20대 후반~30대 초반\n근거 발화: "우리 또래는 다 비슷하지 않나"',
    transcript: [
      { sender: '코니', text: '요즘 결혼 압박 받아?', isTarget: false },
      { sender: '브라운', text: '우리 또래는 다 비슷하지 않나', isTarget: true },
      { sender: '코니', text: '그니까 ㅋㅋ 부모님이 계속', isTarget: false },
    ],
  },
  {
    rank: 6,
    score: 0.819,
    label: 'FN',
    confidence: 22,
    preview: '동기들이랑 10년 만에 모였는데',
    fmResponse: '없음',
    transcript: [
      { sender: '브라운', text: '동기들이랑 10년 만에 모였는데', isTarget: true },
      { sender: '브라운', text: '다들 많이 변했더라', isTarget: true },
      { sender: '제임스', text: '대학 동기?', isTarget: false },
      { sender: '브라운', text: 'ㅇㅇ 신입생 때 같이 놀던 애들', isTarget: true },
    ],
  },
  {
    rank: 7,
    score: 0.807,
    label: 'TN',
    confidence: 5,
    preview: '오늘 날씨 진짜 좋다',
    fmResponse: '없음',
    transcript: [
      { sender: '샐리', text: '밖에 나가고 싶다', isTarget: false },
      { sender: '브라운', text: '오늘 날씨 진짜 좋다', isTarget: true },
    ],
  },
  {
    rank: 8,
    score: 0.798,
    label: 'TN',
    confidence: 3,
    preview: '택배 왔나 확인해봐야지',
    fmResponse: '없음',
    transcript: [
      { sender: '브라운', text: '택배 왔나 확인해봐야지', isTarget: true },
      { sender: '코니', text: '뭐 시켰어?', isTarget: false },
      { sender: '브라운', text: '충전기 하나', isTarget: true },
    ],
  },
]

const sampleFiles = [
  { name: 'alltraits_summary_0421.json', size: '2.4 MB' },
  { name: 'alltraits_window_0420.json', size: '1.8 MB' },
  { name: 'alltraits_message_0419.json', size: '1.2 MB' },
]

const labelColors: Record<string, { bg: string; text: string; border: string }> = {
  TP: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  FP: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  FN: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
  TN: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/40' },
  ERR: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
}

// ── Components ──

function LabelBadge({ label, small }: { label: string; small?: boolean }) {
  const c = labelColors[label] || labelColors.ERR
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold border rounded ${c.bg} ${c.text} ${c.border} ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
    >
      {label}
    </span>
  )
}

// ── Tab: Prompts ──

function PromptsTab() {
  const [activeTrait, setActiveTrait] = useState('age')
  const [model, setModel] = useState('gemma4:e4b')
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [perHitText, setPerHitText] = useState(perHitInstructions)
  const [sessionAText, setSessionAText] = useState(sessionAInstructions)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-[#16213e] flex flex-col">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Traits
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {traits.map((trait) => (
            <button
              key={trait.id}
              onClick={() => setActiveTrait(trait.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                activeTrait === trait.id
                  ? 'bg-white/[0.06] text-white border-l-2 border-[#e94560]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border-l-2 border-transparent'
              }`}
            >
              {trait.icon}
              <span>{trait.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0f0f1a]">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">
              {traits.find((t) => t.id === activeTrait)?.label}
            </span>
            <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
              {activeTrait}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/[0.06] border border-white/[0.1] rounded-md text-slate-300 hover:bg-white/[0.1] transition-colors"
              >
                <span className="font-mono text-xs">{model}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {showModelMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a2e] border border-white/[0.1] rounded-md shadow-xl z-50 overflow-hidden">
                  {['gemma4:e4b', 'gemma4:e2b', 'gemma4:e1b', 'FM (on-device)'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setModel(m)
                        setShowModelMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
                        model === m
                          ? 'bg-[#6366f1]/20 text-[#6366f1]'
                          : 'text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      {m}
                      {model === m && <Check className="h-3 w-3 inline ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSave}
              className="bg-[#6366f1] hover:bg-[#5558e6] text-white text-sm px-4 h-8"
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editors */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Per-Hit Instruction */}
          <div className="flex-1 flex flex-col overflow-hidden border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-5 py-2 bg-white/[0.02]">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Per-Hit Instruction
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {perHitText[activeTrait]?.length || 0} chars
              </span>
            </div>
            <div className="flex-1 overflow-hidden px-3 pb-2">
              <textarea
                value={perHitText[activeTrait] || ''}
                onChange={(e) =>
                  setPerHitText({ ...perHitText, [activeTrait]: e.target.value })
                }
                className="w-full h-full resize-none bg-[#111827] text-slate-300 text-[13px] leading-relaxed font-mono p-4 rounded-lg border border-white/[0.06] focus:border-[#6366f1]/50 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30 placeholder-slate-600"
                placeholder="Per-hit instruction..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Session A Instruction */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2 bg-white/[0.02]">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Session A Instruction
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {sessionAText[activeTrait]?.length || 0} chars
              </span>
            </div>
            <div className="flex-1 overflow-hidden px-3 pb-3">
              <textarea
                value={sessionAText[activeTrait] || ''}
                onChange={(e) =>
                  setSessionAText({ ...sessionAText, [activeTrait]: e.target.value })
                }
                className="w-full h-full resize-none bg-[#111827] text-slate-300 text-[13px] leading-relaxed font-mono p-4 rounded-lg border border-white/[0.06] focus:border-[#6366f1]/50 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30 placeholder-slate-600"
                placeholder="Session A instruction..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Results ──

function ResultsTab() {
  const [activeCategory, setActiveCategory] = useState('age')
  const [selectedHit, setSelectedHit] = useState<HitRecord>(sampleHits[0])
  const [hitLabels, setHitLabels] = useState<Record<number, string>>(
    Object.fromEntries(sampleHits.map((h) => [h.rank, h.label]))
  )
  const [reportExpanded, setReportExpanded] = useState(false)
  const [activeFile, setActiveFile] = useState(0)

  const categories = traits.map((t) => t.id)

  const stats = {
    TP: Object.values(hitLabels).filter((l) => l === 'TP').length,
    FP: Object.values(hitLabels).filter((l) => l === 'FP').length,
    FN: Object.values(hitLabels).filter((l) => l === 'FN').length,
    TN: Object.values(hitLabels).filter((l) => l === 'TN').length,
  }
  const precision =
    stats.TP + stats.FP > 0
      ? Math.round((stats.TP / (stats.TP + stats.FP)) * 100)
      : 0
  const recall =
    stats.TP + stats.FN > 0
      ? Math.round((stats.TP / (stats.TP + stats.FN)) * 100)
      : 0

  const handleLabelChange = (rank: number, label: string) => {
    setHitLabels({ ...hitLabels, [rank]: label })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[220px] flex-shrink-0 border-r border-white/[0.06] bg-[#16213e] flex flex-col">
        <div className="p-3 space-y-2 border-b border-white/[0.06]">
          <Button className="w-full bg-[#e94560] hover:bg-[#d13550] text-white text-sm h-9">
            <Upload className="h-3.5 w-3.5 mr-2" />
            Import JSON
          </Button>
          <Button className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white text-sm h-9">
            <Play className="h-3.5 w-3.5 mr-2" />
            Run Analysis
          </Button>
        </div>
        <div className="px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Files
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-1">
          {sampleFiles.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-md transition-colors mb-0.5 ${
                activeFile === idx
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileJson className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                <div className="min-w-0">
                  <div className="text-xs font-mono truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-600">{file.size}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Panel - Hit List */}
      <div className="w-[280px] flex-shrink-0 border-r border-white/[0.06] bg-[#0d0d18] flex flex-col overflow-hidden">
        {/* Category Pills */}
        <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] hover:text-slate-300'
                }`}
              >
                {traits.find((t) => t.id === cat)?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 font-mono">TP:{stats.TP}</span>
            <span className="text-red-400 font-mono">FP:{stats.FP}</span>
            <span className="text-amber-400 font-mono">FN:{stats.FN}</span>
            <span className="text-slate-500 font-mono">TN:{stats.TN}</span>
            <span className="text-slate-600 mx-1">|</span>
            <span className="text-slate-300 font-mono">P:{precision}%</span>
            <span className="text-slate-300 font-mono">R:{recall}%</span>
          </div>
        </div>

        {/* Hit List */}
        <div className="flex-1 overflow-y-auto">
          {sampleHits.map((hit) => (
            <button
              key={hit.rank}
              onClick={() => setSelectedHit(hit)}
              className={`w-full text-left px-3 py-2.5 border-b border-white/[0.04] transition-colors ${
                selectedHit.rank === hit.rank
                  ? 'bg-white/[0.08]'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-600">#{hit.rank}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {hit.score.toFixed(3)}
                </span>
                <div className="ml-auto">
                  <LabelBadge label={hitLabels[hit.rank] || hit.label} small />
                </div>
              </div>
              <p className="text-xs text-slate-300 truncate">{hit.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Detail + Report */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0f0f1a]">
        {/* Detail Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-bold text-white">#{selectedHit.rank}</span>
              <span className="font-mono text-sm text-slate-400">
                score: {selectedHit.score.toFixed(4)}
              </span>
              <span className="font-mono text-sm text-slate-500">
                conf: {selectedHit.confidence}
              </span>
              <div className="ml-auto">
                <LabelBadge label={hitLabels[selectedHit.rank] || selectedHit.label} />
              </div>
            </div>

            {/* Label Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider mr-1">
                Label:
              </span>
              {(['TP', 'FP', 'FN', 'TN', 'ERR'] as const).map((label) => {
                const active = (hitLabels[selectedHit.rank] || selectedHit.label) === label
                const c = labelColors[label]
                return (
                  <button
                    key={label}
                    onClick={() => handleLabelChange(selectedHit.rank, label)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded border transition-all ${
                      active
                        ? `${c.bg} ${c.text} ${c.border}`
                        : 'bg-transparent text-slate-600 border-white/[0.06] hover:border-white/[0.15] hover:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* FM Response */}
          <div className="px-5 py-3">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">
              FM Response
            </div>
            <div className="bg-[#111827] rounded-lg border border-white/[0.06] p-4">
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {selectedHit.fmResponse}
              </pre>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="px-5 py-3 pb-6">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-3">
              Conversation Transcript
            </div>
            <div className="space-y-2.5">
              {selectedHit.transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isTarget ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${msg.isTarget ? 'order-1' : ''}`}>
                    <div
                      className={`text-[10px] mb-0.5 ${
                        msg.isTarget ? 'text-right text-[#e94560]' : 'text-slate-500'
                      }`}
                    >
                      {msg.sender}
                      {msg.isTarget && (
                        <span className="ml-1 text-[9px] text-[#e94560]/60">TARGET</span>
                      )}
                    </div>
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.isTarget
                          ? 'bg-[#6366f1]/20 text-slate-200 rounded-tr-sm'
                          : 'bg-white/[0.06] text-slate-300 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Report Panel */}
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setReportExpanded(!reportExpanded)}
            className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Report
              </span>
            </div>
            {reportExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
            )}
          </button>
          {reportExpanded && (
            <div className="px-5 pb-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2 text-slate-500 font-medium">Category</th>
                    <th className="text-center py-2 text-emerald-400/70 font-medium">TP</th>
                    <th className="text-center py-2 text-red-400/70 font-medium">FP</th>
                    <th className="text-center py-2 text-amber-400/70 font-medium">FN</th>
                    <th className="text-center py-2 text-slate-500 font-medium">TN</th>
                    <th className="text-center py-2 text-slate-400 font-medium">P</th>
                    <th className="text-center py-2 text-slate-400 font-medium">R</th>
                    <th className="text-center py-2 text-slate-400 font-medium">F1</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {[
                    { cat: '나이', tp: 3, fp: 1, fn: 1, tn: 15 },
                    { cat: '성별', tp: 4, fp: 0, fn: 1, tn: 15 },
                    { cat: '수입', tp: 2, fp: 2, fn: 2, tn: 14 },
                    { cat: '거주지역', tp: 1, fp: 3, fn: 1, tn: 15 },
                    { cat: '관심사', tp: 5, fp: 1, fn: 2, tn: 12 },
                    { cat: '가격민감도', tp: 3, fp: 1, fn: 3, tn: 13 },
                    { cat: '활동시간', tp: 2, fp: 2, fn: 2, tn: 14 },
                    { cat: '여행', tp: 4, fp: 1, fn: 1, tn: 14 },
                  ].map((row) => {
                    const p =
                      row.tp + row.fp > 0
                        ? Math.round((row.tp / (row.tp + row.fp)) * 100)
                        : 0
                    const r =
                      row.tp + row.fn > 0
                        ? Math.round((row.tp / (row.tp + row.fn)) * 100)
                        : 0
                    const f1 = p + r > 0 ? Math.round((2 * p * r) / (p + r)) : 0
                    return (
                      <tr
                        key={row.cat}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                      >
                        <td className="py-1.5 text-slate-300 font-sans">{row.cat}</td>
                        <td className="text-center py-1.5 text-emerald-400">{row.tp}</td>
                        <td className="text-center py-1.5 text-red-400">{row.fp}</td>
                        <td className="text-center py-1.5 text-amber-400">{row.fn}</td>
                        <td className="text-center py-1.5 text-slate-500">{row.tn}</td>
                        <td className="text-center py-1.5 text-slate-300">{p}%</td>
                        <td className="text-center py-1.5 text-slate-300">{r}%</td>
                        <td className="text-center py-1.5 text-slate-300">{f1}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('prompts')

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0a0a16] flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/[0.06] h-7 px-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/[0.1]" />
          <span className="text-sm font-semibold text-white tracking-tight">
            Gemma Prompt Lab
          </span>
        </div>
        <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'prompts'
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Prompts
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'results'
                ? 'bg-[#6366f1] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Results
          </button>
        </div>
        <div className="w-[100px]" />
      </div>

      {/* Tab Content */}
      {activeTab === 'prompts' ? <PromptsTab /> : <ResultsTab />}
    </div>
  )
}
