/**
 * Notion Enhanced Markdown → Astro component mapping
 *
 * Pass this object to <Content components={notionComponents} /> to render
 * all Notion Enhanced Markdown block and inline elements with the
 * corresponding Astro components.
 *
 * Reference: https://developers.notion.com/reference/enhanced-markdown
 *
 * How MDX components map works:
 *   - Lowercase element names → native HTML or overridden via this map
 *   - Hyphenated element names (mention-user etc.) → looked up from this map as custom elements
 *   - MDX compiled with evaluate() references _components[name]
 */

// ── Notion-specific blocks ─────────────────────────────────────
import Audio from './Audio.astro';
import Callout from './Callout.astro';
import Column from './Column.astro';
import Columns from './Columns.astro';
import DatabaseRef from './DatabaseRef.astro';
import EmptyBlock from './EmptyBlock.astro';
import FileBlock from './FileBlock.astro';
import Mention from './Mention.astro';
import MentionDate from './MentionDate.astro';
import PageRef from './PageRef.astro';
import PdfBlock from './PdfBlock.astro';
import SyncedBlock from './SyncedBlock.astro';
import TableOfContents from './TableOfContents.astro';
import Video from './Video.astro';

// ── HTML element overrides ─────────────────────────────────────
import H1 from './H1.astro';
import H2 from './H2.astro';
import H3 from './H3.astro';
import H4 from './H4.astro';
import ImageBlock from './ImageBlock.astro';
import Quote from './Quote.astro';
import StyledSpan from './StyledSpan.astro';
import TableBlock from './TableBlock.astro';
import TableCell from './TableCell.astro';
import TableCol from './TableCol.astro';
import TableColgroup from './TableColgroup.astro';
import TableRow from './TableRow.astro';
import Toggle from './Toggle.astro';
import ToggleTitle from './ToggleTitle.astro';

export const notionComponents = {
	// ── Notion-specific blocks ─────────────────────────────────

	/** Callout block with colored background and icon */
	callout: Callout,

	/** Collapsible toggle block (overrides details element) */
	details: Toggle,
	/** Toggle title (overrides summary element) */
	summary: ToggleTitle,

	/** Multi-column layout */
	columns: Columns,
	column: Column,

	/** Media blocks */
	audio: Audio,
	video: Video,
	file: FileBlock,
	pdf: PdfBlock,

	/** Page and database reference blocks */
	page: PageRef,
	database: DatabaseRef,

	/** Table of contents block */
	table_of_contents: TableOfContents,

	/** Synced block */
	synced_block: SyncedBlock,
	synced_block_reference: SyncedBlock,

	/** Explicit empty line (plain empty lines are stripped, so a dedicated tag is needed) */
	'empty-block': EmptyBlock,

	// ── Inline mentions ────────────────────────────────────────
	/** Mentions of @user / page / database / data source / agent */
	'mention-user': Mention,
	'mention-page': Mention,
	'mention-database': Mention,
	'mention-data-source': Mention,
	'mention-agent': Mention,
	/** Date mention */
	'mention-date': MentionDate,

	// ── Standard HTML element overrides ───────────────────────

	/** Headings with color attribute support */
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,

	/** Blockquote (> syntax) */
	blockquote: Quote,

	/** Inline style (supports color / underline attributes) */
	span: StyledSpan,

	/** Image block (![alt](url) syntax) */
	img: ImageBlock,

	/** Table with fit-page-width / header-row / header-column attribute support */
	table: TableBlock,
	colgroup: TableColgroup,
	col: TableCol,
	/** Rows and cells with color attribute for background color */
	tr: TableRow,
	td: TableCell,
} as const;

export type NotionComponents = typeof notionComponents;
