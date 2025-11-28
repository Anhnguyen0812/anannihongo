# 🌸 Nihongo Master - Japanese Learning Platform

A beautiful, minimalist Japanese learning web application built with Next.js, featuring a zen-inspired design system.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎨 **Minimalist Zen Design** - Clean, distraction-free interface
- 🌓 **Dark Mode Support** - Comfortable learning in any lighting
- 🎭 **Glassmorphism Effects** - Modern, premium aesthetic
- ⚡ **Micro-Interactions** - Delightful hover and click animations
- 🇯🇵 **Japanese-Optimized Typography** - Noto Sans JP for beautiful characters
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- ♿ **Accessible** - WCAG AA compliant

## 🎨 Design System

Our design system emphasizes:

- **Color Palette**: 
  - Background: `zinc-50` (soft, easy on eyes)
  - Primary: `indigo-600` (trust and focus)
  - Accent: `rose-500` (Japanese flag inspiration)
  
- **Typography**: Noto Sans JP with optimized Japanese character rendering
- **Spacing**: Generous whitespace following zen principles
- **Effects**: Glassmorphism, smooth transitions, micro-animations

For complete design system documentation, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Web-prj
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)

## 📁 Project Structure

```
Web-prj/
├── app/
│   ├── layout.tsx          # Root layout with Noto Sans JP
│   ├── page.tsx            # Home page with design showcase
│   └── globals.css         # Design system & Tailwind config
├── components/             # Reusable components (to be added)
├── lib/                    # Utility functions (to be added)
├── public/                 # Static assets
├── DESIGN_SYSTEM.md        # Complete design system documentation
└── README.md              # This file
```

## 🎯 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Design System Utilities

### Custom CSS Classes

```css
/* Glassmorphism */
.glass              /* Basic glass effect */
.glass-card         /* Glass card with border */

/* Layout */
.zen-container      /* Responsive container with padding */
.zen-section        /* Section with vertical spacing */

/* Components */
.zen-card           /* Card with hover lift effect */
.zen-navbar         /* Sticky navbar with glass effect */
.btn-primary        /* Primary button with animations */
.btn-accent         /* Accent button with animations */

/* Interactions */
.interactive-scale  /* Scale on active */
.interactive-lift   /* Lift on hover */
.interactive-glow   /* Glow shadow on hover */

/* Typography */
.jp-text           /* Optimized for Japanese text */
```

## 🌟 Key Features Implemented

### ✅ Aesthetic Requirements
- [x] Minimalist, clean, zen-style design
- [x] Generous whitespace throughout
- [x] `zinc-50` background for comfortable reading
- [x] `indigo-600` primary color for trust
- [x] `rose-500` accent for Japanese inspiration
- [x] `rounded-xl` and `rounded-2xl` for soft shapes

### ✅ Effects
- [x] Glassmorphism on navbar (`backdrop-blur-md`, `bg-white/70`)
- [x] Button hover with `scale-[0.98]`
- [x] Card hover with `-translate-y-1` and `shadow-lg`
- [x] Smooth transitions (200-300ms)

### ✅ Libraries
- [x] Tailwind CSS configured
- [x] Framer Motion for animations
- [x] Lucide React for icons
- [x] Shadcn UI base setup
- [x] Noto Sans JP font from Google Fonts

## 🎓 Learning Modules (Coming Soon)

- [ ] Hiragana & Katakana lessons
- [ ] Kanji learning with JLPT levels
- [ ] Grammar explanations
- [ ] Vocabulary flashcards
- [ ] Interactive quizzes
- [ ] Progress tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by Japanese zen aesthetics
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)
- UI components by [Shadcn UI](https://ui.shadcn.com/)

---

**Built with ❤️ for Japanese learners worldwide**

日本語を学ぼう！🌸
