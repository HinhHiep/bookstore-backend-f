# 📘 Book Schema

##  1. Book

### 1.1 Mô tả
Book là sản phẩm chính trong hệ thống, chứa thông tin cơ bản của sách.  
Các logic như khuyến mãi (promotion) được tách riêng để đảm bảo tính mở rộng.

---

### 1.2  Schema Definition

| Trường          | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|-----------------|-------------|----------|----------|------|
| `_id`           | ObjectId    | ✔️       | auto     | ID sách |
| `title`         | String      | ✔️       | -        | Tên sách |
| `slug`          | String      | ✔️       | auto     | URL thân thiện |
| `description`   | String      | ❌       | -        | Mô tả |
| `price`         | Number      | ✔️       | -        | Giá gốc |
| `finalPrice`    | Number      | ✔️       | = price  | Giá sau khuyến mãi |
| `stock`         | Number      | ✔️       | 0        | Số lượng tồn |
| `sold`          | Number      | ❌       | 0        | Số lượng đã bán |
| `categoryId`    | ObjectId    | ✔️       | -        | Danh mục |
| `thumbnail`     | String      | ❌       | -        | Ảnh đại diện |
| `images`        | String[]    | ❌       | []       | Danh sách ảnh |
| `tags`          | String[]    | ❌       | []       | Từ khoá |
| `ratingAverage` | Number      | ❌       | 0        | Đánh giá trung bình |
| `ratingCount`   | Number      | ❌       | 0        | Số lượt đánh giá |
| `status`        | String      | ✔️       | active   | active / inactive |
| `createdAt`     | Date        | ✔️       | auto     | Thời gian tạo |
| `updatedAt`     | Date        | ✔️       | auto     | Thời gian cập nhật |
---
Specifications
| Trường           | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
|------------------|-------------|----------|----------|------|
| `author`         | String      | ❌       | -        | Tác giả |
| `translator`     | String      | ❌       | -        | Người dịch |
| `publisher`      | String      | ❌       | -        | Nhà xuất bản |
| `publishYear`    | Number      | ❌       | -        | Năm xuất bản |
| `pageCount`      | Number      | ❌       | -        | Số trang |
| `dimensions`     | String      | ❌       | -        | Kích thước (vd: 20.5 x 14.5 cm) |
| `weight`         | Number      | ❌       | -        | Trọng lượng (gram) |
| `format`         | String      | ❌       | -        | Hình thức (bìa mềm / bìa cứng) |
| `language`       | String      | ❌       | -        | Ngôn ngữ |
| `isbn`           | String      | ❌       | -        | Mã ISBN |
| `edition`        | String      | ❌       | -        | Phiên bản / lần tái bản |

---
### 3.4 Ví dụ dữ liệu

```json
{
  "_id": "book_01",
  "title": "Nhà giả kim",
  "slug": "nha-gia-kim",
  "price": 100000,
  "finalPrice": 80000,
  "stock": 100,
  "sold": 20,
  "categoryId": "cat_01",
  "thumbnail": "thumb.jpg",
  "images": ["img1.jpg", "img2.jpg"],
  "tags": ["văn học", "tiểu thuyết"],
  "ratingAverage": 4.5,
  "ratingCount": 120,
  "status": "active",
  "specifications": {
    "author": "Paulo Coelho",
    "translator": "Lê Chu Cầu",
    "publisher": "NXB Văn Học",
    "publishYear": 2024,
    "pageCount": 227,
    "dimensions": "20.5 x 14.5 cm",
    "weight": 350,
    "format": "Bìa mềm",
    "language": "Tiếng Việt",
    "isbn": "9786041234567",
    "edition": "Tái bản lần 2"
  },
  "createdAt": "2026-04-21T10:00:00Z",
  "updatedAt": "2026-04-21T10:00:00Z"
}
```

### 1.3 Quan hệ dữ liệu

#### 1. Book – Category
- **Loại quan hệ:** many-to-one  
- **Mô tả:**  
  - Mỗi book thuộc **1 category**  
  - Một category có **nhiều book**  

- **Triển khai:**  
  - Book lưu `categoryId` (ObjectId → Category)

---

#### 2. Book – Promotion
- **Loại quan hệ:** many-to-many (logical)  
- **Mô tả:**  
  - Một book có thể thuộc **nhiều promotion**  
  - Một promotion có thể áp dụng cho **nhiều book**  

- **Triển khai:**  
  - Không lưu trong Book  
  - Promotion lưu `bookIds` (ObjectId[])  

- **Ghi chú:**  
  - `finalPrice` trong Book được tính từ Promotion  
  - Cần cơ chế sync khi promotion thay đổi  


---

