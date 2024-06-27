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



class PostController {
    async index(req, res) {
        try {
            //trả về 1 list post
            const promise = await firebaseApp.firestore().collection('posts').get()
            console.log(promise.docs)
            const posts = promise.docs.map(doc => doc.data());
            res.render('post/index', { posts });
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }
    async createIndex(req, res) {
        res.render('post/add');
    }

    async create(req, res) {
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

            const { title, shortDescription, postLink } = req.body;
            const filePath = await req.file['path'];
            const fileName = await req.file['filename'];
      
            const storageImage = storage.createFile(process.env.APPWRITE_IMAGE_BUCKET, sdk.ID.unique(), sdk.InputFile.fromPath(filePath, fileName));
      
            storageImage.then(async function (imageInfo) {
              const imageUrl = `${process.env.APPWRITE_URL}/storage/buckets/${process.env.APPWRITE_IMAGE_BUCKET}/files/${imageInfo.$id}/view?project=${process.env.APPWRITE_PROJECT}`;
              const post = {
                createdAt: formattedDateTime,
                title,
                shortDescription,
                postLink,
                imgLink: imageUrl,
              };
      
              const docRef = firebaseApp.firestore().collection('posts').doc(); // Tạo một tham chiếu tài liệu mới mà không chỉ định id
              const postId = docRef.id; // Lấy giá trị id của tài liệu vừa tạo
      
              docRef.set(post) // Thêm dữ liệu vào tài liệu
                .then(() => {
                  // Cập nhật trường id với giá trị id của tài liệu
                  return docRef.update({ id: postId });
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
                  res.redirect('/posts');
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


    async getById(req, res) {
        try {
          const postId = req.params.id;
          const postDoc = await firebaseApp.firestore().collection('posts').doc(postId).get(); // Lấy document theo id
    
          if (postDoc.exists) {
            const post = postDoc.data(); // Chuyển đổi document thành dữ liệu JSON
    
            res.render('post/update', { post }); // Truyền dữ liệu document vào view
          } else {
            res.status(404).send('Document not found');
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }

      async update(req, res) {
        upload.single('image')(req, res, async function (err) {
          try {
            const { title, shortDescription, postLink } = req.body;
            const postId = req.params.id; // Lấy id của bài viết cần cập nhật từ req.params
      
            let post = {
              title,
              shortDescription,
              postLink,
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
      
              post.imgLink = imageUrl;
              fs.unlink(req.file.path, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  return;
                }
                console.log('File deleted successfully');
              });
            }
      
            const docRef = firebaseApp.firestore().collection('posts').doc(postId);
      
            docRef
              .update(post)
              .then(() => {
                // Cập nhật thành công
                res.redirect('/posts');
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
          const postId = req.params.id; // Lấy id của bài viết cần xóa từ req.params
      
          // Xóa bài viết từ cơ sở dữ liệu
          const docRef = firebaseApp.firestore().collection('posts').doc(postId);
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
      
          res.redirect('/posts');
        } catch (error) {
          console.log(error);
          res.status(500).send(error.message);
        }
      }
      
      

    
}
module.exports = new PostController;
