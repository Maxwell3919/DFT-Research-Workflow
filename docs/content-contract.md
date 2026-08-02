# Operation content contract

The 35 Markdown files in `src/content/operations/` are the only operation
directory authority.

Each entry contains exactly these frontmatter fields:

- `number`: integer from 0 through 34;
- `title`: the fixed formal English operation title;
- `part`: `common-workflow`, `property-workflows`, or `closing-loop`;
- `slug`: an explicit, stable, number-prefixed route segment;
- `status`: currently `scaffold`.

Numbers are continuous and unique. Slugs are unique and match their filenames.
Part I contains 18 entries, Part II contains 16, and Part III contains only
Operation 34.

The current Markdown bodies remain empty. The shared operation page supplies
the neutral sentence “This chapter has not yet been written.” Detailed
explanations, software instructions, parameters, formulae, examples, results,
validation advice, references, and automation guidance require later,
operation-by-operation review.

All public text is English. Content from Electronic Structure Atlas or other
sources is not copied into this collection.
