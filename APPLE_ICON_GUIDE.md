# Apple Touch Icon Guide (theo chuẩn Apple)

Theo tài liệu chính thức của Apple, cần tạo các icon PNG với kích thước:

## Kích thước cần tạo:
- **180x180px** - iPhone Retina (ưu tiên cao nhất)
- **167x167px** - iPad Retina
- **152x152px** - iPad
- **120x120px** - fallback (tùy chọn)

## Cách tạo nhanh:

### Online (Khuyên dùng):
1. Vào https://favicon.io/favicon-converter/
2. Upload `favicon.svg`
3. Tạo các size: 180x180, 167x167, 152x152
4. Download và đổi tên:
   - `apple-touch-icon.png` (180x180 - mặc định)
   - `apple-touch-icon-180x180.png`
   - `apple-touch-icon-167x167.png`
   - `apple-touch-icon-152x152.png`

### Hoặc dùng CloudConvert:
- Vào https://cloudconvert.com/svg-to-png
- Upload favicon.svg
- Convert từng size một

## Đặt file:
Đặt tất cả file PNG vào root folder (cùng cấp với index.html)

## Lưu ý:
- iOS 7+ không thêm hiệu ứng vào icon nữa (không cần -precomposed)
- File phải là PNG, không nên dùng SVG
- Nếu không có đúng size, iOS sẽ tự scale (nhưng có thể mờ)
- Ưu tiên 180x180 vì đây là size iPhone hiện tại
