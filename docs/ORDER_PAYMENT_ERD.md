# ERD - Chức Năng Đặt Hàng & Thanh Toán

## Các Bảng Cần Thiết

### 1. **users** - Thông tin người dùng (CÓ)
- `_id` (ObjectId) - Primary Key
- `email` (string) - Email người dùng
- `password` (string) - Mật khẩu (hashed)
- `name` (string) - Tên người dùng
- `phone` (string) - Số điện thoại
- `address` (string) - Địa chỉ giao hàng
- `role` (string) - admin | user
- `createdAt` (Date)
- `updatedAt` (Date)

**Lý do:** Cần để lưu thông tin khách hàng, địa chỉ giao hàng, liên hệ

---

### 2. **products** - Danh sách sản phẩm (CÓ)
- `_id` (ObjectId) - Primary Key
- `id` (string) - Custom ID (prod_001)
- `name` (string) - Tên sản phẩm
- `price` (number) - Giá sản phẩm
- `colors` (array) - Danh sách màu
- `sizes` (array) - Danh sách kích cỡ
- `stock` (number) - Số lượng tồn kho
- `image` (string) - Hình ảnh
- `description` (string)
- `createdAt` (Date)
- `updatedAt` (Date)

**Lý do:** Cần để tham chiếu khi tạo order, lấy giá, tên sản phẩm

---

### 3. **carts** - Giỏ hàng (CÓ - Tùy chọn)
- `_id` (ObjectId) - Primary Key
- `userId` (ObjectId) - Foreign Key -> users._id
- `items` (array) - Danh sách sản phẩm trong giỏ
  - `productId` (string) - product.id
  - `quantity` (number)
  - `color` (string)
  - `size` (string)
  - `price` (number) - Giá tại thời điểm thêm
- `totalPrice` (number) - Tổng tiền
- `createdAt` (Date)
- `updatedAt` (Date)

**Lý do:** Để người dùng có thể xem lại giỏ hàng đã lưu

---

### 4. **orders** - Đơn hàng (BẮT BUỘC) ⭐
- `_id` (ObjectId) - Primary Key
- `orderId` (string) - Mã đơn hàng duy nhất (ORD-20251102-001)
- `userId` (ObjectId) - Foreign Key -> users._id
- `items` (array) - Chi tiết sản phẩm trong đơn
  - `productId` (string)
  - `productName` (string)
  - `quantity` (number)
  - `color` (string)
  - `size` (string)
  - `price` (number) - Giá tại thời điểm đặt
  - `subtotal` (number) - quantity * price
- `customerInfo` (object)
  - `name` (string)
  - `email` (string)
  - `phone` (string)
  - `address` (string)
  - `ward` (string) - Phường
  - `district` (string) - Quận
  - `city` (string) - Thành phố
- `totalPrice` (number) - Tổng tiền hàng
- `shippingCost` (number) - Phí giao hàng
- `totalAmount` (number) - Tổng thanh toán (totalPrice + shippingCost)
- `status` (string) - pending | confirmed | shipped | delivered | cancelled
- `paymentId` (ObjectId) - Foreign Key -> payments._id
- `paymentMethod` (string) - cod | bank_transfer | credit_card
- `paymentStatus` (string) - pending | paid | failed
- `notes` (string) - Ghi chú từ khách
- `createdAt` (Date) - Ngày đặt hàng
- `updatedAt` (Date)

**Lý do:** Lưu trữ tất cả thông tin đơn hàng, theo dõi trạng thái

---

### 5. **payments** - Thanh toán (BẮT BUỘC) ⭐
- `_id` (ObjectId) - Primary Key
- `paymentId` (string) - Mã thanh toán duy nhất (PAY-20251102-001)
- `orderId` (ObjectId) - Foreign Key -> orders._id
- `userId` (ObjectId) - Foreign Key -> users._id
- `amount` (number) - Số tiền thanh toán
- `method` (string) - cod | bank_transfer | credit_card
- `status` (string) - pending | completed | failed | refunded
- `transactionId` (string) - Mã giao dịch (từ payment gateway)
- `bankInfo` (object) - Chỉ khi method = bank_transfer
  - `bankName` (string)
  - `accountNumber` (string)
  - `accountHolder` (string)
- `cardInfo` (object) - Chỉ khi method = credit_card (KHÔNG lưu full, chỉ lưu last 4 digits)
  - `lastFourDigits` (string)
  - `cardholderName` (string)
- `notes` (string)
- `createdAt` (Date)
- `updatedAt` (Date)

**Lý do:** Lưu trữ chi tiết thanh toán, lịch sử giao dịch, bảo mật thông tin thẻ

---

### 6. **order_history** - Lịch sử trạng thái (Tùy chọn)
- `_id` (ObjectId) - Primary Key
- `orderId` (ObjectId) - Foreign Key -> orders._id
- `status` (string) - Trạng thái mới
- `changedBy` (string) - admin | system
- `note` (string) - Lý do thay đổi
- `createdAt` (Date)

**Lý do:** Theo dõi lịch sử thay đổi trạng thái đơn hàng

---

## Sơ Đồ Quan Hệ

