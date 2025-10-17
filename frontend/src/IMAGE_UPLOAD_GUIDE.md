# Hướng Dẫn Upload Ảnh Sản Phẩm

## Tính năng

Admin có thể upload ảnh sản phẩm với các tính năng:

### ✅ Upload & Crop Ảnh
- Upload ảnh từ máy tính (PNG, JPG, JPEG)
- Giới hạn kích thước: 5MB
- Tự động crop ảnh về tỷ lệ 1:1 (vuông)
- Điều chỉnh zoom để fit ảnh hoàn hảo
- Preview ảnh real-time

### ✅ Tự động tối ưu
- Resize ảnh về 800x800px
- Nén ảnh với chất lượng 90%
- Lưu dưới dạng JPEG để giảm dung lượng
- Lưu trữ base64 trong localStorage

## Cách sử dụng

### 1. Thêm sản phẩm mới
1. Vào **Admin Dashboard** → **Sản Phẩm**
2. Click **Thêm Sản Phẩm**
3. Click **Tải Ảnh Lên**
4. Chọn ảnh từ máy tính
5. Điều chỉnh khung crop và zoom
6. Click **Áp Dụng**
7. Điền thông tin sản phẩm khác
8. Click **Thêm Mới**

### 2. Sửa ảnh sản phẩm
1. Click **Sửa** trên sản phẩm
2. Click **Đổi ảnh** trên preview
3. Chọn ảnh mới và crop
4. Click **Cập Nhật**

### 3. Tips cho ảnh đẹp
- ✅ Chọn ảnh có độ phân giải cao (tối thiểu 800x800px)
- ✅ Ảnh sáng, rõ nét, không bị mờ
- ✅ Sản phẩm ở giữa khung hình
- ✅ Background đơn giản, không rối mắt
- ⚠️ Tránh ảnh quá tối hoặc quá sáng
- ⚠️ Tránh ảnh bị nghiêng

## Công nghệ

### Frontend
- **react-easy-crop**: Library crop ảnh professional
- **HTML Canvas**: Xử lý và resize ảnh
- **Base64 encoding**: Lưu ảnh trong localStorage

### Storage
- Ảnh được lưu dưới dạng base64 string
- Tích hợp với ProductsContext
- Sync real-time với UI

## Lưu ý kỹ thuật

### Giới hạn
- Max file size: 5MB
- Output size: 800x800px
- Format: JPEG (90% quality)
- Aspect ratio: 1:1 (vuông)

### Performance
- Ảnh được nén tự động
- Base64 encoding cho dễ lưu trữ
- Không cần server upload
- Hoạt động offline

### Browser Support
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## Troubleshooting

### Ảnh không hiển thị?
- Check console log
- Thử ảnh khác
- Clear localStorage và thử lại

### Ảnh bị vỡ/mờ?
- Chọn ảnh có resolution cao hơn
- Zoom out một chút khi crop
- Đảm bảo ảnh gốc > 800px

### Upload chậm?
- File size quá lớn (>5MB)
- Thử resize ảnh trước khi upload
- Check network connection
