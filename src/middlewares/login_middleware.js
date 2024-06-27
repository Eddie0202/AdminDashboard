// Middleware kiểm tra đăng nhập
function isLoggedIn(req, res, next) {
    if (req.session.isLoggedIn) {
        // Nếu đã đăng nhập, tiếp tục chạy các middleware hoặc route tiếp theo
        next();
    } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        res.redirect('auth/login');
    }
}
// Middleware kiểm tra đăng nhập
function isLoggedSS(req, res, next) {
    // Kiểm tra nếu đang ở route '/auth/logout'
    if (req.originalUrl === 'auth/logout') {
        // Cho phép đi tiếp
        next();
    } else {
        // Kiểm tra trạng thái đăng nhập
        if (req.session.isLoggedIn) {
            // Nếu đã đăng nhập, chuyển hướng đến '/'
            res.redirect('/');
        } else {
            // Nếu chưa đăng nhập, tiếp tục xử lý middleware tiếp theo
            next();
        }
    }
}

module.exports = { isLoggedIn, isLoggedSS };