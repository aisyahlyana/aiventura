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
- The journey map is the app's entry point, so it shows a back control only when the visitor arrived from another page in the same session (`src/lib/back.ts`); never render a back control that has nowhere to go.
