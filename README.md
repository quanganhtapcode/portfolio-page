# Quang Anh Portfolio

Portfolio website cho Le Quang Anh - Financial Analyst & CFA Candidate.

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Cấu trúc dự án

```
www/
├── src/
│   ├── components/       # React components
│   │   ├── Navigation.jsx
│   │   ├── Hero.jsx
│   │   ├── Skills.jsx
│   │   ├── Projects.jsx
│   │   ├── Experience.jsx
│   │   └── Footer.jsx
│   ├── data/            # Data files
│   │   ├── projects.js
│   │   └── experiences.js
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Tùy chỉnh

- **Thông tin cá nhân**: Chỉnh sửa trong các components
- **Dự án**: Cập nhật `src/data/projects.js`
- **Kinh nghiệm**: Cập nhật `src/data/experiences.js`
- **Màu sắc & styling**: Chỉnh sửa `tailwind.config.js`

## Deploy lên Vercel

### Cách 1: Deploy qua Vercel CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Cách 2: Deploy qua Vercel Dashboard

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com)
3. Import repository
4. Vercel sẽ tự động detect Vite project
5. Click Deploy!

### Cách 3: Deploy trực tiếp từ local

```bash
# Build project
npm run build

# Deploy folder dist
vercel --prod
```

## License

© 2025 Le Quang Anh. All rights reserved.
