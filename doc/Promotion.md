# 📘 Promotion Schema (Percentage Only)

## 4. Promotion

### 4.1 Mô tả
Promotion dùng để giảm giá theo phần trăm (%) cho sách hoặc đơn hàng.  
Áp dụng tự động theo thời gian (event), không sử dụng mã giảm giá.

---

### 4.2 Schema Definition

| Trường           | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|------------------|-------------|----------|----------|------|
| `_id`            | ObjectId    | ✔️       | auto     | ID |
| `name`           | String      | ✔️       | -        | Tên chương trình |
| `description`    | String      | ❌       | -        | Mô tả chi tiết |
| `value`          | Number      | ✔️       | -        | % giảm giá (0–100) |
| `maxDiscount`    | Number      | ❌       | -        | Giảm tối đa |
| `minOrderValue`  | Number      | ❌       | 0        | Giá trị đơn tối thiểu |
| `event`          | String      | ❌       | -        | Tên sự kiện |
| `bookIds`        | ObjectId[]  | ❌       | []       | Áp dụng cho book |
| `usageLimit`     | Number      | ❌       | -        | Tổng lượt dùng |
| `usedCount`      | Number      | ❌       | 0        | Đã dùng |
| `startDate`      | Date        | ✔️       | -        | Bắt đầu |
| `endDate`        | Date        | ✔️       | -        | Kết thúc |
| `status`         | String      | ✔️       | active   | active / inactive |
| `createdAt`      | Date        | ✔️       | auto     | |
| `updatedAt`      | Date        | ✔️       | auto     | |

---

### 4.3 Ví dụ dữ liệu

```json
{
  "name": "Flash Sale 30%",
  "description": "Giảm 30% cho tất cả sách trong khung giờ vàng",
  "value": 30,
  "maxDiscount": 50000,
  "minOrderValue": 100000,
  "event": "flash_sale",
  "bookIds": ["book_01"],
  "startDate": "2026-04-21T10:00:00Z",
  "endDate": "2026-04-21T12:00:00Z",
  "status": "active"
}
```
### 4.4 Quan hệ dữ liệu
#### Promotion-Book
- Loại quan hệ: many-to-many
- Promotion lưu bookIds
- Book không lưu promotion

### 4.5 Indexing
- `status`
- `startDate`, `endDate`
-`bookIds`
### 4.6 Pricing Logic

```js
discount = price * value / 100

if (maxDiscount) {
  discount = Math.min(discount, maxDiscount)
}

finalPrice = Math.max(price - discount, 0)
```
### 4.7 Business Rules
#### 1. Điều kiện áp dụng
- status = active
- startDate ≤ now ≤ endDate
- orderValue ≥ minOrderValue
#### 2. Phạm vi
- Nếu có bookIds → áp dụng theo book
- Không có → global
#### 3. Giá trị hợp lệ
`0 < value ≤ 100`
#### 4. Usage
```js
if (usageLimit && usedCount >= usageLimit) {
  reject
}

```
#### 5. Multiple Promotion
- Không stack
- Chọn giá tốt nhất
`finalPrice = min(allCalculatedPrices)`
#### 6. Sync dữ liệu
Khi promotion thay đổi → update `book.finalPrice`

# 📘 Promotion – Validation Rules (Percentage Only)

## 4. Promotion Validation

### 4.1 Mục tiêu
Đảm bảo dữ liệu khuyến mãi hợp lệ, nhất quán và an toàn khi áp dụng vào Book/Order.

---

## 4.2 Field Validation

### name
- Bắt buộc  
- Kiểu: String  
- Độ dài: 1–255 ký tự  
- Trim khoảng trắng  

---

### description
- Không bắt buộc  
- Kiểu: String  
- Tối đa: 1000 ký tự  
- Trim khoảng trắng  

---

### value (Discount %)
- Bắt buộc  
- Kiểu: Number  

#### Rule:
- `0 < value ≤ 100`  
- Tối đa 2 chữ số thập phân (nếu có)  

---

### maxDiscount
- Không bắt buộc  
- Kiểu: Number  

#### Rule:
- `maxDiscount ≥ 0`  

---

### minOrderValue
- Không bắt buộc  
- Kiểu: Number  
- Mặc định: `0`  

#### Rule:
- `minOrderValue ≥ 0`  

---

### event
- Không bắt buộc  
- Kiểu: String  
- Độ dài ≤ 100 ký tự  

---

### bookIds
- Kiểu: Array<ObjectId>  
- Không trùng lặp  

#### Rule:
- Mỗi `bookId` phải tồn tại  
- Book phải ở trạng thái `active`  

---

### usageLimit
- Không bắt buộc  
- Kiểu: Number  

#### Rule:
- `usageLimit > 0`  

---

### usedCount
- Kiểu: Number  
- Mặc định: `0`  

#### Rule:
- `usedCount ≥ 0`  
- Không được > `usageLimit` (nếu có)  

---

### startDate
- Bắt buộc  
- Kiểu: Date  

---

### endDate
- Bắt buộc  
- Kiểu: Date  

#### Rule:
- `startDate < endDate`  

---

### status
- Bắt buộc  
- Giá trị hợp lệ:
  - `active`
  - `inactive`  

---

## 4.3 Business Validation

### 1. Thời gian hợp lệ
- Không cho phép:
  - `startDate ≥ endDate`  

---

### 2. Discount Logic
- `value` phải hợp lệ (0–100)  
- Nếu có `maxDiscount`:
  - phải ≥ 0  

---

### 3. Scope Validation
- Nếu có `bookIds`:
  - tất cả phải tồn tại  
  - tất cả book phải `active`  

---

### 4. Usage Logic
```js id="promo_val_usage"
if (usageLimit && usedCount > usageLimit) {
  reject
}