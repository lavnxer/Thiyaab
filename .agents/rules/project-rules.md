# Visual & Engineering Architecture Rules

## 1. Design Philosophy & Aesthetic Standards
- Target Aesthetic: Ultra-clean, modern dark-mode minimalist (inspired by Vercel, Linear, Stripe, Raycast).
- Typography Hierarchy: 
  * Headings: Use crisp, modern geometric or neo-grotesque sans-serif fonts (e.g., 'Inter', 'Geist', 'Plus Jakarta Sans').
  * Tracking & Leading: Tighter tracking on large headers (`tracking-tight`), relaxed leading on body paragraphs (`leading-relaxed`).
  * Contrast: Never use pure white (#FFF) on pure black (#000) for large body text. Use `text-neutral-400` or `text-zinc-400` for secondary text and `text-neutral-100` for primary headings.
- Negative Space & Layout: 
  * Prioritize generous, intentional padding (`py-20` to `py-32` for sections).
  * Structure content using asymmetric grids, Bento grid layouts, and cards with subtle borders (`border-white/10` or `border-zinc-800`).
  * Use depth layering: Base background (`zinc-950`), card elevation (`zinc-900/50` with `backdrop-blur-md`), and highlight rings on interactive elements.

## 2. Strict Negative Constraints (Zero-Tolerance)
- NO generic purple-to-blue gradient cards or centered default bootstrap-like containers.
- NO unstyled or generic placeholder cards with centered large circular icons.
- NO raw "Lorem Ipsum" or generic filler text; write concise, contextually accurate, production-grade microcopy.
- NO heavy drop-shadows (e.g., `shadow-2xl` without opacity tuning); use fine-tuned layered glows (`shadow-[0_0_50px_-12px_rgba(255,255,255,0.05)]`).
- NO inline raw styles; everything must follow designated design tokens.

## 3. Engineering & Component Conventions
- STRICT NEXT.JS DIRECTIVE: Any component importing @splinetool/react-spline, three, @react-three/fiber, framer-motion, or interactive browser hooks MUST explicitly declare 'use client'; at Line 1 and use next/dynamic with { ssr: false } for all 3D/WebGL canvases. Never attempt to server-render 3D scenes.
- Framework: Next.js (App Router), TypeScript (Strict Mode enabled).
- Styling & Icons: Tailwind CSS v4, Lucide React icons.
- Component Primitives: Radix UI / Shadcn UI patterns. Do NOT reinvent complex primitives (dialogs, dropdowns, tooltips); compose on top of accessible primitives.
- Motion: Framer Motion for purposeful micro-interactions (staggered list entrance, subtle button scale `whileTap={{ scale: 0.98 }}`, layout transitions). Never add slow, distracting animations.
- Code Modularity: Single Responsibility Principle. Keep components under 150 lines; break sub-elements into atomic files.

# 4. Mandatory Autonomous Execution Protocol (Zero-Prompt Automation)

Whenever assigned to build or refactor any UI section, page, or feature, you MUST strictly execute following this three-phase pipeline autonomously:

### Phase 1: Autonomous Atomic Deconstruction
- NEVER write a complete page or monolithic component directly in a single file.
- Automatically break down the requested UI into Atomic parts:
  1. Atoms: Buttons, badges, input fields, icon wrappers.
  2. Molecules: Combined cards, stat counters, search bars.
  3. Organisms: The complete section (e.g., HeroSection, BentoGrid, PricingTable).
- Create atomic components in separate modular files under `@/components/ui/` or `@/components/atomic/` before assembling.

### Phase 2: Systematic Implementation
- Use exclusively the design tokens defined in `styles/tokens.css` and `tailwind.config.ts`.
- Integrate motion through Framer Motion or Lucide icons natively.
- Enforce strict typing with TypeScript and ensure complete responsive layouts (`sm:`, `md:`, `lg:`, `xl:`).

### Phase 3: Adaptive Verification (Smart Latency Optimization)
1. **Fast-Track Mode (Minor Edits, Styling & Tweaks):**
   - IF the user's task is an iterative change, styling adjustment, color update, text tweak, or single-component refinement:
   - SKIP `npm run build` and SKIP taking Puppeteer screenshots.
   - Simply verify TypeScript syntax in-memory and present the changes immediately.
   - Expected turnaround: Under 5 seconds.

2. **Milestone Verification Mode (New Pages & Major Features):**
   - ONLY run full `npm run build` and capture dual-viewport Puppeteer screenshots (390px & 1440px) when:
     * Building a brand new page or major complex section from scratch.
     * The user explicitly includes keywords like "verify", "audit", "test in browser", or "full check".

# 5. Autonomous Zero-Manual-Code Protocol (STRICT)

- The User is an Executive Product Director and does NOT write code, run terminal commands, or copy-paste files manually.
- The Agent possesses full terminal and file-system execution privileges.
- Autonomous Dependency & Component Provisioning Rule:
  1. Whenever a component, icon, motion, or utility is needed, you MUST autonomously check `@/components/ui/` or `package.json`.
  2. If missing, DO NOT ask the user to install it. Execute the CLI command in the background immediately using non-interactive flags (`-y` / `--yes`).
  3. For Shadcn primitives: Run `npx shadcn@latest add <component_name> -y`.
  4. For Magic UI components: Run `npx shadcn@latest add "https://magicui.design/r/<component_name>" -y`.
  5. For npm packages: Run `npm i <package_name> -y`.
  6. Automatically create and wire any necessary Providers (e.g., SmoothScroll for Lenis, ThemeProvider) in `app/layout.tsx` without user intervention.
- Never respond with: "You should run this command" or "Paste this code in file X". Do it yourself, verify with `npm run build`, and present the working result.

# Project Rules & Zero-Manual-Code Protocol

## Anti-AI-Slop Constraints
- **Aesthetics**: No generic purple gradients. Prioritize sleek, modern, and premium aesthetics.
- **Typography**: Strict typography guidelines using modern sans-serif fonts (e.g., Inter, Roboto, Outfit). Avoid browser defaults.
- **Layout**: Utilize negative space effectively to create breathing room and structure in the layout. Do not clutter the interface.

## Strict Zero-Manual-Code Contract
- **Autonomous Execution**: The Agent MUST autonomously run CLI commands with `-y` (e.g., `npx shadcn@latest add ... -y`).
- **Provisioning**: Components and providers must be provisioned and wired entirely without user intervention. Do not ask the user to run setup commands.
- **No Placeholders**: Never use placeholder code or leave 'TODOs' for the user. Provide complete, working implementations.

## Mandatory 3-Phase Execution Loop
All development tasks MUST follow this strict 3-phase execution loop:
1. **Deconstruct**: Fully analyze the requirements, extract design tokens, and plan the architecture before coding.
2. **Implement**: Execute the plan by writing complete code and wiring all necessary components autonomously.
3. **Verify (Adaptive)**: Apply Adaptive Verification — Fast-Track mode for iterative styling and component tweaks (skip build/screenshots, verify in-memory); Milestone Verification mode (build check & dual-viewport screenshots) only for new pages, major feature implementations, or when explicitly requested.
