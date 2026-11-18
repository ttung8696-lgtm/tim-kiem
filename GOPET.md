# GoPet HD — bản Windows

[Tải goPetHD.zip từ GitHub](downloads/goPetHD.zip?raw=true)

1. Tải ZIP về máy Windows và giải nén toàn bộ vào cùng một thư mục.
2. Mở `GoPet.Unity.exe` trong thư mục đã giải nén. Giữ nguyên `GoPet.Unity_Data` và các tệp DLL đi kèm.

Đây là bản Unity cho Windows, không chạy trực tiếp trong trình duyệt. ZIP được giữ nguyên từ tệp nguồn; chưa kiểm thử việc khởi động hoặc kết nối trong game trên Windows.

SHA-256: `4687056c3ce83f5c3c57d37c070382426858fffae5ad34b002913b88123f37db`

## Bản chơi trên trình duyệt

Mã nguồn bản web độc lập nằm trong `docs/`. Đây là bản làm lại lấy cảm hứng từ GoPet, không phải bản WebGL của game gốc. Người chơi có thể chăm sóc, luyện tập và tiến hóa thú cưng, chiến đấu theo lượt và làm nhiệm vụ. Tiến độ được lưu cục bộ trong trình duyệt; không có tài khoản, kết nối máy chủ gốc hoặc chế độ nhiều người chơi.

Để chạy tại máy: `python -m http.server 8000 --directory docs`, rồi mở `http://localhost:8000`. Chạy kiểm thử bằng `node --test tests/game.test.mjs` (Node.js 18+).
