# Callout Blocks

## Basic callout with icon and color

<callout icon="💡" color="blue">
	This is a blue info callout with an explicit icon attribute.
</callout>

<callout icon="⚠️" color="yellow">
	This is a warning callout.

	It can contain **multiple paragraphs** with inline formatting.
</callout>

<callout icon="🔴" color="red">
	This is a red callout indicating an error or critical notice.
</callout>

## Callout without attributes (emoji extracted from content)

<callout>
	🎉 The leading emoji is extracted as the icon when no explicit icon= attribute is present.
</callout>

<callout>
	📌 Another callout where the emoji becomes the icon automatically.

	The rest of the content follows normally.
</callout>

## Callout with color only (no icon)

<callout color="gray_background">
	This callout uses a gray background color.
</callout>

## Nested callouts

<callout icon="📌" color="gray">
	Outer callout content.
	<callout icon="🔗" color="blue">
		Inner nested callout with its own icon and color.
	</callout>
</callout>

## Triple-nested callouts

<callout icon="1️⃣" color="gray">
	Level 1 content.
	<callout icon="2️⃣" color="blue">
		Level 2 content.
		<callout icon="3️⃣" color="yellow">
			Level 3 (innermost) content.
		</callout>
	</callout>
</callout>

## Callout containing rich content

<callout icon="📝" color="blue">
	A callout can contain any block content:

	- List item 1
	- List item 2
	- List item 3

	And also code:

	```typescript
	const x: number = 42;
	console.log(x);
	```
</callout>
