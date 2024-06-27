const { firebaseApp } = require('../services/firebase');
const moment = require('moment');

class DashboardController {
    // Route GET /login
    async index(req, res) {
        try {
            const currentDate = new Date();
            const wasteTypes = [
                'glass_waste',
                'hazardous_waste',
                'household_waste',
                'organic_waste',
                'recyclable_waste'
            ];
            
            const [classifiedSnapshot, feedbackSnapshot, userSnapshot, postSnapshot, wasteCollectionSnapshot] = await Promise.all([
                firebaseApp.firestore().collection('classified_waste').get(),
                firebaseApp.firestore().collection('feedback_waste').get(),
                firebaseApp.firestore().collection('users').get(),
                firebaseApp.firestore().collection('posts').get(),
                firebaseApp.firestore().collection('waste_collection_history').get()
            ]);

            const classifiedData = classifiedSnapshot.docs.map(doc => doc.data());
            const feedbackData = feedbackSnapshot.docs.map(doc => doc.data());
            const userData = userSnapshot.docs.map(doc => doc.data());
            const postData = postSnapshot.docs.map(doc => doc.data());
            const wasteCollectionData = wasteCollectionSnapshot.docs.map(doc => doc.data());

            const wasteTypeCounts = {};

            // Thống kê số lượng của mỗi loại wasteType trong classified_waste
            classifiedData.forEach(doc => {
                const wasteType = doc.wasteType;
                if (wasteTypeCounts[wasteType]) {
                    wasteTypeCounts[wasteType]++;
                } else {
                    wasteTypeCounts[wasteType] = 1;
                }
            });

            // Thống kê số lượng của mỗi loại wasteType trong feedback_waste
            feedbackData.forEach(doc => {
                const wasteType = doc.wasteType;
                if (wasteTypeCounts[wasteType]) {
                    wasteTypeCounts[wasteType]++;
                } else {
                    wasteTypeCounts[wasteType] = 1;
                }
            });

            // Tính tổng số lượng tài liệu trong hai bộ sưu tập
            const classifiedCount = classifiedData.length;
            const feedbackCount = feedbackData.length;
            const totalCount = classifiedCount + feedbackCount;

            // Số lượng người dùng
            const userCount = userData.length;

            // Lọc ra số lượng người dùng mới trong vòng 24 giờ gần nhất
            const now = moment(); // Thời điểm hiện tại
            const newUserCount = userData.filter(user => {
                const createdAt = moment(user.createdAt, 'YYYY-MM-DD HH:mm:ss.SSSSSS'); // Chuyển đổi createdAt thành đối tượng moment
                return now.diff(createdAt, 'hours') < 24; // Lọc ra những người dùng được tạo trong vòng 24 giờ gần nhất
            }).length;

            // Lọc ra số lượng bài đăng mới trong ngày và tổng số lượng bài đăng trong collection "posts"
            const today = now.startOf('day'); // Bắt đầu của ngày hiện tại
            const newPostCount = postData.filter(post => {
                const createdAt = moment(post.createdAt, 'YYYY-MM-DD HH:mm:ss.SSSSSS'); // Chuyển đổi createdAt thành đối tượng moment
                return createdAt.isSameOrAfter(today); // Lọc ra những bài đăng được tạo trong ngày
            }).length;
            const totalPostCount = postData.length;

            // Tính tổng số tiền trong trường "fee"
            const totalFee = wasteCollectionData.reduce((acc, cur) => acc + cur.fee, 0);

            // Định dạng tổng số tiền với phân cách hàng nghìn và đơn vị "VND"
            const formattedTotalFee = totalFee.toLocaleString('vi-VN').replace('₫', '');
            // Tính tổng số lượng rác thải trong trường "weigh"
            const totalWeigh = wasteCollectionData.reduce((acc, cur) => acc + cur.weigh, 0);

            const newWasteCount = classifiedData.reduce((count, doc) => {
                const createdAt = moment(doc.createdAt, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
                if (now.diff(createdAt, 'hours') < 24) {
                  count++;
                }
                return count;
              }, 0) + feedbackData.reduce((count, doc) => {
                const createdAt = moment(doc.createdAt, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
                if (now.diff(createdAt, 'hours') < 24) {
                  count++;
                }
                return count;
              }, 0);

              
            const wasteTypeWeights = wasteTypes.reduce((weights, wasteType) => {
                const matchingDocs = wasteCollectionData.filter(doc => doc.wasteType === wasteType);
                const totalWeight = matchingDocs.reduce((total, doc) => total + doc.weigh, 0);
                weights[wasteType] = Number(totalWeight.toFixed(2)) || 0;
                return weights;
              }, {});

            const newWasteTypeWeights = wasteTypes.reduce((weights, wasteType) => {
            const matchingDocs = wasteCollectionData.filter(
                doc => doc.wasteType === wasteType && isSameDay(new Date(doc.createdAt), currentDate)
            );
            const totalWeight = matchingDocs.reduce((total, doc) => total + doc.weigh, 0);
            weights[wasteType] = Number(totalWeight.toFixed(2)) || 0;
            return weights;
            }, {});

            function isSameDay(date1, date2) {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
            }

            // Tính tổng trọng lượng rác mới trong ngày
            const newTotalWeigh = wasteCollectionData.reduce((total, doc) => {
                const createdAt = new Date(doc.createdAt);
                if (isSameDay(createdAt, currentDate)) {
                total += doc.weigh;
                }
                return total;
            }, 0);
            
            // Tính tổng phí mới trong ngày
            const newTotalFee = wasteCollectionData.reduce((total, doc) => {
                const createdAt = new Date(doc.createdAt);
                if (isSameDay(createdAt, currentDate)) {
                total += doc.fee;
                }
                return total;
            }, 0);

            const totalTransaction = wasteCollectionData.length;

            const newTotalTransaction = wasteCollectionData.reduce((count, doc) => {
            const createdAt = new Date(doc.createdAt);
            if (isSameDay(createdAt, currentDate)) {
                count++;
            }
            return count;
            }, 0);

            const last7DaysFee = [];
            const sevenDaysAgo = moment().subtract(7, 'days');

            for (let i = 0; i < 7; i++) {
            const currentDate = moment().subtract(i, 'days').startOf('day');
            const dailyFee = wasteCollectionData
                .filter(doc => moment(doc.createdAt).isSame(currentDate, 'day'))
                .reduce((acc, cur) => acc + cur.fee, 0);
            last7DaysFee.push(dailyFee);
            }

            // Tạo một mảng để lưu thông tin về số lượng người dùng "person" và "collector" cho mỗi ngày trong 7 ngày gần nhất
            const last7DaysUserCounts = [];

            // Duyệt qua mỗi ngày trong 7 ngày gần nhất
            for (let i = 0; i < 7; i++) {
                // Lấy ngày hiện tại trừ đi số ngày i để có được ngày trong quá khứ
                const currentDate = moment().subtract(i, 'days').startOf('day');
                
                // Lọc ra các người dùng được tạo trong ngày đó
                const usersCreatedOnDay = userData.filter(user => {
                    const createdAt = moment(user.createdAt, 'YYYY-MM-DD HH:mm:ss.SSSSSS'); 
                    return createdAt.isSame(currentDate, 'day');
                });
                
                // Đếm số lượng người dùng có vai trò "person" và "collector"
                const personCount = usersCreatedOnDay.filter(user => user.role === 'person').length;
                const collectorCount = usersCreatedOnDay.filter(user => user.role === 'collector').length;
                
                // Thêm thông tin về số lượng người dùng "person" và "collector" cho ngày hiện tại vào mảng
                last7DaysUserCounts.push({ date: currentDate, personCount, collectorCount });
            }



            res.render('home', { 
                totalCount,
                classifiedCount,
                feedbackCount,
                wasteTypeCounts,
                userCount,
                newUserCount,
                totalPostCount,
                newPostCount,
                totalFee: formattedTotalFee,
                totalWeigh,
                newWasteCount,
                wasteTypeWeights,
                newWasteTypeWeights,
                newTotalWeigh,
                newTotalFee,
                totalTransaction,
                newTotalTransaction,
                last7DaysFee: last7DaysFee.reverse(),
                day1: last7DaysFee[0],
                day2: last7DaysFee[1],
                day3: last7DaysFee[2],
                day4: last7DaysFee[3],
                day5: last7DaysFee[4],
                day6: last7DaysFee[5],
                day7: last7DaysFee[6],
                user1: last7DaysUserCounts[6].personCount,
                user2: last7DaysUserCounts[5].personCount,
                user3: last7DaysUserCounts[4].personCount,
                user4: last7DaysUserCounts[3].personCount,
                user5: last7DaysUserCounts[2].personCount,
                user6: last7DaysUserCounts[1].personCount,
                user7: last7DaysUserCounts[0].personCount,
                collector1: last7DaysUserCounts[6].collectorCount,
                collector2: last7DaysUserCounts[5].collectorCount,
                collector3: last7DaysUserCounts[4].collectorCount,
                collector4: last7DaysUserCounts[3].collectorCount,
                collector5: last7DaysUserCounts[2].collectorCount,
                collector6: last7DaysUserCounts[1].collectorCount,
                collector7: last7DaysUserCounts[0].collectorCount,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new DashboardController;
