# Learnesia Next.js Guide untuk Developer React

Dokumen ini dibuat untuk kamu yang sebelumnya terbiasa dengan React biasa (Vite/CRA), lalu ingin paham bagaimana codebase Learnesia di Next.js (App Router) bekerja end-to-end.

## 1) Mindset shift: dari React SPA ke Next.js App Router

Di React SPA, kamu biasanya berpikir:
- Semua route didefinisikan di satu tempat (mis. React Router config).
- Semua halaman umumnya client-rendered.
- SEO sering perlu kerja tambahan.

Di Next.js App Router, kamu berpikir:
- Route ditentukan oleh struktur folder `src/app`.
- Setiap segmen bisa punya `layout`, `page`, `loading`, `error`, `not-found`, `generateMetadata`, dsb.
- Bisa campur Server Component + Client Component (di project ini mayoritas page masih client component untuk migrasi bertahap).

---

## 2) Struktur routing di Learnesia

### Route groups `(public)` dan `(protected)`

Learnesia memakai route group:
- `src/app/(public)/...` untuk area publik.
- `src/app/admin/(protected)/...` untuk area admin.

Route group membantu pemisahan struktur tanpa mempengaruhi URL.

### Peta route utama

- Public:
  - `/` → landing page
  - `/courses` → library course
  - `/course/[course_slug]` → overview course
  - `/course/[course_slug]/lesson/[lesson_slug]` → halaman lesson
  - `/course/[course_slug]/overview` → overview eksplisit
- Admin:
  - `/admin/login`
  - `/admin/courses`
  - `/admin/courses/[id]`
  - `/admin/create-template`
  - `/admin/templates`
  - `/admin/create-lesson`

Contoh route tree dari App Router:

```1:31:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/course/[course_slug]/layout.jsx
import { PRIVATE_API_BASE_URL } from "@/utils/env";
...
export async function generateMetadata({ params }) {
  ...
}
...
```

```1:24:/home/fachryikhsal/Documents/project/learnesia/frontend/src/middleware.ts
import { NextResponse } from "next/server";
...
export const config = {
  matcher: ["/admin/:path*"],
};
```

---

## 3) Layout hierarchy: global → public/admin → page

Hierarki layout di Learnesia:

1. `src/app/layout.tsx` (global root layout)  
   Mengatur font, metadata global default, provider wrapper, dan toaster.

```21:34:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/layout.tsx
export const metadata = {
  title: "Learnesia",
  description: "Learn anything, anytime",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body ...>
        <Providers>
          <Toaster />
          {children}
```

2. `src/app/(public)/layout.jsx` (public shell)  
   Menentukan kapan navbar tampil/hidden (mis. halaman lesson).

```6:31:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/layout.jsx
export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const isLessonPage = pathname.includes("/lesson/");
  ...
  <div className={isLessonPage ? "hidden md:block" : "block"}>
    <Navbar />
  </div>
```

3. `src/app/admin/(protected)/layout.jsx` (admin shell)  
   Menyediakan sidebar dan frame dashboard admin.

---

## 4) Dynamic routing + params

App Router menggunakan folder `[param]` untuk dynamic route:
- `[course_slug]`
- `[lesson_slug]`
- `[id]`

Di Client Component, param dibaca via `useParams()`:

```20:23:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/course/[course_slug]/page.jsx
const { course_slug } = useParams();
const router = useRouter();
```

Di metadata function (server side context), param didapat dari argumen `generateMetadata({ params })`.

---

## 5) Metadata & SEO di project ini

### Pola yang dipakai

Learnesia saat ini pakai pendekatan “metadata-first SSR”:
- Global metadata di root layout.
- Static metadata untuk route tertentu (`/courses`).
- Dynamic metadata untuk course dan lesson berdasarkan data API.

Contoh dynamic metadata course:

```12:25:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/course/[course_slug]/layout.jsx
export async function generateMetadata({ params }) {
  const { course_slug } = await params;
  const course = await fetchCourse(course_slug);
  ...
  return {
    title: `${course.course_name} — Learnesia`,
    description: course.course_description,
  };
}
```

Contoh static metadata courses:

```1:4:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/courses/layout.jsx
export const metadata = {
  title: "Courses — Learnesia",
  description: "Browse bite-sized microlearning courses curated with AI.",
};
```

Catatan penting:
- Dynamic metadata fetch memakai `next: { revalidate: 60 }`, jadi hasilnya ISR-friendly.
- Ini memberi peningkatan SEO tanpa harus langsung memigrasi semua halaman jadi Server Component.

