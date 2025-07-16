// Mock implementation of the Server model
class MockServer {
    constructor(data) {
        this.serverId = data.serverId;
        this.npcs = data.npcs || [];
        this._id = data._id || 'mock_id';
    }

    static mockData = {
        findOneResult: null,
        saveError: null
    };

    static findOne(query) {
        return {
            then: (callback) => {
                return Promise.resolve(callback(MockServer.mockData.findOneResult));
            },
            exec: () => Promise.resolve(MockServer.mockData.findOneResult)
        };
    }

    async save() {
        if (MockServer.mockData.saveError) {
            throw MockServer.mockData.saveError;
        }
        return this;
    }

    // Helper methods for testing
    static setFindOneResult(result) {
        this.mockData.findOneResult = result;
    }

    static setSaveError(error) {
        this.mockData.saveError = error;
    }

    static clearMocks() {
        this.mockData.findOneResult = null;
        this.mockData.saveError = null;
    }
}

module.exports = { Server: MockServer };
