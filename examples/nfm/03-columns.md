# Column Layouts

## Two-column layout

<columns>
<column>
	## Left Column

	This is content in the left column.

	- Item A
	- Item B
	- Item C
</column>
<column>
	## Right Column

	This is content in the right column.

	Some paragraph text that demonstrates that each column is independent.
</column>
</columns>

## Three-column layout

<columns>
<column>
	### Column 1

	First column content.
</column>
<column>
	### Column 2

	Second column content.
</column>
<column>
	### Column 3

	Third column content.
</column>
</columns>

## Columns with rich content

<columns>
<column>
	## Code Example

	```typescript
	interface User {
	  id: number;
	  name: string;
	  email: string;
	}
	```
</column>
<column>
	## Notes

	- The `id` field is auto-generated
	- The `name` field is required
	- The `email` field must be unique

	<callout icon="💡" color="blue">
		Use TypeScript for better type safety.
	</callout>
</column>
</columns>

## Columns with table

<columns>
<column>
	## Frontend Stack

	| Technology | Version |
	|------------|---------|
	| Astro      | 6.x     |
	| TailwindCSS| 4.x     |
	| TypeScript | 5.x     |
</column>
<column>
	## Backend Stack

	| Technology | Version |
	|------------|---------|
	| Node.js    | 24.x    |
	| pnpm       | 10.x    |
	| Notion API | 2026-03 |
</column>
</columns>

Text after columns should render as a normal paragraph.
