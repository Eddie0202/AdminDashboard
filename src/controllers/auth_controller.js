const { firebaseApp } = require('../services/firebase');
class AuthController {
    // Route GET /login
    index(req, res) {
        res.render('auth/login');
    }

    // Route POST /login
    async loginSubmit(req, res) {
        const { email, password } = req.body;
        await firebaseApp.auth().signInWithEmailAndPassword(email, password).then(async function (value) {
                const user = await firebaseApp.firestore().collection('users').doc(value.user.uid).get()
                if(user.exists){
                    if(user.data().role == "admin"){
                        req.session.isLoggedIn = true;
                        req.session.userId = value.user.uid;
                        req.session.userName = user.data().name;
                        res.redirect('/');
                    }else{
                        res.status(500).render('auth/login', { message: "Permission denied"});
                    }
                }else{
                    res.status(500).render('auth/login', { message: "Invalid email or password"});
                }
            })
            .catch(function (error) {
                // Handle Errors here.
                res.status(500).render('auth/login', { message: "Invalid email or password"});
                console.log(error);
            })
    }

    // Route GET /logout
    async logout(req, res) {
        // try {
        //     await users.deleteSession(req.session.userId, req.session.sessionId);
        //     req.session.isLoggedIn = false;
        //     req.session.sessionId = null;
        //     req.session.userId = null;
        //     res.status(200).send('Logout successful');
        // } catch (error) {
        //     res.status(500).send(error.message);
        // }

        try {
            await firebaseApp.auth().signOut();
            // Xóa session
            req.session.destroy(function(err) {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect('/auth');
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new AuthController;
