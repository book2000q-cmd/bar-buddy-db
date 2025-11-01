import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  barcode: z.string()
    .trim()
    .min(1, 'กรุณากรอกบาร์โค้ด')
    .max(50, 'บาร์โค้ดต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[0-9A-Za-z-]+$/, 'บาร์โค้ดต้องประกอบด้วยตัวเลข ตัวอักษร และ - เท่านั้น'),
  name: z.string()
    .trim()
    .min(1, 'กรุณากรอกชื่อสินค้า')
    .max(200, 'ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร'),
  description: z.string()
    .trim()
    .max(1000, 'รายละเอียดต้องไม่เกิน 1000 ตัวอักษร')
    .optional()
    .nullable(),
  price: z.number()
    .min(0, 'ราคาต้องมากกว่าหรือเท่ากับ 0')
    .max(1000000, 'ราคาต้องไม่เกิน 1,000,000'),
  stock_quantity: z.number()
    .int('จำนวนสต็อกต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนสต็อกต้องมากกว่าหรือเท่ากับ 0')
    .max(100000, 'จำนวนสต็อกต้องไม่เกิน 100,000'),
  category: z.string()
    .trim()
    .max(100, 'หมวดหมู่ต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable(),
  image_url: z.string()
    .trim()
    .url('กรุณากรอก URL ที่ถูกต้อง')
    .max(500, 'URL รูปภาพต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .nullable()
    .or(z.literal(''))
});

// Sale item validation schema
export const saleItemSchema = z.object({
  id: z.string().uuid(),
  barcode: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  price: z.number().min(0).max(1000000),
  quantity: z.number().int().min(1).max(1000)
});

// Transaction validation schema
export const transactionSchema = z.object({
  total_amount: z.number().min(0).max(10000000),
  items: z.array(saleItemSchema).min(1, 'ต้องมีสินค้าอย่างน้อย 1 รายการ')
});

export type ProductFormData = z.infer<typeof productSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type TransactionData = z.infer<typeof transactionSchema>;
