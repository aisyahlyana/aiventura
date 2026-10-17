<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Navigation

- Every page header ends with a back control at the top right, using `BackLink` (leaves the page) or `BackScreen` (steps back inside a page's own screens) from `src/components/brand/BackButton.tsx`, so students and teachers always have one obvious way out.
- The cover at `/` precedes the journey map at `/journey`; map-return actions target `/journey` so game navigation does not restart the welcome.
- The journey map's back control always returns to the cover at `/`. The cover's back control appears only with a previous page in the same session (`src/lib/back.ts`); never render a back control that has nowhere to go.
- Welcome animation styles are scoped to the cover and enabled only in the no-preference motion media query, so reduced-motion visitors see the final state immediately.
- The animated cover mascot preserves the supplied brand SVG paths inline, allowing independent flag and eye motion without changing the source artwork.
