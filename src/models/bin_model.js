class BinModel {
    constructor(id, lat, lng, address, label, createdAt, updatedAt) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.address = address;
        this.label = label;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Phương thức để chuyển đối tượng Bin thành một đối tượng có thể được gửi qua mạng (JSON)
    toJSON() {
        return {
            id: this.id,
            lat: this.lat,
            lng: this.lng,
            address: this.address,
            label: this.label,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // Phương thức tạo một đối tượng Bin từ một đối tượng JSON
    static fromJson(json) {
        const { BinLat, BinLng, Address, label, $id, $createdAt, $updatedAt } = json;
        return new BinModel($id, BinLat, BinLng, Address, label, formatDateTime($createdAt), formatDateTime($updatedAt));
    }
    // Phương thức tạo một mảng các đối tượng Bin từ một mảng các đối tượng Map
    static fromMap(mapArray) {
        return mapArray.map(item => {
            const { BinLat, BinLng, Address, label, $id, $createdAt, $updatedAt } = item;
            return new BinModel($id, BinLat, BinLng, Address, label, formatDateTime($createdAt), formatDateTime($updatedAt));
        });
    }
}
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const formattedDateTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
    });
    return formattedDateTime;
}

// Export model Bin
module.exports = BinModel;
