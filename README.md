# 보컬 레슨 스케줄러

보컬 트레이너를 위한 레슨 관리 시스템

## 기능
- 📅 월간/주간 캘린더 뷰
- 👥 학생 관리 (이름, 연락처, 메모)
- 📝 레슨 기록 및 메모
- 💳 결제 관리 (현금/계좌이체/카드)

## 시작하기

### 1. Supabase 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Settings → API에서 URL과 anon key 복사

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local` 파일에 Supabase 정보 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 로컬 실행
```bash
npm install
npm run dev
```

### 4. Vercel 배포
1. Vercel에서 이 repo 연결
2. Environment Variables에 위 환경변수 추가
3. Deploy!

## 기술 스택
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Vercel