```
┌─────────────┐
│   users     │
├─────────────┤
│ _id (PK)    │◄──────────────────┐
│ email       │                   │
│ name        │                   │
│ phone       │                   │
│ address     │                   │
│ role        │                   │
└─────────────┘                   │
                                  │
                    ┌─────────────┴──────────────┐
                    │                           │
                    │                           │
            ┌───────▼─────────┐        ┌────────▼─────────┐
            │     orders      │        │   payments       │
            ├─────────────────┤        ├──────────────────┤
            │ _id (PK)        │        │ _id (PK)         │
            │ orderId         │        │ paymentId        │
            │ userId (FK)     │◄───────│ orderId (FK)     │
            │ items[] ────────┼─────┐  │ userId (FK)      │
            │ totalAmount     │     │  │ amount           │
            │ status          │     │  │ method           │
            │ paymentId (FK)  │     │  │ status           │
            │ paymentStatus   │     │  │ transactionId    │
            │ createdAt       │     │  │ createdAt        │
            └─────────────────┘     │  └──────────────────┘
                    │               │
                    │               │
                    └───────────────┤
                                    │
                          ┌─────────▼─────────┐
                          │    products       │
                          ├───────────────────┤
                          │ _id (PK)          │
                          │ id (prod_001)     │
                          │ name              │
                          │ price             │
                          │ colors[]          │
                          │ sizes[]           │
                          │ stock             │
                          │ image             │
                          └───────────────────┘
                          
┌──────────────────┐
│     carts        │
├──────────────────┤
│ _id (PK)         │
│ userId (FK)      │◄─────────┐ (Tùy chọn, để người dùng
│ items[]          │          │  xem lại giỏ hàng)
│ totalPrice       │          │
│ createdAt        │          │
└──────────────────┘
```

---

## Quy Trình Đặt Hàng & Thanh Toán

```
1. USER BROWSE PRODUCTS
   ├─ GET /api/products

2. USER ADD TO CART (Frontend)
   ├─ POST /api/carts
   └─ Save to carts collection

3. USER VIEW CART
   ├─ GET /api/carts/:userId

4. USER CHECKOUT
   ├─ POST /api/orders (Create Order)
   ├─ Insert into orders collection
   ├─ Clear user's cart
   └─ Response: orderId

5. USER SELECT PAYMENT METHOD
   ├─ Display payment options:
   │  ├─ Cash on Delivery (COD)
   │  ├─ Bank Transfer
   │  └─ Credit Card

6. USER PROCESS PAYMENT
   ├─ POST /api/payments
   ├─ Insert into payments collection
   ├─ Update order.paymentStatus
   └─ Response: transactionId

7. PAYMENT GATEWAY CALLBACK (tùy chọn)
   ├─ Verify payment success
   ├─ PATCH /api/orders/:orderId/status
   └─ Update order.status = "confirmed"

8. ADMIN VIEW ORDERS
   ├─ GET /api/orders?status=pending
   ├─ GET /api/orders/:orderId
   └─ PATCH /api/orders/:orderId/status

9. USER TRACK ORDER
   ├─ GET /api/orders/:orderId
   └─ Display order status
```

---

## Thay Đổi So Với Cấu Trúc Hiện Tại

### ✅ Đã có:
- `users` collection
- `products` collection
- `carts` collection (tuy chưa save vào DB)
- `orders` collection (tuy chưa save vào DB)
- `payments` collection (tuy chưa save vào DB)

### 🔧 Cần cập nhật:

1. **orders schema** - Thêm các field:
   - `orderId` (mã đơn hàng)
   - `customerInfo` (thông tin khách)
   - `shippingCost` (phí ship)
   - `paymentId` (liên kết payment)

2. **payments schema** - Cần sửa:
   - Thêm `paymentId` (mã thanh toán duy nhất)
   - Thêm `method` (phương thức thanh toán)
   - Thêm `transactionId` (mã giao dịch)
   - Bỏ thông tin thẻ đầy đủ (chỉ lưu 4 số cuối)

3. **API endpoints** cần implement:
   - POST `/api/carts` - Thêm giỏ hàng vào DB
   - POST `/api/orders` - Tạo đơn hàng
   - POST `/api/payments` - Xử lý thanh toán
   - PATCH `/api/orders/:orderId/status` - Cập nhật trạng thái

4. **Frontend logic**:
   - Lưu giỏ hàng vào DB thay vì chỉ localStorage
   - Gửi thông tin đặt hàng lên backend
   - Xử lý payment response

---

## Kết Luận

Cho chức năng **Đặt Hàng & Thanh Toán**, bạn cần:

| Bảng | Bắt Buộc | Ghi Chú |
|------|----------|--------|
| **users** | ✅ CÓ | Lưu thông tin khách, địa chỉ |
| **products** | ✅ CÓ | Tham chiếu giá, tên sản phẩm |
| **carts** | ⚠️ Tùy chọn | Nếu muốn lưu giỏ hàng về sau |
| **orders** | ✅ PHẢI CÓ | Lưu thông tin đơn hàng |
| **payments** | ✅ PHẢI CÓ | Lưu chi tiết thanh toán |
| **order_history** | ⚠️ Tùy chọn | Nếu muốn theo dõi lịch sử |

**Đề xuất:** Bắt đầu implement `orders` → `payments` → `carts` (save to DB) → APIs