---

## 6) Client vs Server Component di Learnesia

Saat ini banyak halaman masih `"use client"` karena migrasi dari React dilakukan bertahap.

Contoh:

```1:7:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/(public)/page.jsx
"use client";
...
export default function Home() {
```

Implikasinya:
- Logic interaktif mudah dipindah dari React lama.
- Tapi data fetching utama masih cenderung dari client (via axios service layer).
- SEO tetap dibantu melalui metadata dynamic/static di level layout.

---

## 7) API management: service layer + dual base URL

Semua komunikasi API terpusat di `src/services/api.js` (satu file besar).

### Arsitektur base URL

```10:16:/home/fachryikhsal/Documents/project/learnesia/frontend/src/utils/env.js
/** Browser and client-side requests (host-visible URL). */
export const PUBLIC_API_BASE_URL = getEnv('NEXT_PUBLIC_API_URL', publicApiDefault);

/** Server-side requests (e.g. generateMetadata). Use API_URL in Docker: http://backend:8000/api */
export const PRIVATE_API_BASE_URL = getEnv('API_URL', PUBLIC_API_BASE_URL);
```

Artinya:
- Client/browser request pakai `NEXT_PUBLIC_API_URL`.
- Server-side request (contoh `generateMetadata`) bisa pakai internal service URL (`API_URL`) supaya cocok di Docker network.

### Axios instances + auth interceptor

