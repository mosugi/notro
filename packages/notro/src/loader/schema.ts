import { z } from "zod";

// 共通のサブスキーマ定義
const externalSchema = z.object({
  type: z.literal("external"),
  external: z.object({
    url: z.string(),
  }),
});

const fileSchema = z.object({
  type: z.literal("file"),
  file: z.object({
    url: z.string(),
    expiry_time: z.string(),
  }),
});

const emojiSchema = z.object({
  type: z.literal("emoji"),
  emoji: z.string(),
});

// アイコン用のスキーマ（external, file, emoji の3パターンを許容）
const iconSchema = z
  .discriminatedUnion("type", [externalSchema, fileSchema, emojiSchema])
  .nullable();

// カバー用のスキーマ（external, file のみを許容）
const coverSchema = z
  .discriminatedUnion("type", [externalSchema, fileSchema])
  .nullable();

// ブロックオブジェクトの再帰的なスキーマ定義
// 明示的な型アノテーションを追加することでエラーを解消
export const blockObjectSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      object: z.literal("block"),
      id: z.string(),
      created_time: z.string(),
      last_edited_time: z.string(),
      created_by: z.object({
        id: z.string(),
      }),
      last_edited_by: z.object({
        id: z.string(),
      }),
      has_children: z.boolean(),
      archived: z.boolean(),
      // ブロックの種類は文字列として受け付けます
      type: z.string(),
    })
    .extend({
      // 子ブロックは存在する場合のみ定義（再帰的に定義）
      children: z.array(blockObjectSchema),
    })
    .passthrough(),
);

// ページオブジェクトスキーマ
export const pageObjectSchema = z
  .object({
    icon: iconSchema,
    cover: coverSchema,
    archived: z.boolean(),
    in_trash: z.boolean(),
    url: z.string().url(),
    public_url: z.string().url().nullable(),
    properties: z.object({}).catchall(
      z
        .object({
          type: z.string(),
          id: z.string(),
        })
        .passthrough(),
    ),
  })
  .extend({
    // ブロックは配列として定義（任意項目）
    blocks: z.array(blockObjectSchema),
  });
