# QIZHI Spin React Island Verification

## Scope

- Public `Spin`, `SpinProps`, and `SpinSize` in `@wangxiaojinger/qizhi-react`.
- Five approved legacy demos and structured API documentation.
- Same-source preview, displayed TSX, and clipboard TSX.
- Desktop 1440px, narrow 1024px, and mobile 375px.

## TDD evidence

The initial scoped run failed in four files because `Spin`, its types, the public
package export, and the docs island did not exist. After implementation, the scoped
component/docs/style-ownership gate passed 5 files and 14 tests.

## Browser evidence

The scoped Playwright suite passed 3/3 projects. It verifies:

- exact 20/30/40px indicators and the 30px custom indicator;
- the two-column desktop/narrow and one-column mobile layouts;
- `min(360px, available column width)` inline containers and the 100% block container;
- 144px card minimum height, 0.38 loaded-content opacity, and the 0.62 white overlay;
- loading-to-idle-to-loading interaction, `aria-pressed`, `aria-busy`, and `inert`;
- `0.8s` default rotation and no rotation under reduced motion;
- shared action spacing, displayed/copied source equality, overflow, and console state.
- the shared `qizhi-react-demo-codebox` shell, including mobile action wrapping and
  zero left/right action padding;
- Enter and Space activation from the focused loading toggle.

The loading, idle, tip, custom-icon, and size screenshots were inspected at all three
viewports. Cards, overlays, indicators, copy, and actions remain visible without
clipping; mobile cards stack in the original order and the size indicators remain on
one row.

## Post-audit remediation

The follow-up audit found that Spin copied the visible Demo structure but omitted the
shared React Demo shell class and stylesheet. A regression test first failed against
the missing class in both Vitest and Playwright. The implementation now imports the
shared shell stylesheet and applies `qizhi-react-demo-codebox` to every Spin example.
The common shell also owns the mobile zero-left-padding rule.

The same audit reported keyboard and clipboard concerns. Fresh real-browser checks
showed that the public QIZHI `Button` responds to Enter and Space and that the page
Clipboard API returns the exact displayed TSX. These were verification gaps rather
than runtime defects, so the production interaction and clipboard implementation were
not replaced. Both paths are now locked by automated tests.

Fresh remediation verification passed 301 Vitest files with 1448 tests, all three
Playwright projects, TypeScript checks, the production build, and bundle-boundary
verification.

## Status boundary

- Automated implementation verification: `candidate_pass`.
- Independent final acceptance: `pending`.
