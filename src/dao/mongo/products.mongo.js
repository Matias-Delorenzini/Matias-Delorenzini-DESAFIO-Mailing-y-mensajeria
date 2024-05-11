import ProductsModel from "../models/products.schema.js";

class Products {
    async put(id, boughtQuantity) {
        try {
            const updatedProduct = await ProductsModel.findOneAndUpdate(
                { _id: id },
                { $inc: { stock: -boughtQuantity } },
                { new: true }
            );

            if (!updatedProduct) {
                return { success: false, message: 'Producto no encontrado.' };
            }

            return { success: true, product: updatedProduct };
        } catch (error) {
            console.error('Error al actualizar el stock del producto:', error.message);
            return { success: false, message: 'Error al actualizar el stock del producto.' };
        }
    }

    async getOne(id) {
        try {
            const product = await ProductsModel.findById(id);
            if (!product) {
                return null;
            }
            return product;
        } catch (error) {
            console.error('Error al obtener el producto por ID:', error.message);
            throw error;
        }
    }
}

export default Products;
