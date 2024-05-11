export default class CartRepository {
    constructor (dao){
        this.dao = dao;
    }

    findCartByID = async (cartId) => {
        let result = await this.dao.getOne(cartId);
        return result;
    }

    removeProductFromCart = async(cartId, productId) => {
        let result = await this.dao.deleteElement(cartId, productId);
        return result;
    }

    addProductToCart = async(cartId, productId) => {
        let result = await this.dao.addElement(cartId, productId);
        return result;
    }

    increaseProductQuantity = async(cartId, productId, quantityToAdd) => {
        let result = await this.dao.increaseElementQuantity(cartId, productId, quantityToAdd);
        return result;
    }

    clearCart = async(cartId) => {
        let result = await this.dao.clear(cartId);
        return result;
    }

    createNewUserCart = async(id) => {
        let result = await this.dao.post(id);
        return result;
    }

    compareStock = async(cartId, productId, desiredQuantity) => {
        let result = await this.dao.compareStock(cartId, productId, desiredQuantity);
        return result;
    }

    updateStock = async(cartId, productId, newStockValue) => {
        let result = await this.dao.updateStock(cartId, productId, newStockValue);
        return result
    }
}