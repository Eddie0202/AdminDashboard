const loginRouter = require('./auth_route')
const dashboardRouter = require('./dashboard_route')
const postRouter = require('./post_route')
const userRouter = require('./user_route')
const wasteRouter = require('./waste_route')
const wastesTypeRouter = require('./wastes_type_route')
const bannerRouter = require('./banner_route')
const wastedataRouter = require('./wastedata_route')
const { isLoggedIn, isLoggedSS } = require('../middlewares/login_middleware');

function route(app) {
    app.use('/auth',isLoggedSS, loginRouter);
    app.use('/', isLoggedIn,  dashboardRouter);
    app.use('/posts', isLoggedIn, postRouter);
    app.use('/users', isLoggedIn, userRouter);
    app.use('/wastes', isLoggedIn, wasteRouter);
    app.use('/waste-type', isLoggedIn, wastesTypeRouter);
    app.use('/banners', isLoggedIn, bannerRouter);
    app.use('/waste-data', isLoggedIn, wastedataRouter);
   // app.use('/auth',isLoggedIn, loginRouter);
}
module.exports = route;
