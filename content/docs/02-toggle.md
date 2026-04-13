---
slug: notro-fixture-toggle
title: "[Fixture] Toggle"
---

# Toggle Blocks

## Basic toggle with plain text

<details>
<summary>Click to expand: plain text content</summary>
	This is the body of the toggle block.

	It can contain multiple paragraphs.
</details>

## Toggle with rich text summary

<details>
<summary>Toggle with **bold** and *italic* in summary</summary>
	Content inside this toggle.
</details>

## Toggle containing a list

<details>
<summary>Toggle with a list inside</summary>
	- First item
	- Second item
	- Third item
		- Nested item A
		- Nested item B
</details>

## Toggle containing a code block

<details>
<summary>Toggle with a code block</summary>
	Here is some code:

	```javascript
	function greet(name) {
	  return `Hello, ${name}!`;
	}

	console.log(greet("World"));
	```
</details>

## Toggle containing a table

<details>
<summary>Toggle with a table</summary>
	| Name    | Type   | Description              |
	|---------|--------|--------------------------|
	| id      | number | Unique identifier        |
	| title   | string | Page title               |
	| public  | bool   | Whether page is public   |
</details>

## Toggle containing another toggle (nested)

<details>
<summary>Outer toggle</summary>
	This is in the outer toggle.

	<details>
	<summary>Inner nested toggle</summary>
		This is inside the nested toggle.
	</details>
</details>

## Toggle containing a callout

<details>
<summary>Toggle with a callout inside</summary>
	<callout icon="💡" color="blue">
		This callout is nested inside a toggle block.
	</callout>
</details>

## Toggle with heading in summary

<details>
<summary>Setup Instructions</summary>
	## Step 1: Install dependencies

	```bash
	pnpm install
	```

	## Step 2: Configure environment

	Copy `.env.example` to `.env` and fill in your credentials.

	## Step 3: Run the dev server

	```bash
	pnpm run dev
	```
</details>
