const { firebaseApp } = require('../services/firebase');


class WasteController {
    async getClassifiedWaste(req, res) {
        try {
            const snapshot = await firebaseApp.firestore().collection('classified_waste').get();
            const classifiedWaste = snapshot.docs.map(doc => doc.data());
            res.render('waste/classified', { classifiedWaste });
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    }

  async getFeedbackWaste(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('feedback_waste').get();
      //const feedbackWaste = snapshot.docs.map(doc => doc.data());

      const feedbackWaste = snapshot.docs.map(doc => {
        const data = doc.data();
        const location = `[${data.location._lat}° N, ${Math.abs(data.location._long)}° ${data.location._long >= 0 ? 'E' : 'W'}]`;
        return { ...data, formattedLocation: location };
      });

      const promises = feedbackWaste.map(async (waste) => {
        const userId = waste.uid;
        const userSnapshot = await firebaseApp.firestore().collection('users').doc(userId).get();
        const user = userSnapshot?.data();
        const userName = user?.name ?? 'Unknown User';
        return { ...waste, uid: userName };
      });

      const feedbackWasteWithUserName = await Promise.all(promises);

      res.render('waste/feedback', { feedbackWaste: feedbackWasteWithUserName });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }

  async getTest(req, res) {
    try {
      const snapshot = await firebaseApp.firestore().collection('classified_waste').get();
      //const classifiedWaste = snapshot.docs.map(doc => doc.data());

      const classifiedWaste = snapshot.docs.map(doc => {
        const data = doc.data();
        const location = `[${data.location._lat}° N, ${Math.abs(data.location._long)}° ${data.location._long >= 0 ? 'E' : 'W'}]`;
        return { ...data, formattedLocation: location };
      });

      const promises = classifiedWaste.map(async (waste) => {
        const userId = waste.uid;
        const userSnapshot = await firebaseApp.firestore().collection('users').doc(userId).get();
        const user = userSnapshot?.data();
        const userName = user?.name ?? 'Unknown User';
        return { ...waste, uid: userName };
      });

      const classifiedWasteWithUserName = await Promise.all(promises);

      res.render('waste/classified', { classifiedWaste: classifiedWasteWithUserName });
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
}

module.exports = new WasteController();