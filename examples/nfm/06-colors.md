# Color Annotations

Notion allows coloring text at the block level using `{color="..."}` syntax.
The preprocessor converts these to raw HTML elements so the color prop can be passed to heading/paragraph components.

## Colored headings

# Red Heading {color="red"}

## Blue Heading {color="blue"}

### Green Heading {color="green"}

#### Purple Heading {color="purple"}

## Colored paragraphs

This is a normal paragraph without color.

A red paragraph text. {color="red"}

A blue paragraph text. {color="blue"}

A green paragraph with more words to show how the text looks across the line. {color="green"}

A gray paragraph for subtle de-emphasis. {color="gray"}

## Background colors

Text with a yellow background for highlighting. {color="yellow_background"}

Text with a blue background color. {color="blue_background"}

Text with a red background color. {color="red_background"}

Text with a gray background for subtle emphasis. {color="gray_background"}

## All Notion color names

These are all the supported color values:

Default paragraph text (no color annotation).

Red text {color="red"}

Orange text {color="orange"}

Yellow text {color="yellow"}

Green text {color="green"}

Blue text {color="blue"}

Purple text {color="purple"}

Pink text {color="pink"}

Brown text {color="brown"}

Gray text {color="gray"}

Red background {color="red_background"}

Orange background {color="orange_background"}

Yellow background {color="yellow_background"}

Green background {color="green_background"}

Blue background {color="blue_background"}

Purple background {color="purple_background"}

Pink background {color="pink_background"}

Brown background {color="brown_background"}

Gray background {color="gray_background"}

## Mixed: colored section followed by normal content

## Important Notice {color="red"}

This paragraph has no color annotation and should render normally.

### Details below {color="blue"}

More normal content here, uncolored.