```13:33:/home/fachryikhsal/Documents/project/learnesia/frontend/src/services/api.js
const publicApi = axios.create({ baseURL: PUBLIC_API_BASE_URL, ... });
const privateApi = axios.create({ baseURL: PRIVATE_API_BASE_URL, ... });

privateApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Auto refresh token saat 401

```36:56:/home/fachryikhsal/Documents/project/learnesia/frontend/src/services/api.js
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    ...
    if (error.response?.status === 401 && !original._retry) {
      ...
      const { data } = await publicApi.post("/token/refresh/", { refresh });
      localStorage.setItem("accessToken", data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return privateApi(original);
    } catch {
      ...
      window.location.assign(`${ADMIN_PATH}/login`);
```

---

## 8) Auth flow: context + cookie mirror + middleware gate

Ini bagian paling penting untuk area admin.

### 8.1 Auth state di React Context

`AuthContext` menyimpan token di localStorage + state React.

```26:48:/home/fachryikhsal/Documents/project/learnesia/frontend/src/contexts/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  ...
  const login = (tokens) => {
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
    setAccessTokenCookie(tokens.access);
    setAccessToken(tokens.access);
  };
```

### 8.2 Kenapa ada cookie juga?

Middleware Next.js hanya bisa baca request (termasuk cookie), bukan localStorage browser.  
Jadi saat login, access token “dicerminkan” ke cookie `accessToken`.

```13:23:/home/fachryikhsal/Documents/project/learnesia/frontend/src/contexts/AuthContext.jsx
const ACCESS_TOKEN_COOKIE = "accessToken";
...
function setAccessTokenCookie(token) {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; Path=/; SameSite=Lax`;
}
```

### 8.3 Middleware proteksi `/admin/*`

```6:20:/home/fachryikhsal/Documents/project/learnesia/frontend/src/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = `${ADMIN_PATH}/login`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
```

### 8.4 Login page obfuscation (secret key query param)

Admin login dicek pakai `sk` query param agar tidak mudah diakses langsung.

```26:31:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/admin/login/page.jsx
useEffect(() => {
  const secretKey = searchParams.get("sk");
  if (secretKey !== ADMIN_SECRET_KEY) {
    router.replace("/");
    return;
  }
  setIsAuthorized(true);
}, [router, searchParams]);
```

---

## 9) Context architecture selain auth

Semua provider dibungkus di root `Providers` component:

```7:12:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/providers.jsx
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <QuizQuestionModalProvider>{children}</QuizQuestionModalProvider>
```

Context aktif saat ini:
- `AuthContext` → login/logout/token state.
- `SidebarContext` → state sidebar admin (mode, active lesson, data).
- `QuizQuestionModalContext` → state modal quiz di admin.

---

## 10) Markdown renderer: bagaimana konten lesson dirender

`MarkdownRenderer` menangani markdown dengan:
- `react-markdown`
- `remark-gfm`
- syntax highlighting
- custom YouTube embed logic

```164:169:/home/fachryikhsal/Documents/project/learnesia/frontend/src/components/admin/MarkdownRenderer.jsx
<Markdown
  remarkPlugins={[remarkGfm, remarkYoutubeParagraph]}
  components={markdownComponents}
>
```

### YouTube link jadi embed

Link YouTube dirender sebagai komponen `YoutubeEmbed` melalui custom renderer `<a>`.

```52:59:/home/fachryikhsal/Documents/project/learnesia/frontend/src/components/admin/MarkdownRenderer.jsx
a: ({ href, children, ...props }) => {
  if (isYoutubeUrl(href)) {
    return <YoutubeEmbed url={href} />;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
```

### Kenapa ada `remarkYoutubeParagraph`?

Untuk menghindari HTML invalid (`div` di dalam `p`) yang bisa memicu hydration error saat embed YouTube muncul.

```8:21:/home/fachryikhsal/Documents/project/learnesia/frontend/src/lib/remarkYoutubeParagraph.js
export function remarkYoutubeParagraph() {
  return (tree) => {
    visit(tree, "paragraph", (node) => {
      const hasYoutube = ...
      if (!hasYoutube) return;
      node.data.hName = "div";
      node.data.hProperties = { ... , className: "mb-4 leading-relaxed" };
```

---

## 11) Rewrites, API proxy, dan path admin custom

`next.config.js` punya dua fungsi penting:
1. Proxy `/api/*` ke backend service.
2. Support custom admin path via env `NEXT_PUBLIC_ADMIN_PATH`.

```12:27:/home/fachryikhsal/Documents/project/learnesia/frontend/next.config.js
async rewrites() {
  const rewrites = [
    { source: "/api/:path*", destination: "http://backend:8000/api/:path*" },
  ];

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "/admin";
  if (adminPath !== "/admin") {
    rewrites.unshift({
      source: `${adminPath}/:path*`,
      destination: "/admin/:path*",
    });
  }
  return rewrites;
}
```

Praktisnya:
- Kamu bisa expose admin di URL lain (obfuscation tambahan), tapi tetap map ke route internal `/admin`.

---

## 12) Error handling dan not-found

Next.js global not found page ada di:

```1:19:/home/fachryikhsal/Documents/project/learnesia/frontend/src/app/not-found.jsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ...">
      <h1 className="text-9xl font-bold ...">404</h1>
      ...
```

Untuk data-level “not found” di page tertentu, pattern yang dipakai saat ini masih UI fallback manual (mis. jika `!course` atau `!lesson`) dibanding memanggil helper `notFound()` dari Next.

---

## 13) Perbedaan praktis untuk developer React lama

Kalau kamu terbiasa React SPA, ini mapping cepatnya:

- `react-router` route config → struktur folder `app/**/page.jsx`.
- `Helmet` / manual title updates → `metadata` / `generateMetadata`.
- Global providers di `main.jsx` → `src/app/providers.jsx` + root `layout.tsx`.
- Protected route wrapper client-only → `middleware.ts` (edge level) + auth context.
- `fetch`/`axios` tersebar → service layer `src/services/api.js`.

---

## 14) Saran belajar bertahap dari codebase ini

Urutan paling aman untuk dipelajari:

1. `src/app/layout.tsx` dan `src/app/providers.jsx`  
2. `src/app/(public)/layout.jsx` + halaman `/courses`  
3. Dynamic route `course/[course_slug]`  
4. Lesson page + `MarkdownRenderer`  
5. `AuthContext`, `middleware.ts`, dan admin login  
6. Baru dalami `services/api.js` (karena cukup panjang)

---

## 15) Catatan teknis penting (khusus Learnesia)

- Project masih dominan `.jsx`, TypeScript aktif via `allowJs`.

```9:38:/home/fachryikhsal/Documents/project/learnesia/frontend/tsconfig.json
"allowJs": true,
...
"include": [
  ...
  "src/**/*.js",
  "src/**/*.jsx"
]
```

- Ada pemisahan `PUBLIC_API_BASE_URL` vs `PRIVATE_API_BASE_URL` untuk kompatibilitas Docker + SSR metadata.
- Strategi migrasi memang sengaja “low-risk dulu” (metadata SEO dulu, refactor server components belakangan).

---

## 16) Ringkasan satu kalimat

Learnesia memakai Next.js App Router dengan pendekatan migrasi bertahap: routing berbasis folder, SEO lewat metadata layout-level, auth admin lewat kombinasi context + cookie mirror + middleware, dan rendering konten lesson lewat markdown pipeline yang sudah di-hardening untuk embed YouTube.
