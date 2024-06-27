const { firebaseApp } = require('../services/firebase');

class UserController {
  async getPersonUsers(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('users').where('role', '==', 'person').get();
      const users = snapshot.docs.map(doc => doc.data());
      res.render('user/person', { users });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async getCollectorUser(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('users').where('role', '==', 'collector').get();
      const users = snapshot.docs.map(doc => doc.data());
      res.render('user/collector', { users });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async getAllUsers(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('users').get();
      const users = snapshot.docs.map(doc => doc.data());
      res.render('user/person', { users });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async unbanPerson(req, res){
    const personId = req.params.id;
    try {
      await firebaseApp.firestore().collection('users').doc(personId).update({ status: 'active' });
      res.redirect('/users/person');
      res.status(200).send('Person unbanned successfully.');
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async banPerson(req, res){
    const personId = req.params.id;
    try {
      await firebaseApp.firestore().collection('users').doc(personId).update({ status: 'banned' });
      res.redirect('/users/person');
      res.status(200).send('Person banned successfully.');
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async unbanCollector(req, res){
    const personId = req.params.id;
    try {
      await firebaseApp.firestore().collection('users').doc(personId).update({ status: 'active' });
      res.redirect('/users/collector');
      res.status(200).send('Collector unbanned successfully.');
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async banCollector(req, res){
    const personId = req.params.id;
    try {
      await firebaseApp.firestore().collection('users').doc(personId).update({ status: 'banned' });
      res.redirect('/users/collector');
      res.status(200).send('Collector banned successfully.');
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

}

module.exports = new UserController();