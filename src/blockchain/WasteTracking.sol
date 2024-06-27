pragma solidity >=0.4.22 <0.9.0;

contract WasteTracking {
    struct Trash {
        string id;
        string personId;
        string collectionId;
        string wasteType;
        string location;
        uint fee;
        uint weigh;
        string status;
        uint createdAt;
    }

    mapping(string => Trash) public trashData;
    string[] public trashIds;

    

    

    function getTrashInfo(string memory _id) public view returns (string memory, string memory, string memory, string memory, string memory, uint, uint, string memory, uint) {
        require(bytes(_id).length != 0, "Invalid trash ID");
        require(bytes(trashData[_id].id).length != 0, "Trash does not exist");

        Trash memory trash = trashData[_id];
        return (trash.id, trash.personId, trash.collectionId, trash.wasteType, trash.location, trash.fee, trash.weigh, trash.status, trash.createdAt);
    }

    function getAllTrash() public view returns (Trash[] memory) {
        Trash[] memory allTrash = new Trash[](trashIds.length);

        for (uint i = 0; i < trashIds.length; i++) {
            allTrash[i] = trashData[trashIds[i]];
        }

        return allTrash;
    }
}