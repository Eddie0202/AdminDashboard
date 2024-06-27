const { firebaseApp } = require('../services/firebase');
const { Web3 } = require('web3');
const moment = require('moment'); // Import moment.js library
const contractABI = require('../blockchain/WasteTracking.json');
const contractAddress = '0x3c38E6eDFDD919431AD0535780d37ae2b361eD96';
const rpcUrl = "https://sepolia.infura.io/v3/6e8f013894b8423595e483eb97c9c54f";
const fs = require('fs');

class WasteDataController {
    async index(req, res) {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            contract.methods.getAllTrash().call()
                .then(async result => {
                    const formattedResult = await Promise.all(result.map(async trash => {
                        const personId = trash.personId;
                        const collectionId = trash.collectionId;
    
                        // Retrieve user documents from Firebase Firestore
                        const personDocRef = firebaseApp.firestore().collection('users').doc(personId);
                        const collectionDocRef = firebaseApp.firestore().collection('users').doc(collectionId);
    
                        // Check if the person document exists
                        const personDocSnapshot = await personDocRef.get();
                        if (!personDocSnapshot.exists) {
                            console.error(`Person document with ID ${personId} does not exist`);
                            return null;
                        }
    
                        // Check if the collection document exists
                        const collectionDocSnapshot = await collectionDocRef.get();
                        if (!collectionDocSnapshot.exists) {
                            console.error(`Collection document with ID ${collectionId} does not exist`);
                            return null;
                        }
    
                        // Extract the name values from the user documents
                        const personName = personDocSnapshot.data().name;
                        const collectionName = collectionDocSnapshot.data().name;
    
                        // Split location into latitude and longitude
                        const [latitude, longitude] = trash.location.split(':');
    
                        // Convert latitude and longitude to numbers and format them
                        const lat = Number(latitude).toFixed(7); // Round to 7 decimal places
                        const lng = Number(longitude).toFixed(7); // Round to 7 decimal places
    
                        // Create formatted location string
                        const formattedLocation = `[${lat}° N, ${lng}° E]`;
    
                        // Generate Google Maps link
                        const ggMapLink = `https://www.google.com/maps?q=${lat},${lng}`;
    
                        // Format createdAt using moment.js
                        const formattedCreatedAt = moment(Number(trash.createdAt) * 1000).format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    
                        return {
                            id: trash.id,
                            personId: trash.personId,
                            personName: personName,
                            collectionId: trash.collectionId,
                            collectionName: collectionName,
                            wasteType: trash.wasteType,
                            location: trash.location,
                            formattedLocation: formattedLocation,
                            ggMapLink: ggMapLink,
                            fee: Number(trash.fee),
                            weigh: Number(trash.weigh),
                            status: trash.status,
                            createdAt: formattedCreatedAt
                        };
                    }));
    
                    // Filter out null values from the formatted result
                    const filteredResult = formattedResult.filter(item => item !== null);
    
                    //console.log("All trash:", filteredResult);
    
                    // Render the website with data from the smart contract
                    res.render('wastedata/index', { waste: filteredResult });
                })
                .catch(error => {
                    console.error("Error fetching all trash:", error);
                    res.status(500).send(error.message);
                });
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }
    
}

module.exports = new WasteDataController;
