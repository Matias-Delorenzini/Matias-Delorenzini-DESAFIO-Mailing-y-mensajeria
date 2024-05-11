export default class ProductsRepository {
    constructor (dao){
        this.dao = dao;
    }

    updateStock = async (id, boughtQuantity) => {
        let result = await this.dao.put(id, boughtQuantity);
        return result;
    }

    getProductById = async (id) => {
        let result =await this.dao.getOne(id)
        return result
    }
}