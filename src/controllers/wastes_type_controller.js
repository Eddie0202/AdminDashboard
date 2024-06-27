const { firebaseApp } = require('../services/firebase');
const { storage } = require('../services/appwrite_server');
const sdk = require("node-appwrite");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ storage: multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/uploads/'); // Lưu tệp tin vào thư mục public/uploads
    },
    filename: function (req, file, cb) {
        // Tạo tên tệp tin mới bằng cách thêm dấu thời gian vào tên gốc
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Lấy phần mở rộng của tệp tin
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Sử dụng tên tệp tin mới
    }
}) }); // Định nghĩa đường dẫn thư mục lưu trữ tệp tin tải lên

class WasteController {
  async getWasteTypes(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('waste_types').get();
      const wasteTypes = snapshot.docs.map(doc => doc.data());
      res.render('wastes_type/index', { wasteTypes });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
  async createWasteTypeIndex(req, res) {
    res.render('wastes_type/add');
  }

  async addNewWasteType(req, res) {
    upload.single('image')(req, res, async function (err) {
      try {
        //Lấy datetime theo định dạng YYYY-MM-DD HH:mm:ss.SSSSSS
        const currentTimeStamp = Date.now();
        const currentDate = new Date(currentTimeStamp);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(currentDate.getMilliseconds()).padStart(3, '0');
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

        const { name, content } = req.body;
        const filePath = await req.file['path'];
        const fileName = await req.file['filename'];
  
        const storageImage = storage.createFile(process.env.APPWRITE_IMAGE_BUCKET, sdk.ID.unique(), sdk.InputFile.fromPath(filePath, fileName));
  
        storageImage.then(async function (imageInfo) {
          const imageUrl = `${process.env.APPWRITE_URL}/storage/buckets/${process.env.APPWRITE_IMAGE_BUCKET}/files/${imageInfo.$id}/view?project=${process.env.APPWRITE_PROJECT}`;
          const wastetype = {
            name,
            content,
            createdAt: formattedDateTime,
            imgLink: imageUrl,
          };
  
          const docRef = firebaseApp.firestore().collection('waste_types').doc(); // Tạo một tham chiếu tài liệu mới mà không chỉ định id
          const wasteTypeId = docRef.id; // Lấy giá trị id của tài liệu vừa tạo
  
          docRef.set(wastetype) // Thêm dữ liệu vào tài liệu
            .then(() => {
              // Cập nhật trường id với giá trị id của tài liệu
              return docRef.update({ id: wasteTypeId });
            })
            .then(() => {
              // Cập nhật thành công
              fs.unlink(req.file.path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return;
                }
                console.log('File deleted successfully');
              });
              res.redirect('/waste-type');
            })
            .catch((error) => {
              // Xử lý lỗi khi cập nhật
              console.log(error);
              res.status(500).send(error.message);
            });
        }).catch(function (error) {
          console.log(error);
          res.status(500);
        });
      } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
      }
    });
  }

  async getWasteTypeById(req, res) {
    try {
      const wasteTypeId = req.params.id;
      const wasteTypeDoc = await firebaseApp.firestore().collection('waste_types').doc(wasteTypeId).get(); // Lấy document theo id

      if (wasteTypeDoc.exists) {
        const wastetype = wasteTypeDoc.data(); // Chuyển đổi document thành dữ liệu JSON

        res.render('wastes_type/update', { wastetype }); // Truyền dữ liệu document vào view
      } else {
        res.status(404).send('Document not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

  async updateWasteType(req, res) {
    upload.single('image')(req, res, async function (err) {
      try {
        const { name, content } = req.body;
        const wasteTypeId = req.params.id; // Lấy id của bài viết cần cập nhật từ req.params
  
        let wasteType = {
          name,
          content,
        };
  
        if (req.file) {
          const filePath = await req.file.path;
          const fileName = await req.file.filename;
  
          const storageImage = storage.createFile(
            process.env.APPWRITE_IMAGE_BUCKET,
            sdk.ID.unique(),
            sdk.InputFile.fromPath(filePath, fileName)
          );
  
          const imageInfo = await storageImage;
          const imageUrl = `${process.env.APPWRITE_URL}/storage/buckets/${process.env.APPWRITE_IMAGE_BUCKET}/files/${imageInfo.$id}/view?project=${process.env.APPWRITE_PROJECT}`;
  
          wasteType.imgLink = imageUrl;
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
              return;
            }
            console.log('File deleted successfully');
          });
        }
  
        const docRef = firebaseApp.firestore().collection('waste_types').doc(wasteTypeId);
  
        docRef
          .update(wasteType)
          .then(() => {
            // Cập nhật thành công
            res.redirect('/waste-type');
          })
          .catch((error) => {
            // Xử lý lỗi khi cập nhật
            console.log(error);
            res.status(500).send(error.message);
          });
      } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
      }
    });
  }

  async delete(req, res) {
    try {
      const wasteTypeId = req.params.id; // Lấy id của bài viết cần xóa từ req.params
  
      // Xóa bài viết từ cơ sở dữ liệu
      const docRef = firebaseApp.firestore().collection('waste_types').doc(wasteTypeId);
      await docRef.delete();
  
      // Xóa tệp tin ảnh liên quan (nếu có)
      const post = req.body;
      if (post.imgLink) {
        const imageUrl = post.imgLink;
        const fileId = imageUrl.split('/').pop(); // Lấy id của tệp tin từ URL
  
        const storageFile = storage.getFile(
          process.env.APPWRITE_IMAGE_BUCKET,
          fileId
        );
        await storageFile.delete();
      }
  
      res.redirect('/waste-type');
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }


}

module.exports = new WasteController();