#### 3. Book – Order
- **Loại quan hệ:** many-to-many  
- **Mô tả:**  
  - Một order chứa nhiều book  
  - Một book có thể xuất hiện trong nhiều order  

- **Triển khai:**  
  - Order lưu danh sách items:

```json
{
  "items": [
    {
      "bookId": "ObjectId",
      "quantity": 2,
      "price": 80000
    }
  ]
}
```
- **Ghi chú: **
    - `price` trong order là giá tại thời điểm mua (snapshot)
    - Không phụ thuộc vào `finalPrice` hiện tại
#### 3. Book – Review
- **Loại quan hệ:** one-to-many  
- **Mô tả:**  
  - Một book có nhiều review  

- **Triển khai:**  
  - Review collection lưu `bookId`


# 📘 Book – Validation Rules

## 3. Book Validation

### 3.1 Mục tiêu
Đảm bảo dữ liệu sách hợp lệ, nhất quán và an toàn khi xử lý các logic nghiệp vụ như giá, tồn kho, khuyến mãi và đánh giá.

---

## 3.2 Field Validation

### title
- Bắt buộc  
- Kiểu: String  
- Độ dài: 1–255 ký tự  
- Trim khoảng trắng  

---

### slug
- Bắt buộc  
- Kiểu: String  
- Unique  
- Format:
  - chữ thường (a-z)
  - số (0-9)
  - dấu `-`  
- Auto generate từ `title`  

---

### description
- Không bắt buộc  
- Kiểu: String  
- Tối đa: 5000 ký tự  

---

### price
- Bắt buộc  
- Kiểu: Number  
- Giá trị > 0  

---

### finalPrice
- Kiểu: Number  
- Không nhận từ client (auto)  
- Giá trị ≥ 0  
- Phải ≤ `price`  

---

### stock
- Bắt buộc  
- Kiểu: Number  
- Giá trị ≥ 0  

---

### sold
- Kiểu: Number  
- Giá trị ≥ 0  
- Không được âm  
- Chỉ update từ hệ thống (order)  

---

### categoryId
- Bắt buộc  
- Kiểu: ObjectId  
- Phải tồn tại trong Category  
- Category phải có `status = active`  

---

### thumbnail
- Không bắt buộc  
- Kiểu: String  
- Phải là URL hợp lệ  

---

### images
- Kiểu: Array<String>  
- Mỗi phần tử là URL hợp lệ  
- Không trùng lặp  

---

### tags
- Kiểu: Array<String>  
- Không trùng lặp  
- Tối đa: 20 phần tử  
- Mỗi tag ≤ 50 ký tự  

---

### ratingAverage
- Kiểu: Number  
- Range: 0 → 5  
- Không cho client update  

---

### ratingCount
- Kiểu: Number  
- Giá trị ≥ 0  
- Không cho client update  

---

### status
- Bắt buộc  
- Giá trị hợp lệ:
  - `active`
  - `inactive`

---

## 3.3 Specifications Validation

| Trường        | Rule |
|---------------|------|
| `author`      | String |
| `translator`  | String |
| `publisher`   | String |
| `publishYear` | ≤ năm hiện tại |
| `pageCount`   | ≥ 1 |
| `dimensions`  | String |
| `weight`      | ≥ 0 |
| `format`      | String |
| `language`    | String |
| `isbn`        | 10–13 ký tự |
| `edition`     | String |

---

## 3.4 Business Validation

### 1. Price Logic
- `price > 0`  
- `finalPrice ≤ price`  
- Không cho phép giá âm  

---

### 2. Stock Logic
- Không cho phép:
  - `stock < 0`
  - `sold < 0`  

- Khi tạo order:
  - phải kiểm tra đủ `stock`  

---

### 3. Slug Logic
- Không trùng `slug`  
- Nếu `title` thay đổi → update lại `slug`  

---

### 4. Category Validation
- `categoryId` phải tồn tại  
- Category phải `active`  

---

### 5. Promotion Logic
- Không cho client gửi `finalPrice`  
- `finalPrice` được tính từ Promotion  
- Phải sync khi promotion thay đổi  

---

### 6. Rating Logic
- Không cho client update:
  - `ratingAverage`
  - `ratingCount`  

- Chỉ update thông qua Review system  

---

## 3.5 Validation Flow

1. Validate format:
   - type, required, length  
2. Validate business rules:
   - price, stock, logic  
3. Validate database:
   - category tồn tại  
   - slug unique  
4. Process data:
   - generate slug  
   - tính `finalPrice`  
   - set default values  

---

## 3.6 Error Example

```json id="book_val_err_final"
{
  "status": "error",
  "endpoint": "POST /api/books",
  "message": "Validation Error",
  "details": "Final price must be less than or equal to price"
}