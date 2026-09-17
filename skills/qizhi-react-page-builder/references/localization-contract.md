# Localization contract

Every generated page is bilingual by default. Chinese and English are a runtime capability, not a second page or a prompt-only convention.

## Required output

- Wrap the page with public `LocaleProvider` from `@wangxiaojinger/qizhi-react` and read copy through `useLocale`.
- Include complete `zh-CN` and `en-US` message dictionaries in `src/locales.ts` (or an equivalent page-owned locale module).
- Connect `TopNavigation`'s language selector to the same locale state so one selection updates navigation, component defaults, business copy, ARIA labels, empty states, feedback, and Mock display data together.
- Persist the chosen locale with a stable application storage key and synchronize `document.documentElement.lang`.
- Use locale keys for visible and assistive copy. Do not branch scattered literals throughout TSX; short immutable proper nouns and identifiers may remain shared.
- Use `Intl` or the formatter returned by `useLocale` for dates, numbers, currencies, and units whose presentation differs by locale.
- Preserve the current route and user state when switching language. Do not reload or navigate to a separate English page.
- Treat English as a layout input, not a string replacement pass. Follow [responsive-layout-contract.md](responsive-layout-contract.md) for content-driven widths, wrapping, scrolling, breakpoint, and geometry acceptance criteria.

## Verification

Run the output validator, typecheck, build, and the complete browser matrix in [responsive-layout-contract.md](responsive-layout-contract.md). Exercise language switching, refresh persistence, keyboard access, long-copy wrapping, overflow, and console errors. Report untranslated copy or components without locale support as `capability_gap`.
