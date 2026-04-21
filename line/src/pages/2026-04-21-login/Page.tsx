import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, Lock, Globe, Apple, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto px-6 py-4 w-full">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>계정에 로그인하여 서비스를 이용하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" placeholder="이메일" className="pl-10" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="비밀번호" className="pl-10" />
              </div>
            </div>
            <Button className="w-full">로그인</Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">또는</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Google로 계속하기
              </Button>
              <Button variant="outline" className="w-full">
                <Apple className="h-4 w-4 mr-2" />
                Apple로 계속하기
              </Button>
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Kakao로 계속하기
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              계정이 없으신가요? <a href="#" className="text-blue-600 hover:underline">회원가입</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
